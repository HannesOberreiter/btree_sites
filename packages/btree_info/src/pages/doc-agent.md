---
title: AI-Powered Beekeeping Automation
description: "Connect your AI agent (Claude, ChatGPT, LLM bots) to b.tree beekeeping software via a secure API. Automate hive management, inspections, and data analysis."
layout: "../layouts/IndexLayout.astro"
lang: "en"
---

## b.tree Agent API — Let AI Manage Your Hives

The b.tree **Agent API** is a dedicated endpoint that lets external **AI agents** and **LLM-powered assistants** (Claude, ChatGPT, custom bots, ClawBot, MCP-compatible agents) interact with your beekeeping data programmatically. Think of it as giving your AI assistant its own set of beekeeping tools.

Whether you're using **Claude Desktop**, **ChatGPT with custom actions**, a **Zapier AI workflow**, or building your own agent — the b.tree Agent API provides full read and write access to your beekeeping operation through a secure, rate-limited, OpenAPI-documented endpoint.

---

### Why Use the Agent API?

- **Natural Language Beekeeping** — Ask your AI to "create a feeding record for all hives in the forest apiary" and it just works
- **Automation** — Build workflows that automatically log inspections, schedule treatments, or analyse harvest data
- **Multi-Tool Access** — Your AI agent gets access to 25+ tools: create/read/update/delete for feeds, treatments, harvests, checkups, todos, charges, statistics, weather, and more
- **OpenAPI Discovery** — Your agent can auto-discover all available endpoints and their schemas
- **Secure** — API keys are SHA-256 hashed, per-user, with optional expiry dates

---

### Getting Started

#### 1. Generate an Agent Key

Navigate to **Settings → Profile → [Agent Keys](https://app.btree.at/setting/profile/agent-keys)** in your b.tree account.

Click **"Create Agent Key"** and optionally set:

- A **label** (e.g. "Claude Desktop", "My Automation")
- An **expiry date** (leave empty for permanent access)

⚠️ **Important**: The API key is only displayed once after creation. Copy it immediately and store it securely. It cannot be retrieved later.

Your key will look like: `btree_ak_a1B2c3D4e5F6g7H8i9J0...`

#### 2. Authenticate

Include your key in the `Authorization` header of every request:

```bash
Authorization: Bearer btree_ak_your_key_here
```

#### 3. Discover Available Tools

Fetch the full OpenAPI specification to see all available endpoints and their parameters:

```bash
GET https://api.btree.at/api/v1/agent/openapi.json
Authorization: Bearer btree_ak_your_key_here
```

This returns an **OpenAPI 3.1** spec that any compatible agent or tool can parse automatically.

#### 4. Call Tools

Each tool is available as a POST endpoint:

```bash
POST https://api.btree.at/api/v1/agent/tools/{toolName}
Authorization: Bearer btree_ak_your_key_here
Content-Type: application/json

{ ... parameters as JSON ... }
```

Example — list your apiaries and hives:

```json
POST /api/v1/agent/tools/listApiariesHives
{ "includeInactive": false }
```

---

### Rate Limits

The Agent API is rate-limited to **60 requests per minute** per API key. This is generous for interactive AI use and automation, but prevents abuse.

If you exceed the limit, you'll receive a `429 Too Many Requests` response with a `Retry-After` header indicating when you can resume.

---

### Security Best Practices

- **Rotate keys regularly** — Create new keys and delete old ones periodically
- **Use expiry dates** — Set `valid_to` when you know the key should only be active temporarily
- **Label your keys** — Name them after the agent or service using them for easy tracking
- **Monitor last used** — Check the "Last Used" timestamp in your key list to identify stale keys
- **Delete unused keys** — If an agent is no longer in use, revoke its key immediately

Keys are **hashed with SHA-256 + unique salt** before storage. Even in the unlikely event of a database breach, your plaintext keys cannot be recovered.

When your account or company is deleted, all associated agent keys are automatically removed.

---

### Setting Up Your AI Agent

On the Agent Keys page in b.tree, you'll find a ready-to-use **skill installation prompt**. Copy it and paste it into your AI agent (Claude, ChatGPT, or any LLM that supports tool use / function calling). The prompt teaches your agent:

- How to authenticate with the b.tree API
- How to discover available tools via OpenAPI
- The b.tree data model conventions
- Best practices for creating and updating records

---

### Use Cases

- **Voice-Controlled Beekeeping** — "Hey Claude, log a feeding of 3:2 sugar syrup for all hives in the meadow apiary"
- **Automated Reports** — Have your agent generate weekly summaries of treatments and inspections
- **Recurring Tasks** — Set up agents to create seasonal feeding or treatment schedules
- **Weather-Aware Management** — Agents can check apiary weather before suggesting actions
- **Multi-Platform** — Works with any AI agent that supports HTTP tool calls

---

*The Agent API is a Premium feature. [Upgrade your account](https://app.btree.at/setting/company) to get started.*
