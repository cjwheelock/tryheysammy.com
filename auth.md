# Hey Sammy auth.md

Hey Sammy's website discovery API and MCP discovery tools are public and read-only. Agents may call the documented public endpoints without registering, creating an account, or presenting credentials.

## Agent audience

These resources are intended for agents that need to understand Hey Sammy, find its public content, or discover its machine-readable metadata.

## Registration and provisioning

No agent registration or provisioning endpoint is required for the public discovery API. Hey Sammy does not currently offer a public OAuth authorization server or issue API credentials to third-party agents.

## Credential use

Do not send API keys, bearer tokens, passwords, or user data to the public discovery endpoints. Protected product APIs on `app.tryheysammy.com` are private and are not advertised for third-party agent use.

## Public metadata

- API documentation: https://tryheysammy.com/docs/api.md
- API catalog: https://tryheysammy.com/.well-known/api-catalog
- Protected resource metadata: https://tryheysammy.com/.well-known/oauth-protected-resource
