import express, { Application } from "express";
import { startDatabase } from "./database";
import { createDeveloper } from "./logics/developers.logic";
import { ensureDevDataIsValid } from "./middlewares/devs.middlewares";
const app: Application = express();
app.use(express.json());

app.post("/developers", ensureDevDataIsValid, createDeveloper);

app.listen(3000, async () => {
  console.log("Server is running");
  await startDatabase();
});
