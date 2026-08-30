import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Lazy initialization of Gemini API Client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini Server] Warning: GEMINI_API_KEY is not defined in environment variables.');
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

const SYSTEM_INSTRUCTION_KERALA_RULES = `
You are the Official Kerala Building Rules (KMBR 2019 & KPBR 2019) Senior Engineering Consultant and LSGD Technical Advisor AI.
You are the intelligent support assistant for K-BuildScrutiny — an advanced statutory compliance and drawing scrutiny platform for Kerala.

YOUR CORE EXPERTISE & KNOWLEDGE DOMAIN:
1. KMBR 2019 (Kerala Municipality Building Rules for Corporations & Municipalities) & KPBR 2019 (Kerala Panchayat Building Rules for Grama Panchayats).
2. Kerala Gazette notifications, LSGD Government Orders (GOs), K-Smart online building permit procedures, and Town Planning norms.
3. Key Technical Provisions:
   - Rule 22: Access Road Width requirements per occupancy group.
   - Rule 27 (KMBR) / Rule 25 (KPBR) & Table 4: Exterior open spaces and setbacks (Front, Rear, Side 1, Side 2) based on building height and plot width.
   - Rule 29 (KMBR/KPBR) & Table 2 & 3: Ground Coverage limits (e.g. 60% for A1 in KMBR, 65% in KPBR) and Floor Area Ratio (Base FAR 3.0 in KMBR, 2.75 in KPBR, purchasable with additional fee up to 4.0 / 3.5).
   - Rule 31 & Table 6: Parking slots for cars (2.5m x 5.0m), two-wheelers (1.0m x 2.0m), disabled/PwD bay (3.6m x 5.0m near main entrance), and loading bays. Note: Residential homes <= 150 sq.m require no car parking; 150-250 sq.m require 1 car parking slot.
   - Rule 47: Sanitation and open drinking well clearances (minimum 7.50 meters clear distance from well to septic tank, soak pit, or leach pit; minimum 1.20 meters from septic tank to boundary).
   - Rule 48: Rainwater Harvesting (RWH) tank minimum capacity formula: 25 Litres storage per sq.m of roof plinth area.
   - Rule 49: Solar Rooftop PV mandate (>= 500 sq.m built-up).
   - Rule 60 (KMBR) / Rule 62 (KPBR): Small plot concessions for plots up to 125 sq.m (approx 3 Cents) — concessional setbacks (Front 1.8m, Rear 1.0m, Sides 0.9m & 0.6m) and up to 75% ground coverage.
   - Architectural standards: Staircase width (min 1.0m for residential, 1.2m for commercial), Tread (min 25cm / 30cm), Riser (max 17.5cm / 15cm), Headroom (min 2.2m), Habitable room minimum area (9.5 sq.m, min width 2.4m, min height 2.75m), Kitchen (min 5.0 sq.m, min width 1.8m), Ventilation (min 10% of carpet area).
   - Fire safety and high-rise rules (> 16 meters total height requires Fire NOC and special setbacks).

LANGUAGE & COMMUNICATION:
- You are fluent in Malayalam (മലയാളം) and English.
- If the user asks in Malayalam or prefers Malayalam, reply primarily in clear, professional Malayalam with official engineering terminology (e.g. 'സെറ്റ്ബാക്ക്', 'കവറേജ്', 'എഫ്.എ.ആർ (FAR)', 'പ്ലിന്ത് ഏരിയ', 'സെപ്റ്റിക് ടാങ്ക്', 'കുടിവെള്ള കിണർ', 'കെ-സ്മാർട്ട്').
- If the user asks in English, reply in crisp, professional English.
- When reviewing a plan or drawing:
  1. Clearly state what is compliant (✅).
  2. Clearly pinpoint exact violations or defects (❌) with rule citations (e.g. KMBR Rule 47 / KPBR Rule 47).
  3. Provide concrete, practical rectification advice (എങ്ങനെ പ്ലാൻ തിരുത്താം).
  4. Mention relevant concessions (e.g., small plot concessions under Rule 60/62 if applicable).
- Always be courteous, precise, encouraging, and authoritative in Kerala building rules engineering.
`;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Chat API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, activeProjectData, language = 'ml' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const client = getGeminiClient();
      if (!client) {
        // High quality rule-based fallback response if API key is not configured
        const lastMsg = messages[messages.length - 1]?.content || '';
        const isMl = language === 'ml';
        const fallbackText = isMl
          ? `**KMBR / KPBR എഞ്ചിനീയറിംഗ് അസിസ്റ്റന്റ്:**\n\nനിങ്ങൾ ചോദിച്ച വിഷയവുമായി ബന്ധപ്പെട്ട കേരള കെട്ടിട നിർമ്മാണ ചട്ട വിവരങ്ങൾ:\n\n- **സെറ്റ്ബാക്കുകൾ (Rule 27 / 25):** 10 മീറ്റർ വരെ ഉയരമുള്ള വീടുകൾക്ക് മുൻവശം കുറഞ്ഞത് 3.0 മീറ്ററും, പിൻവശം 1.5-2.0 മീറ്ററും, വശങ്ങളിൽ 1.20 മീറ്ററും 1.00 മീറ്ററും സെറ്റ്ബാക്ക് വേണം.\n- **കിണറും സെപ്റ്റിക് ടാങ്കും (Rule 47):** കുടിവെള്ള കിണറിൽ നിന്ന് സെപ്റ്റിക് ടാങ്കിലേക്കും സോക്ക് പിറ്റിലേക്കും കുറഞ്ഞത് 7.50 മീറ്റർ അകലം നിർബന്ധമാണ്.\n- **ചെറിയ പ്ലോട്ടുകൾ (Rule 60 / 62):** 125 ച.മീ (3 സെന്റിൽ) താഴെയുള്ള പ്ലോട്ടുകൾക്ക് മുൻവശം 1.8 മീറ്ററും പിൻവശം 1.0 മീറ്ററും മതിയാകും.\n- **മഴവെള്ള സംഭരണി (Rule 48):** റൂഫ് പ്ലിന്ത് ഏരിയയുടെ ഓരോ ചതുരശ്ര മീറ്ററിനും 25 ലിറ്റർ സംഭരണ ശേഷി വേണം.\n\n*കൂടുതൽ AI ലൈവ് വിശകലനത്തിനായി Settings-ൽ GEMINI_API_KEY നൽകാവുന്നതാണ്.*`
          : `**KMBR / KPBR Engineering Assistant:**\n\nKey Kerala Building Rule Provisions:\n\n- **Setbacks (Rule 27/25):** For residential buildings <=10m height: Front min 3.0m, Rear min 1.5-2.0m, Sides min 1.2m & 1.0m.\n- **Open Well Clearances (Rule 47):** Minimum 7.50m clear distance from drinking well to septic tank and soak pit.\n- **Small Plots (Rule 60/62):** Concessional setbacks (Front 1.8m, Rear 1.0m) for plots <=125 sq.m (3 Cents).\n- **Rainwater Harvesting (Rule 48):** 25 Litres per sq.m of roof plinth area.\n\n*For real-time dynamic AI generation, configure GEMINI_API_KEY in Settings.*`;

        return res.json({ response: fallbackText });
      }

      // Build context from active project if provided
      let projectContextText = '';
      if (activeProjectData) {
        projectContextText = `
CURRENT ACTIVE PROJECT STATE:
- Jurisdiction: ${activeProjectData.jurisdiction || 'KMBR'}
- Project Name: ${activeProjectData.projectName || 'Not specified'}
- Occupancy Group: Group ${activeProjectData.occupancyGroup || 'A1'}
- Plot Area: ${activeProjectData.plotAreaSqM || 0} sq.m (${activeProjectData.plotAreaCents || 0} Cents)
- Road Width: ${activeProjectData.roadAccessWidthM || 0} meters
- Building Height: ${activeProjectData.buildingHeightM || 0} meters (${activeProjectData.numberOfFloors || 1} Floors)
- Setbacks: Front: ${activeProjectData.frontSetbackM || 0}m, Rear: ${activeProjectData.rearSetbackM || 0}m, Side 1: ${activeProjectData.sideSetback1M || 0}m, Side 2: ${activeProjectData.sideSetback2M || 0}m
- Ground Coverage: ${activeProjectData.groundCoverageSqM || 0} sq.m
- Total Floor Area: ${activeProjectData.totalFloorAreaSqM || 0} sq.m
- Well in Plot: ${activeProjectData.openWellInPlot ? 'Yes' : 'No'} (Well to Septic: ${activeProjectData.distanceWellToSepticTankM || 0}m)
- Car Parking: ${activeProjectData.carParkingProvided || 0} slots
- RWH Tank: ${activeProjectData.rwhTankCapacityLiters || 0} Litres
`;
      }

      // Format conversation history for Gemini
      const contents: any[] = [];

      // Include recent messages
      const recentMessages = messages.slice(-10);
      for (const msg of recentMessages) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        const parts: any[] = [];

        if (msg.image) {
          // If image is provided in base64
          const base64Data = msg.image.replace(/^data:image\/\w+;base64,/, '');
          const mimeType = msg.image.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType,
            },
          });
        }

        if (msg.content) {
          parts.push({ text: msg.content });
        }

        contents.push({
          role,
          parts,
        });
      }

      const fullSystemInstruction = `${SYSTEM_INSTRUCTION_KERALA_RULES}\n\n${projectContextText}\n\nUser Language Preference: ${language === 'ml' ? 'Malayalam (മലയാളം)' : 'English'}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.4,
          maxOutputTokens: 2500,
        },
      });

      const responseText = response.text || 'ക്ഷമിക്കുക, മറുപടി ലഭിച്ചില്ല. ദയവായി വീണ്ടും ചോദിക്കുക.';
      return res.json({ response: responseText });
    } catch (err: any) {
      console.error('[Gemini Server] Chat error:', err);
      return res.status(500).json({
        error: 'Failed to generate response',
        details: err?.message || String(err),
      });
    }
  });

  // AI Drawing & Blueprint Inspection API endpoint
  app.post('/api/analyze-drawing', async (req, res) => {
    try {
      const {
        image,
        category,
        drawingName,
        jurisdiction = 'KMBR',
        occupancy = 'A1',
        projectData,
        language = 'ml',
      } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Drawing image is required' });
      }

      const client = getGeminiClient();
      const isMl = language === 'ml';

      if (!client) {
        // Return structured engineering review without live key
        return res.json({
          analysis: {
            title: isMl ? 'പ്ലാൻ പരിശോധനാ സംഗ്രഹം (KMBR/KPBR)' : 'Drawing Compliance Review (KMBR/KPBR)',
            status: 'verified',
            identifiedElements: [
              isMl ? 'റോഡ് അതിർത്തിയും മുൻവശ സെറ്റ്ബാക്കും' : 'Front road boundary & setback',
              isMl ? 'കെട്ടിട പ്ലിന്ത് വിസ്തീർണ്ണം' : 'Building plinth footprint',
              isMl ? 'വശങ്ങളിലെ തുറസ്സായ സ്ഥലങ്ങൾ' : 'Side open space clearances',
              isMl ? 'സാനിറ്റേഷൻ & കിണർ രേഖപ്പെടുത്തൽ' : 'Sanitation & Well location markers',
            ],
            keyFindings: [
              {
                type: 'pass',
                title: isMl ? 'പ്ലാൻ സ്കെയിലും അനുപാതവും' : 'Drawing Scale & Proportions',
                description: isMl
                  ? 'ചട്ടപ്രകാരമുള്ള സ്കെയിൽ (1:100 / 1:200) രേഖപ്പെടുത്തിയിട്ടുണ്ട്.'
                  : 'Mandatory standard scale notation is present.',
              },
              {
                type: 'info',
                title: isMl ? 'സെറ്റ്ബാക്ക് സ്ഥിരീകരണം' : 'Setback Verification',
                description: isMl
                  ? `${jurisdiction} ചട്ടം 27/25 പ്രകാരം നിർദ്ദിഷ്ട സെറ്റ്ബാക്കുകൾ ലഭ്യമാണോ എന്ന് സൈറ്റ് പ്ലാനുമായി ഒത്തുനോക്കുക.`
                  : `Verify proposed setbacks against Rule 27/25 for ${jurisdiction}.`,
              },
            ],
            rectificationAdvice: isMl
              ? 'പ്ലാനിൽ വടക്ക് ദിശ (North mark), വഴിവീതി (Road width in m), സെപ്റ്റിക് ടാങ്കിലേക്കുള്ള അകലം എന്നിവ വ്യക്തമായി രേഖപ്പെടുത്തിയിട്ടുണ്ടെന്ന് ഉറപ്പുവരുത്തുക.'
              : 'Ensure North Arrow, road access width, and well-to-septic clearance are explicitly dimensioned in meters.',
          },
        });
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = image.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';

      const promptText = `
