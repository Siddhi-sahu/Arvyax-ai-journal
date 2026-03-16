import express from "express";
import journalRoutes from "./routes/journal.routes.js";
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/api", journalRoutes);
app.listen(PORT, () => {
    console.log("server running");
});
//# sourceMappingURL=index.js.map