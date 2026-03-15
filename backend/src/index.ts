import express from "express"
import journalRoutes from "./routes/journal.routes.js";
import cors from 'cors';

const app = express()

app.use(cors())
app.use(express.json());

app.use("/api", journalRoutes)

app.listen(3000, () => {
  console.log("server running")
})