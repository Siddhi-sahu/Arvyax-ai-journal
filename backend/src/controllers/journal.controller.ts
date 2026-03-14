import { prisma } from "../lib/prisma.js";
import { analyzeEmotion } from "../services/llm.service.js";

export const createJournalEntry = async (req: any, res:any) => {
    try {
        const { userId, ambience, text } = req.body;

        if(!userId || !ambience || !text){
            return res.status(400).json({
                error: "userId and ambience and text are required."
            });
        };

        const entry = await prisma.journalEntry.create({
            data: {
                userId,
                ambience,
                text
            }
        });

        res.json(entry);

    }catch(e){
        console.error(e);
        res.status(500).json({ error: "Failed to create entry in DB."})

    }
};

export const getJournalEntries = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
};  

export const analyzeJournal = async (req: any, res: any) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    const analysis = await analyzeEmotion(text);

    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "LLM analysis failed" });
  }
};

export const getJournalInsights = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (entries.length === 0) {
      return res.json({
        totalEntries: 0,
        topEmotion: null,
        mostUsedAmbience: null,
        recentKeywords: [],
      });
    }
    const totalEntries = entries.length;
    const emotionCount: any = {};
    const ambienceCount: any = {};
    const keywordSet = new Set<string>();

    for (const entry of entries) {
      if (entry.emotion) {
        emotionCount[entry.emotion] =
          (emotionCount[entry.emotion] || 0) + 1;
      }

      ambienceCount[entry.ambience] =
        (ambienceCount[entry.ambience] || 0) + 1;

      entry.keywords.forEach((k) => keywordSet.add(k));
    }

    const topEmotion =
      Object.entries(emotionCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || null;

    const mostUsedAmbience =
      Object.entries(ambienceCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || null;

    const recentKeywords = Array.from(keywordSet).slice(0, 5);

    res.json({
      totalEntries,
      topEmotion,
      mostUsedAmbience,
      recentKeywords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate insights..." });
  }
};
