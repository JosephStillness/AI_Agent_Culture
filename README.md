# AI Agent Culture Chatbot

Spring Boot REST API chatbot with a React frontend for MQ culture knowledge.

The app stores custom knowledge in PostgreSQL, builds a knowledge context from the `knowledge_base` table, calls the OpenAI Chat Completions API with `RestTemplate`, and returns a concise answer. The React frontend lets users chat with the bot and manage culture-only knowledge entries.

The backend includes a scope guard before the OpenAI call. Questions outside MQ student culture, belonging, cultural misunderstanding, respectful group work, student isolation, community connection, or responsible culture-chatbot behaviour return:

```text
I don't have information about that yet.
```

## Tech Stack

- Java 17
- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL / Supabase
- Maven
- OpenAI API via `RestTemplate`
- React + Vite frontend

## Backend Environment Variables

```bash
export DATABASE_URL="jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres"
export DATABASE_USERNAME="YOUR_DB_USERNAME"
export DATABASE_PASSWORD="YOUR_DB_PASSWORD"
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## Run Backend

```bash
mvn spring-boot:run
```

The API runs on:

```text
http://localhost:8080
```

## Run Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The React app runs on:

```text
http://localhost:5173
```

For local development, Vite proxies `/api` to `http://localhost:8080`, so you do not need `VITE_API_BASE_URL`.

## Endpoints

### POST `/api/chat`

Request:

```json
{
  "message": "How can I avoid cultural misunderstanding in group work?"
}
```

Response:

```json
{
  "reply": "..."
}
```

### POST `/api/knowledge`

Request:

```json
{
  "title": "Cross-cultural group work",
  "content": "At MQ, students may come from different communication cultures...",
  "category": "culture"
}
```

### GET `/api/knowledge`

Returns all knowledge entries.

### DELETE `/api/knowledge/{id}`

Deletes a knowledge entry by id.

## Notes

- No Spring Security.
- CORS is open for development.
- `data.sql` includes 3 culture-focused sample knowledge entries.
- Out-of-scope questions, such as coding or deployment questions, are blocked before calling OpenAI.

## Deploy Frontend

Deploy the `frontend` folder to Vercel, Netlify, or another static hosting service.

For Vercel:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable:

```text
VITE_API_BASE_URL=https://YOUR_BACKEND_URL
```

## Deploy Backend

Deploy the Spring Boot app to a Java hosting platform such as Render, Railway, Fly.io, or another service that supports Java 17.

Set these backend environment variables in the hosting dashboard:

```text
DATABASE_URL=jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres
DATABASE_USERNAME=YOUR_DB_USERNAME
DATABASE_PASSWORD=YOUR_DB_PASSWORD
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```
