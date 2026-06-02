import { GoogleGenAI } from '@google/genai';

// Clean and sanitize the key string to remove potential Windows carriage returns (\r) or spaces
const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const sanitizedKey = rawKey ? rawKey.replace(/\r/g, '').trim() : null;

if (!sanitizedKey) {
  console.error('\n🚨 --- CONFIGURATION ERROR: GEMINI API KEY IS MISSING --- 🚨');
  console.error('Next.js could not read GEMINI_API_KEY from your .env file.');
  console.error('Ensure your .env file sits in the root directory and contains your active token.');
  console.error('------------------------------------------------------------\n');
} else {
  console.log(`\n✅ Gemini SDK successfully loaded key (Length: ${sanitizedKey.length} characters)\n`);
}

// Export the modern unified instance
export const ai = new GoogleGenAI({ apiKey: sanitizedKey || '' });