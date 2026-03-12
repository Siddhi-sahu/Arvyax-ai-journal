import { prisma } from "../lib/prisma.js";

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
}