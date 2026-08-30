import { AreaStatementData, JurisdictionType, Language } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 dataUrl
  timestamp: number;
  isStreaming?: boolean;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  activeProjectData?: AreaStatementData | null,
  language: Language = 'ml'
): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        activeProjectData,
        language,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.response;
  } catch (error: any) {
    console.error('Error calling chat API:', error);
    throw error;
  }
}

export async function analyzeDrawingWithGemini(
  imageBase64: string,
  category: string,
  drawingName: string,
  jurisdiction: JurisdictionType,
  occupancy: string,
  projectData?: AreaStatementData | null,
  language: Language = 'ml'
): Promise<string> {
  try {
    const res = await fetch('/api/analyze-drawing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        category,
        drawingName,
        jurisdiction,
        occupancy,
        projectData,
        language,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.analysisText || JSON.stringify(data.analysis, null, 2);
  } catch (error: any) {
    console.error('Error calling analyze drawing API:', error);
    throw error;
  }
}
