CREATE TYPE OS AS ENUM ('windows', 'linux', 'macos');

CREATE TABLE IF NOT EXISTS developer_infos(
 "id" SERIAL PRIMARY KEY,
 "preferedOS" OS NOT NULL,
 "developerSince" DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS developers (
"id" SERIAL PRIMARY KEY,
"name" VARCHAR(50) NOT NULL,
"email" VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS projects (
"id" SERIAL PRIMARY KEY,
"name" VARCHAR(50) NOT NULL,
"description" VARCHAR NOT NULL,
"estimatedTime" VARCHAR(20) NOT NULL,
"repository" VARCHAR(120) NOT NULL,
"startDate" DATE NOT NULL,
"endDate" DATE
); 


CREATE TABLE IF NOT EXISTS technologies (
"id" SERIAL PRIMARY KEY,
"name" VARCHAR(30) NOT NULL
);

INSERT INTO technologies ("name")
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
"addedIn" DATE NOT NULL
);