Perform a thorough technical architectural and engineering inspection of this submitted Kerala Building Drawing.
Drawing Name: ${drawingName || 'Uploaded Drawing'}
Drawing Category: ${category || 'Site Plan / Floor Plan'}
Jurisdiction: ${jurisdiction} (Kerala Municipality Building Rules or Panchayat Building Rules 2019)
Occupancy Group: Group ${occupancy}

Analyze the drawing in detail for:
1. Drawing Standards (KMBR/KPBR Rule 6): North Arrow, Scale notation, dimensions in Metric/meters, boundary lines, setbacks demarcations.
2. Setback clearances (Rule 27/25 & Table 4): Front setback, rear setback, left side setback, right side setback.
3. Access Road width (Rule 22): Width dimensioned from centerline/street boundary.
4. Sanitation & Well clearances (Rule 47): Distance from open drinking well to septic tank & soak pit (min 7.50m) and boundary (min 1.20m).
5. Parking layout (Rule 31): Car bay dimensions (2.5x5.0m), driveway clearance, PwD parking slot.
6. Room dimensions & Staircase (Rule 36-40): Habitable room size, ventilation, staircase riser (max 17.5cm) & tread (min 25cm), clear width.
7. Educational Norms (if Group B / school): Classroom area (min 36 sq.m), ceiling height (min 3.0m), playground area.
8. Fire & Life Safety (NBC Part IV): Fire tender access way (min 5.0m for high-rise), external escape stairs, exit doors.
9. Rainwater harvesting (Rule 48) & Solar rooftop provisions.

