# ArvyaX AI Journal

An AI-powered journaling system built with Next.js (frontend) and Express (backend), using an LLM to analyze emotion in journal entries and surface insights.

Tech Stack
- Next.js
- Express
- PostgreSQL
- Prisma
- OpenAI API

Features
- Write journal entries
- AI emotion analysis
- Insights dashboard
- Ambience Tags

# Setup(for running locally)

# Clone the repo
`git clone https://github.com/yourusername/arvyax-ai-journal.git`
`cd arvyax-ai-journal`

# Set up the database
`docker run -d -p 5432:5432 --name ai_journal_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres postgres:latest`

Ensure the database is up and listening on port 5432.


# Configure environment variables
Create a .env.local file in the project root with the following (example values):
`# URL of the backend API (used by the Next.js frontend)`
`NEXT_PUBLIC_API_URL=http://localhost:3000`

`# Database connection string for Prisma`
`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"`

`# OpenAI API key`
`OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXX`

# Install dependencies and migrate

Install Node dependencies in both the backend and frontend:
`cd backend`
`npm install`
`cd ..`
`cd frontend`
`npm i`

Run Prisma migrations to set up the database schema:
`npx prisma migrate dev`
`npx prisma generate`

# Run the backend server
`npm run dev`

You should see “server running” in the console. The backend API endpoints are now live.

# Run the frontend app
In a new terminal, start the Next.js dev server (default port 3001):
`npm run dev`

Then open your browser to http://localhost:3001. You should see the ArvyaX Journal interface.

enter user id, texts, query insights and have fun!!

