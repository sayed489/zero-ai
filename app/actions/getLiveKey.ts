"use server"

export async function getLiveKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.GEMINI_FLASH_KEY_1;
  return key && !key.startsWith("your-") ? key : null;
}
