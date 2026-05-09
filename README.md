# AI Agent Culture Chatbot

Spring Boot REST API chatbot for MQ culture knowledge.

The app stores custom knowledge in PostgreSQL, builds a knowledge context from the `knowledge_base` table, calls the OpenAI Chat Completions API with `RestTemplate`, and returns a concise answer.

## Tech Stack

- Java 17
- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL / Supabase
- Maven
- OpenAI API via `RestTemplate`

## Environment Variables

```bash
export DATABASE_URL="jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres"
export DATABASE_USERNAME="YOUR_DB_USERNAME"
export DATABASE_PASSWORD="YOUR_DB_PASSWORD"
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## Run

```bash
mvn spring-boot:run
```

The API runs on:

```text
http://localhost:8080
```

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

- No frontend.
- No Spring Security.
- CORS is open for development.
- `data.sql` includes 3 culture-focused sample knowledge entries.
