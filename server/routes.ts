import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileValidationSchema, type InsertFile, type InsertTestCase } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateTestCases } from "./gemini";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Check file type middleware
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only specific file types
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Please upload PDF, DOCX, TXT, or MD files.'));
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Files API endpoints
  app.post('/api/files/upload', upload.array('files', 10), async (req: Request, res: Response) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const uploadedFiles = Array.isArray(req.files) ? req.files : [req.files];
      const savedFiles = [];

      for (const file of uploadedFiles) {
        try {
          // Validate the file
          const fileData: InsertFile = {
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
          };

          fileValidationSchema.parse(fileData);
          
          // Save file metadata to storage
          const savedFile = await storage.createFile(fileData);
          savedFiles.push(savedFile);
        } catch (error) {
          // Delete the file if validation fails
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          
          if (error instanceof ZodError) {
            const formattedError = fromZodError(error);
            return res.status(400).json({ message: formattedError.message });
          }
          
          throw error;
        }
      }

      res.status(201).json(savedFiles);
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'File upload failed', error: (error as Error).message });
    }
  });

  app.get('/api/files', async (req: Request, res: Response) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ message: 'Failed to fetch files', error: (error as Error).message });
    }
  });

  app.delete('/api/files/:id', async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: 'Invalid file ID' });
      }
      
      await storage.deleteFile(fileId);
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: 'Failed to delete file', error: (error as Error).message });
    }
  });

  // Test Cases API endpoints
  app.post('/api/test-cases/generate', async (req: Request, res: Response) => {
    try {
      const { fileIds } = req.body;
      
      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({ message: 'No file IDs provided' });
      }

      // Get files from storage
      const files = [];
      for (const fileId of fileIds) {
        const file = await storage.getFile(fileId);
        if (file) {
          files.push(file);
        }
      }

      if (files.length === 0) {
        return res.status(404).json({ message: 'No valid files found for the provided IDs' });
      }

      // Generate test cases using Gemini
      const testCases = await generateTestCases(files);
      
      // Save test cases to storage
      const savedTestCases = [];
      for (const testCase of testCases) {
        const insertTestCase: InsertTestCase = {
          ...testCase,
          fileIds: fileIds,
        };
        
        const savedTestCase = await storage.createTestCase(insertTestCase);
        savedTestCases.push(savedTestCase);
      }

      res.json(savedTestCases);
    } catch (error) {
      console.error('Error generating test cases:', error);
      res.status(500).json({ message: 'Failed to generate test cases', error: (error as Error).message });
    }
  });

  app.get('/api/test-cases', async (req: Request, res: Response) => {
    try {
      const { type, priority } = req.query;
      let testCases = await storage.getAllTestCases();
      
      // Filter by type if specified
      if (type && type !== 'all') {
        testCases = testCases.filter(tc => tc.type.toLowerCase() === String(type).toLowerCase());
      }
      
      // Filter by priority if specified
      if (priority && priority !== 'all') {
        testCases = testCases.filter(tc => tc.priority.toLowerCase() === String(priority).toLowerCase());
      }
      
      res.json(testCases);
    } catch (error) {
      console.error('Error fetching test cases:', error);
      res.status(500).json({ message: 'Failed to fetch test cases', error: (error as Error).message });
    }
  });

  app.get('/api/test-cases/:id', async (req: Request, res: Response) => {
    try {
      const testCaseId = parseInt(req.params.id);
      if (isNaN(testCaseId)) {
        return res.status(400).json({ message: 'Invalid test case ID' });
      }
      
      const testCase = await storage.getTestCase(testCaseId);
      if (!testCase) {
        return res.status(404).json({ message: 'Test case not found' });
      }
      
      res.json(testCase);
    } catch (error) {
      console.error('Error fetching test case:', error);
      res.status(500).json({ message: 'Failed to fetch test case', error: (error as Error).message });
    }
  });

  app.patch('/api/test-cases/:id/select', async (req: Request, res: Response) => {
    try {
      const testCaseId = parseInt(req.params.id);
      const { selected } = req.body;
      
      if (isNaN(testCaseId)) {
        return res.status(400).json({ message: 'Invalid test case ID' });
      }
      
      const updatedTestCase = await storage.updateTestCaseSelection(testCaseId, selected);
      res.json(updatedTestCase);
    } catch (error) {
      console.error('Error updating test case selection:', error);
      res.status(500).json({ message: 'Failed to update test case selection', error: (error as Error).message });
    }
  });

  app.post('/api/test-cases/export-csv', async (req: Request, res: Response) => {
    try {
      const { testCaseIds } = req.body;

      if (!testCaseIds || !Array.isArray(testCaseIds)) {
        return res.status(400).json({ message: 'No test case IDs provided' });
      }

      // Get selected test cases
      const testCases = [];
      for (const id of testCaseIds) {
        const testCase = await storage.getTestCase(id);
        if (testCase) {
          testCases.push(testCase);
        }
      }

      if (testCases.length === 0) {
        return res.status(404).json({ message: 'No test cases found for the provided IDs' });
      }

      // Generate CSV content based on the updated format
      let csvContent = 'ID,Work Item Type,Title,Test Step,Step Action,Step Expected\n';

      testCases.forEach(tc => {
        tc.steps.forEach((step, index) => {
          csvContent += [
            '', // ID is left blank
            'Test Case',
            index === 0 ? tc.description : '', // Title only for the first step
            index + 1, // Test Step
            step, // Step Action
            index === tc.steps.length - 1 ? tc.expectedResults : '' // Step Expected only for the last step
          ].join(',') + '\n';
        });
      });

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="test_cases.csv"');

      res.status(200).send(csvContent);
    } catch (error) {
      console.error('Error exporting test cases to CSV:', error);
      res.status(500).json({ message: 'Failed to export test cases to CSV', error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
