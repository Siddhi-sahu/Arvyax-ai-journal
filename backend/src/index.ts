import express from "express"
import { prisma } from "./lib/prisma.js"

const app = express()

app.get("/test-db", async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany()
    res.json(entries)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Database error" })
  }
})

app.listen(3000, () => {
  console.log("server running")
})