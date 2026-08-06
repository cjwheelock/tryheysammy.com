# Hey Sammy Public Discovery API

The Hey Sammy public discovery API exposes read-only metadata for agents and other automated clients. It does not expose user data and does not require authentication.

## Endpoints

- `GET /api/index.json` returns links to the public API description, documentation, and health resource.
- `GET /api/health.json` returns a static availability document for this discovery surface.
- `POST /api/mcp` provides a stateless MCP endpoint for reading the same public discovery information when the site is deployed on Vercel.

## Discovery

- API catalog: `/.well-known/api-catalog`
- OpenAPI description: `/openapi.json`
- Agent skills index: `/.well-known/agent-skills/index.json`
- MCP server card: `/.well-known/mcp/server-card.json`

## Authentication

These endpoints are public and read-only. No OAuth token, API key, agent registration, or user account is required.
