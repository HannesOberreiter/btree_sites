# MCP Registry

`server.json` is the entry of the b.tree MCP server in the official MCP Registry (registry.modelcontextprotocol.io). The server name `at.btree/beekeeping-manager` uses DNS authentication on `btree.at`.

The MCP Server Card in `packages/btree_info/public/.well-known/ai-catalog.json` has the same fields. `scripts/mcp-registry.test.mjs` fails when the two files differ.

## Publish a new version

The registry does not accept the same version two times.

1. Increase `version` in `server.json` and in the server card of `ai-catalog.json`.
2. Run `pnpm test`.
3. Log in with the key from the macOS Keychain:

   ```zsh
   MCP_PRIVATE_KEY="$(security find-generic-password \
     -a "$USER" -s MCP_REGISTRY_PRIVATE_KEY -w)" \
     mcp-publisher login dns --domain btree.at
   ```

4. Publish from this directory:

   ```zsh
   cd mcp-registry && mcp-publisher publish
   ```

5. Check the entry:

   ```zsh
   curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=at.btree/beekeeping-manager"
   ```

## First setup

Do these steps one time. The private key never goes into Git.

1. Install the CLI: `brew install mcp-publisher`.
2. Make an Ed25519 key in a temporary directory. The macOS `openssl` (LibreSSL) does not support Ed25519, so use OpenSSL 3:

   ```zsh
   OPENSSL=/opt/homebrew/opt/openssl@3/bin/openssl
   cd "$(mktemp -d)"
   $OPENSSL genpkey -algorithm Ed25519 -out key.pem
   ```

3. Save the private key (hex) in the macOS Keychain:

   ```zsh
   security add-generic-password -U -a "$USER" \
     -s MCP_REGISTRY_PRIVATE_KEY \
     -w "$($OPENSSL pkey -in key.pem -noout -text \
       | sed -n '/priv:/,/pub:/p' | sed '1d;$d' | tr -d ' :\n')"
   ```

4. Print the TXT record value:

   ```zsh
   echo "v=MCPv1; k=ed25519; p=$($OPENSSL pkey -in key.pem \
     -pubout -outform DER | tail -c 32 | base64)"
   ```

5. Delete the key file: `rm key.pem`.
6. Add the value as a TXT record on the apex `btree.at` in the Hetzner DNS console. Keep the existing TXT records (SPF, Google site verification). Do not use a sub-name such as `_mcp`: the registry reads only the apex.
7. Wait until `dig +short TXT btree.at` shows the record.
8. Do the steps of "Publish a new version" from step 3.

When you change the key, remove the old TXT record. The registry tries an old record first, and the login fails.
