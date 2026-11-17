# MCP Registry

`server.json` is the entry of the b.tree MCP server in the official MCP Registry (registry.modelcontextprotocol.io).

The MCP Server Card in `packages/btree_info/public/.well-known/ai-catalog.json` has the same fields. `scripts/mcp-registry.test.mjs` fails when the two files differ. When you change `version`, change it in both files.

The publish steps are in the private infra repository (`mcp-registry/README.md`).