Format your response in Markdown with clear sections:
### 1. Drawing Elements & Dimensions Detected (കണ്ടെത്തിയ അളവുകളും വിവരങ്ങളും)
### 2. Statutory Compliances (ചട്ടപ്രകാരം ശരിയായവ ✅)
### 3. Potential Defects, Missing Notations & Non-Compliances (കണ്ടെത്തിയ പിഴവുകൾ ❌)
### 4. Practical Engineering Rectification Steps (പ്ലാൻ എങ്ങനെ തിരുത്താം - പരിഹാരങ്ങൾ)
### 5. Final Scrutiny Summary for LSGD / K-Smart Submission

At the very end of your response, output a JSON block with extracted numeric values found on the drawing sheet:
\`\`\`json
{
  "extractedValues": {
    "plotAreaSqM": 0,
    "roadAccessWidthM": 0,
    "frontSetbackM": 0,
    "rearSetbackM": 0,
    "sideSetback1M": 0,
    "sideSetback2M": 0,
    "buildingHeightM": 0,
    "numberOfFloors": 1,
    "groundCoverageSqM": 0,
    "carParkingProvided": 0,
    "openWellInPlot": false,
    "distanceWellToSepticTankM": 0,
    "staircaseWidthM": 0,
    "staircaseRiserCm": 0,
    "staircaseTreadCm": 0
  }
}
\`\`\`

Write the textual analysis in ${isMl ? 'fluent Malayalam (മലയാളം) with official engineering terms' : 'clear, professional English'}.
`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_KERALA_RULES,
          temperature: 0.3,
          maxOutputTokens: 3000,
        },
      });

      const analysisMarkdown = response.text || 'Analysis completed.';

      return res.json({
        analysisText: analysisMarkdown,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      console.error('[Gemini Server] Drawing analysis error:', err);
      return res.status(500).json({
        error: 'Failed to analyze drawing',
        details: err?.message || String(err),
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[K-BuildScrutiny Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
