import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeEmotion = async (text: string) => {
  const prompt = `
Analyze the following journal entry and return JSON with:

emotion: main emotion
keywords: 3 important keywords
summary: short summary

Journal:
"${text}"

Return ONLY JSON like:
{
  "emotion": "...",
  "keywords": ["...", "...", "..."],
  "summary": "..."
}

Example:
Input:
{
}
"text": "I felt calm today after listening to the rain"
Expected output:
{
"emotion": "calm"
,
"keywords": ["rain"
"nature"
,
,
"peace"],
"summary": "User experienced relaxation during the forest session"
}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion?.choices[0]?.message.content;

  return JSON.parse(content!);
};