import express from "express";
import { createJournalEntry, getJournalEntries } from "../controllers/journal.controller.js";
import { analyzeJournal } from "../controllers/journal.controller.js";
import { getJournalInsights } from "../controllers/journal.controller.js";

const router = express.Router();

router.post("/journal", createJournalEntry);
router.get("/journal/:userId", getJournalEntries);
router.post("/journal/analyze", analyzeJournal);
router.get("/journal/insights/:userId", getJournalInsights);

export default router;