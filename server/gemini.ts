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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
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

    const rawResponse = await response.text();
    console.log('Raw response from Gemini API:', rawResponse);

    const geminiData = JSON.parse(rawResponse);

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const textContent = geminiData.candidates[0].content.parts[0].text;

    // Log the raw text content for debugging
    console.log('Raw text content from Gemini API:', textContent);

    // Sanitize the JSON string to remove trailing commas
    const sanitizedTextContent = textContent.replace(/,\s*([\]}])/g, '$1');

    // Extract JSON from the sanitized response
    const jsonMatch = sanitizedTextContent.match(/\[\s*\{[\s\S]*\}\s*\]/);

    if (!jsonMatch) {
      console.error('Failed to extract JSON from Gemini response. Sanitized text content:', sanitizedTextContent);
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const testCases = JSON.parse(jsonMatch[0]) as InsertTestCase[];

    return testCases;
  } catch (error) {
    console.error('Error generating test cases:', error);
    throw new Error('Failed to generate test cases. Please check the logs for more details.');
  }
}
