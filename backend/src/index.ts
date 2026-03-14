import express from "express"
import journalRoutes from "./routes/journal.routes.js";
const app = express()

app.use(express.json());

app.use("/api", journalRoutes)

app.listen(3000, () => {
  console.log("server running")
})