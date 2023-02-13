CREATE TYPE OS AS ENUM ('windows', 'linux', 'macos');

CREATE TABLE IF NOT EXISTS developer_infos(
 "id" SERIAL PRIMARY KEY,
  "developerSince" DATE NOT NULL,
 "preferedOS" OS NOT NULL
);

CREATE TABLE IF NOT EXISTS developers (
"id" SERIAL PRIMARY KEY,
"name" VARCHAR(50) NOT NULL,
"email" VARCHAR(50) NOT NULL UNIQUE,
"developerInfoId" INTEGER UNIQUE,
FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
"id" SERIAL PRIMARY KEY,
"projectName" VARCHAR(50) NOT NULL,
"projectDescription" VARCHAR NOT NULL,
"projectEstimatedTime" VARCHAR(20) NOT NULL,
"projectRepository" VARCHAR(120) NOT NULL,
"projectStartDate" DATE NOT NULL,
"projectEndDate" DATE,
"developerId" INTEGER,
FOREIGN KEY ("developerId") REFERENCES developers("id") ON DELETE CASCADE
); 


CREATE TABLE IF NOT EXISTS technologies (
"id" SERIAL PRIMARY KEY,
"technologyName" VARCHAR(30) NOT NULL
);

INSERT INTO technologies ("technologyName")
VALUES 
('JavaScript'),
('Python'),
('React'),
('Express.js'),
('HTML'),
('CSS'),
('Django'),
('PostgreSQL'),
('MongoDB');

CREATE TABLE IF NOT EXISTS projects_technologies (
"id" SERIAL PRIMARY KEY,
"addedIn" DATE NOT NULL DEFAULT NOW(),
"technologyId" INTEGER NOT NULL,
"projectId" INTEGER NOT NULL,
FOREIGN KEY ("technologyId") REFERENCES technologies("id"),
FOREIGN KEY ("projectId") REFERENCES projects("id")
);
