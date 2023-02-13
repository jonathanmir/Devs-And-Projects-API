import express, { Application } from "express";
import { startDatabase } from "./database";
import {
  ensureRequestIsNotEmpty,
  verifyDevInfoIsAvailable,
  verifyIfDevIdExists,
} from "./middlewares/devs.middlewares";
import {
  createDeveloper,
  createDeveloperInfo,
  getAllDevs,
  getDevById,
  updateDeveloper,
  deleteDeveloper,
  updateDevInfo,
  getAllProjectsFromDev,
} from "./logics/developers.logic";

import {
  createProjet,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
  addTechnologyToProject,
  deleteTechnologyFromProject,
} from "./logics/projects.logic";

import { verifyIfProjectExists } from "./middlewares/projects.middlewares";
const app: Application = express();
app.use(express.json());
app.use("/developers/:id/infos", verifyIfDevIdExists);
app.use("/developers/:id", verifyIfDevIdExists);

app.post("/developers", ensureRequestIsNotEmpty, createDeveloper);
app.post(
  "/developers/:id/infos",
  verifyDevInfoIsAvailable,
  createDeveloperInfo
);
app.get("/developers", getAllDevs);
app.get("/developers/:id", getDevById);
app.patch("/developers/:id", updateDeveloper);
app.patch("/developers/:id/infos", updateDevInfo);
app.delete("/developers/:id", deleteDeveloper);

app.get("/developers/:id/projects", getAllProjectsFromDev);

app.post("/projects", verifyIfDevIdExists, createProjet);
app.get("/projects", getAllProjects);
app.get("/projects/:id", getProjectById);
app.patch("/projects/:id", updateProject);
app.delete("/projects/:id", verifyIfProjectExists, deleteProject);
app.post(
  "/projects/:id/technologies",
  verifyIfProjectExists,
  addTechnologyToProject
);
app.delete(
  "/projects/:id/technologies/:name",
  verifyIfProjectExists,
  deleteTechnologyFromProject
);
app.listen(3000, async () => {
  await startDatabase();
});
