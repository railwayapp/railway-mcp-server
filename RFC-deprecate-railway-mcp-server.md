# Deprecate `@railway/mcp-server`

# Background

`@railway/mcp-server` is a TypeScript package published to npm from `github.com/railwayapp/railway-mcp-server`.

It currently exposes a local stdio MCP server through:

```bash
npx -y @railway/mcp-server
```

The retiring standalone package version is `0.1.11`, and the package is registered in the MCP Registry as `io.github.railwayapp/mcp-server`.

The Railway CLI now includes the supported MCP server directly:

```bash
railway mcp
```

The CLI also configures supported clients:

```bash
railway mcp install
railway mcp install --remote
railway mcp install --agent cursor
```

The CLI-bundled implementation is the supported path and has a broader tool surface than the standalone package.

Keeping both implementations public creates duplicate installation paths, stale docs, split registry metadata, and ongoing release risk for an obsolete package.

# Problem

`@railway/mcp-server` remains installable and discoverable even though the supported implementation now ships with the Railway CLI.

Users can still configure new clients against a stale package, and existing `npx`-based configs will keep launching the old implementation without an intentional migration path.

The standalone package needs to be retired without abruptly breaking existing client configs.

# Requirements

p0:

- Publish one final npm version that removes the standalone TypeScript MCP server.
- Make the final package delegate to `railway mcp`.
- Print clear migration guidance if the Railway CLI is missing.
- Deprecate the full npm package with a migration message.
- Mark all MCP Registry versions as deprecated with a migration message.
- Remove or disable package release automation after the final publish.
- Replace the repository README with deprecation and migration guidance.
- Remove old install snippets that reference `npx -y @railway/mcp-server`.
- Verify that `npx -y @railway/mcp-server` still gives existing users a working path or clear error.
- Verify that npm install output shows the deprecation warning.

p2:

- Replace repository contents with a tombstone README and license only.
- Archive the GitHub repository after npm and MCP Registry deprecation are verified.
- Remove package-specific references from Railway-owned docs and install surfaces outside this repository.
- Open cleanup requests for important third-party indexes that still recommend the npm package.

# Proposed Solution

Ship a final compatibility release for `@railway/mcp-server`.

The final package must not contain the old MCP server implementation. Its bin only launches the Railway CLI-bundled server:

```bash
railway mcp
```

If `railway` is not installed, the shim writes migration guidance to stderr and exits non-zero. It must not print non-protocol text to stdout during normal startup.

After the final release is published:

1. Deprecate the npm package.
2. Deprecate all MCP Registry versions.
3. Disable old release automation.
4. Tombstone the repository docs.
5. Remove old install references from Railway-controlled docs and examples.

Suggested npm deprecation message:

```text
Deprecated: Railway MCP is now bundled into the Railway CLI. Use `railway mcp` or run `railway mcp install`. See https://docs.railway.com/cli/mcp.
```

Suggested MCP Registry status command:

```bash
mcp-publisher status --status deprecated --all-versions \
  --message "Deprecated: use the Railway CLI bundled MCP server via 'railway mcp' or 'railway mcp install'." \
  io.github.railwayapp/mcp-server
```

### Alternative Solutions

Deprecate npm without a final compatibility release:

- This is simpler, but existing `npx -y @railway/mcp-server` configs would keep running the stale implementation.

Unpublish the npm package:

- This is not available in practice. The package is older than 72 hours, has multiple maintainers, and exceeds npm's weekly download threshold for unpublish eligibility.

Delete the GitHub repository immediately:

- This removes the canonical migration page too early and makes npm metadata links less useful during the transition.

Keep maintaining the package as a wrapper indefinitely:

- This preserves a duplicate public package after the supported implementation has moved into the CLI.

# Architectural Changes

Current path:

```text
MCP client
  -> npx -y @railway/mcp-server
  -> standalone TypeScript MCP server
  -> Railway CLI and Railway APIs
```

Proposed compatibility path:

```text
MCP client
  -> npx -y @railway/mcp-server
  -> compatibility shim
  -> railway mcp
  -> CLI-bundled MCP server
```

Proposed new install path:

```text
MCP client
  -> railway mcp
  -> CLI-bundled MCP server
```

Proposed remote path:

```text
MCP client
  -> https://mcp.railway.com
```

Repository changes:

- Delete the old MCP server source code from `src`.
- Replace the package entrypoint with a minimal `railway mcp` shim.
- Remove obsolete dependencies, tests, and build tooling.
- Keep only files required to publish the final package.
- Replace README content with migration instructions.
- Remove the MCP Registry publish workflow after final status changes are complete.

npm changes:

- Publish final compatibility version.
- Deprecate the entire package.
- Leave the package name reserved to prevent reuse or confusion.

MCP Registry changes:

- Set all versions of `io.github.railwayapp/mcp-server` to `deprecated`.
- Include the CLI migration path in the status message.

Docs changes:

- Replace `npx -y @railway/mcp-server` with `railway mcp`.
- Prefer `railway mcp install` for client setup.
- Prefer `railway mcp install --remote` or `https://mcp.railway.com` where hosted MCP is desired.

# Notes

npm package data is effectively immutable for this package. Deprecation is the supported registry mechanism here.

The compatibility shim must not become a new maintained server. It exists only to move existing `npx` users onto the CLI-bundled implementation.

The GitHub repository can be deleted later, but archiving first gives users and package metadata a stable migration target during the transition.

After a grace period, the MCP Registry entry can be moved from `deprecated` to `deleted` if it should be hidden from default discovery.
