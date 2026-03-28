import { GoogleGenAI, Type } from "@google/genai";
import type { SummaryItem, CustomCategory } from '../types';

// This is the base structure for one item in the analysis array.
const BASE_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: 'The category of the summary.', // This will be dynamically updated
    },
    summary: {
      type: Type.STRING,
      description: 'A concise summary for the given category, written in clear, academic language. For the "Abstract" category, this should be the Chinese translation.',
    },
    evidence: {
      type: Type.STRING,
      description: 'A direct quote or a very close paraphrase from the original text that serves as evidence for the summary. For the "Abstract" category, this must be the original, untranslated abstract.',
    },
  },
  required: ['category', 'summary', 'evidence'],
};


const generatePromptAndSchema = (documentText: string, customCategories: CustomCategory[]) => {
    const baseCategories = ["Abstract", "Research Topic", "Methodology", "Conclusion"];
    const customCategoryNames = customCategories.map(c => c.name);
    // Sort custom categories alphabetically for consistent ordering in the output
    customCategoryNames.sort();
    const allCategoryNames = [...baseCategories, ...customCategoryNames];
    
    // Create a dynamic schema based on the categories
    const dynamicSchema = {
      type: Type.ARRAY,
      items: {
        ...BASE_ITEM_SCHEMA,
        properties: {
          ...BASE_ITEM_SCHEMA.properties,
          category: {
            ...BASE_ITEM_SCHEMA.properties.category,
            description: `The category of the summary, which must be one of the following exact strings: ${allCategoryNames.map(name => `"${name}"`).join(', ')}.`,
          }
        }
      }
    };

    let customCategoryInstructions = '';
    if (customCategories.length > 0) {
      customCategoryInstructions = `
After analyzing the base categories, you must also analyze the following custom categories based on their definitions:
${customCategories.map(c => `- **${c.name}**: ${c.definition}`).join('\n')}
`;
    }

    const prompt = `
You are an expert academic research assistant. Your task is to analyze the following text extracted from a research paper and provide a structured summary in JSON format.

**DOCUMENT TEXT:**
---
${documentText}
---

**INSTRUCTIONS:**
1.  Read the entire document text carefully.
2.  For each of the categories listed below, provide a concise summary and a direct quote or close paraphrase from the text as evidence.
3.  The output **must** be a JSON array, conforming to the provided schema.
4.  Ensure every required category is present in your final JSON output.
5.  **Special instruction for "Abstract"**: For the 'summary' field, provide a Chinese translation of the abstract. For the 'evidence' field, provide the original, untranslated abstract from the text.

**CATEGORIES TO ANALYZE:**

**Base Categories:**
- **Abstract**: The full, original abstract of the paper.
- **Research Topic**: The primary subject, research question, or hypothesis being investigated.
- **Methodology**: The methods, techniques, and procedures used to conduct the research.
- **Conclusion**: The main findings, results, and concluding remarks of the study.

${customCategoryInstructions}
Your response must be only the JSON array of objects, with no other text or explanation.
`;

    return { prompt, schema: dynamicSchema };
};

export const analyzeDocument = async (
  apiKey: string,
  model: string,
  documentText: string,
  customCategories: CustomCategory[]
): Promise<SummaryItem[]> => {
  if (!apiKey) {
    throw new Error('API key is not configured.');
  }

  const { prompt, schema } = generatePromptAndSchema(documentText, customCategories);
  
  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
    });

    const jsonText = response.text.trim();
    // It is possible for the model to return markdown ```json ... ```, so we need to clean it.
    const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    const parsedResult = JSON.parse(cleanedJsonText);
    
    if (!Array.isArray(parsedResult)) {
        throw new Error("AI response was not in the expected array format.");
    }
    
    // Simple validation
    const isValid = parsedResult.every(item => 
        typeof item === 'object' &&
        'category' in item &&
        'summary' in item &&
        'evidence' in item
    );

    if (!isValid) {
        throw new Error("One or more items in the AI response are malformed.");
    }

    return parsedResult as SummaryItem[];

  } catch (error: any) {
    console.error('Error during Gemini API call:', error);
    // Provide a more user-friendly error message
    if (error.message.includes('API key not valid')) {
        throw new Error('The provided Google Gemini API key is invalid. Please check the key and try again.');
    }
    if (error instanceof SyntaxError) {
        throw new Error('Failed to parse the AI response. The model may have returned an invalid JSON format.');
    }
    throw new Error(`An error occurred while analyzing the document: ${error.message}`);
  }
};
