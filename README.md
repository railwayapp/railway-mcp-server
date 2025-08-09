# Railway MCP Server (Experimental)

A Model Context Protocol (MCP) server for interacting with your Railway account. This is a local MCP server provides a set of opinionated workflows and tools for managing Railway resources.

> [!IMPORTANT]
> This is an experimental project (like really experimental). You should expect bugs and missing features. The MCP server doesn't include destructive actions by design, that said, you should still keep an eye on which tools and commands are being executed.

## Prerequisites

The [Railway CLI](https://docs.railway.com/guides/cli) is required for this server to function.

## Installation

One-click installation is supported for:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=railway-mcp-server&config=JTdCJTIyY29tbWFuZCUyMiUzQSUyMm5weCUyMC15JTIwJTQwcmFpbHdheSUyRm1jcC1zZXJ2ZXIlMjIlN0Q%3D)

[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_railway--mcp--server-0098FF?style=for-the-badge&logo=visualstudiocode&logoColor=ffffff)](vscode:mcp/install?%7B%22name%22%3A%22railway-mcp-server%22%2C%22type%22%3A%22stdio%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40railway%2Fmcp-server%22%5D%7D)

<details>
<summary><strong>Manual Installation</strong></summary>


   Add the following configuration to your MCP client (e.g., Cursor, VSCode)
   
   Cursor: `.cursor/mcp.json`

   ```json
   {
     "mcpServers": {
       "railway-mcp-server": {
         "command": "npx",
         "args": ["-y", "@railway/mcp-server"],
       }
     }
   }
   ```

   VSCode: `.vscode/mcp.json`

   ```json
   
   {
     "servers": {
       "railway-mcp-server": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "@railway/mcp-server"],
       }
     }
   }
   ```
   

</details>

## Example Usage

Creating a new project, deploying it, and generating a domain

```text
Create a Next.js app in this directory and deploy it to Railway. Make sure to also assign it a domain. Since we're starting from scratch, there is no need to pull information about the deployment or build for now
```


Deploy a from a template (database, queue, etc.). Based on your prompt, the appropriate template will be selected and deployed. In case of multiple templates, the agent will pick the most appropriate one. Writing a detailed prompt will lead to a better selection. [Check out all of the available templates](https://railway.com/deploy).

```text
Deploy a Postgres database
```

```text
Deploy a single node Clickhouse database
```


Pulling environment variables

```text
I would like to pull environment variables for my project and save them in a .env file
```

Creating a new environment and setting it as the current linked environment
```text
I would like to create a new development environment called `development` where I can test my changes. This environment should duplicate production. Once the environment is created, I want to set it as my current linked environment
```

## Available MCP Tools

The Railway MCP Server provides the following tools for managing your Railway infrastructure:

- `check-railway-status` - Checks that the Railway CLI is installed and that the user is logged in
- Project Management
  - `list-projects` - List all Railway projects
  - `create-project-and-link` - Create a new project and link it to the current directory
- Service Management
  - `list-services` - List all services in a project
  - `link-service` - Link a service to the current directory
  - `deploy` - Deploy a service
  - `deploy-template` - Deploy a template from the [Railway Template Library](https://railway.com/deploy)
- Environment Management
  - `create-environment` - Create a new environment
  - `link-environment` - Link an environment to the current directory
- Configuration & Variables
  - `list-variables` - List environment variables
  - `set-variables` - Set environment variables
  - `generate-domain` - Generate a railway.app domain for a project
- Monitoring & Logs
  - `get-logs` - Retrieve build or deployment logs for a service


## Development

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 10.14.0


1. **Clone the repository**
   ```bash
   git clone https://github.com/railwayapp/railway-mcp-server.git
   cd railway-mcp-server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

   This command will generate a build under `dist/` and automatically rebuild after making changes.

4. **Configure your MCP client**
   
   Add the following configuration to your MCP client (e.g., Cursor, VSCode) and replace `/path/to/railway-mcp-server/dist/index.js` with the actual path to your built server.
   
   Cursor: `.cursor/mcp.json`

   ```json
   {
     "mcpServers": {
       "railway-mcp-server": {
         "command": "node",
         "args": ["/path/to/railway-mcp-server/dist/index.js"],
       }
     }
   }
   ```

   VSCode: `.vscode/mcp.json`

   ```json
   
   {
     "servers": {
       "railway-mcp-server": {
         "type": "stdio",
         "command": "node",
         "args": ["/path/to/railway-mcp-server/dist/index.js"],
       }
     }
   }
   ```
