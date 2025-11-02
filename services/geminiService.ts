
import { GoogleGenAI } from "@google/genai";
import type { EpisodeDetails } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is available.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateYouTubeDescription = async (details: EpisodeDetails): Promise<string> => {
  const prompt = `
    Act as the head of communications for GN AI Authority, a civic reform organization.
    Your task is to write a YouTube video description for an upcoming episode.
    The description must be bilingual (English and Bangla), contain "encrypted" legacy tags, and have a call to action for the diaspora.
    Follow this structure:
    1.  Start with a compelling English paragraph about the episode's theme.
    2.  Follow with a Bangla translation of that paragraph.
    3.  Include a call to action for diaspora engagement.
    4.  End with a list of "legacy tags" in hashtag format.

    Episode Details:
    - Episode Number: ${details.ep_number}
    - Title: ${details.title}
    - Theme: ${details.theme}
    - Language Focus: ${details.lang}
    - Relevant Tags to include: ${details.tags.join(', ')}

    Generate the description now.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error: Could not generate description. Please check your API key and connection.";
  }
};
