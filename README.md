# `@railway/mcp-server` is deprecated

Railway MCP is now bundled into the Railway CLI.

This npm package no longer contains the standalone TypeScript MCP server. It is a compatibility shim that launches:

```bash
railway mcp
```

## Migration

Install or upgrade the Railway CLI:

```bash
bash <(curl -fsSL https://railway.com/install.sh)
```

Then configure supported MCP clients:

```bash
railway mcp install
```

To configure the hosted MCP server instead of the local stdio server:

```bash
railway mcp install --remote
```

You can also configure a local MCP client directly with:

```json
{
  "mcpServers": {
    "railway": {
      "command": "railway",
      "args": ["mcp"]
    }
  }
}
```

Remove old client entries that run:

```bash
npx -y @railway/mcp-server
```

## Compatibility

For existing configs that still invoke `@railway/mcp-server`, this package delegates to `railway mcp`.

If the Railway CLI is missing, the package exits with migration instructions.

## Docs

See the Railway CLI MCP docs: https://docs.railway.com/cli/mcp
