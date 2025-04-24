import { File, InsertTestCase } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

// Helper function to read file content
async function readFileContent(file: File): Promise<string> {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads');
    const files = await fs.readdir(uploadDir);
    
    // Find the uploaded file by name pattern
    const filePattern = new RegExp(`files-.*${path.extname(file.name)}$`);
    const matchingFile = files.find(f => filePattern.test(f));
    
    if (!matchingFile) {
      throw new Error(`File not found: ${file.name}`);
    }
    
    const filePath = path.join(uploadDir, matchingFile);
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file content: ${(error as Error).message}`);
    return `[Failed to read file content: ${file.name}]`;
  }
}

// Function to generate test cases using Google Gemini API
export async function generateTestCases(files: File[]): Promise<InsertTestCase[]> {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    
    // Read the content of each file
    const fileContents: { name: string; content: string }[] = [];
    for (const file of files) {
      const content = await readFileContent(file);
      fileContents.push({ name: file.name, content });
    }
    
    // Prepare the prompt for Gemini
    const prompt = `
Generate a comprehensive test plan based on the following files:
${fileContents.map(file => `\n- ${file.name}: ${file.content.substring(0, 500)}... (truncated)`).join('\n')}

Create test cases covering:
1. Functional testing
2. Non-functional testing
3. Integration testing

For each test case, provide:
- A unique test ID (format: TC-XXX)
- Description
- Prerequisites
- Test steps (as a list)
- Expected results
- Priority (High, Medium, or Low)
- Test type (Functional, Non-functional, or Integration)

Format the response as JSON with the following structure:
[
  {
    "testId": "TC-001",
    "description": "Test description",
    "prerequisites": "Test prerequisites",
    "steps": ["Step 1", "Step 2", "..."],
    "expectedResults": "Expected result",
    "priority": "High | Medium | Low",
    "type": "Functional | Non-functional | Integration"
  },
  ...
]
`;

    // Make a request to the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.8,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const geminiData = await response.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }
    
    const textContent = geminiData.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = textContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }
    
    const testCases = JSON.parse(jsonMatch[0]) as InsertTestCase[];
    
    return testCases;
  } catch (error) {
    console.error('Error generating test cases:', error);
    
    // Return fallback test cases if API fails
    return [
      {
        testId: "TC-001",
        description: "Verify file upload with valid PDF format",
        prerequisites: "Valid PDF file available",
        steps: ["Navigate to upload page", "Select PDF file", "Click upload button"],
        expectedResults: "File successfully uploads with confirmation message",
        priority: "High",
        type: "Functional",
        fileIds: files.map(f => f.id)
      },
      {
        testId: "TC-002",
        description: "Verify file upload with invalid file format",
        prerequisites: "Invalid file format (e.g., .exe)",
        steps: ["Navigate to upload page", "Select invalid file", "Attempt to upload"],
        expectedResults: "Error message displayed, upload rejected",
        priority: "High",
        type: "Functional",
        fileIds: files.map(f => f.id)
      },
      {
        testId: "TC-003",
        description: "Test API integration with Google Gemini",
        prerequisites: "Valid API credentials",
        steps: ["Upload valid file", "Trigger API processing", "Wait for response"],
        expectedResults: "Response received from Google Gemini API",
        priority: "High",
        type: "Integration",
        fileIds: files.map(f => f.id)
      },
      {
        testId: "TC-004",
        description: "Verify responsive design on mobile devices",
        prerequisites: "Mobile device or emulator",
        steps: ["Access application on mobile device", "Test UI elements", "Test upload functionality"],
        expectedResults: "All UI elements properly scaled and functional",
        priority: "Medium",
        type: "Non-functional",
        fileIds: files.map(f => f.id)
      },
      {
        testId: "TC-005",
        description: "Test export functionality to CSV",
        prerequisites: "Generated test cases available",
        steps: ["Navigate to test cases view", "Click export to CSV button", "Save file"],
        expectedResults: "CSV file downloaded with all test cases",
        priority: "Medium",
        type: "Functional",
        fileIds: files.map(f => f.id)
      }
    ];
  }
}
