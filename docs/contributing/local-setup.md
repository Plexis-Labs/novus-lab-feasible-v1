# Local Setup Guide

Get running in under 30 minutes with these simple steps.

## Prerequisites

- **Node.js**: 18.x or higher
- **pnpm**: 11.9.0 or higher (install via `npm install -g pnpm`)
- **Git**: Clone the repository first

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd novus-lab-feasible-v1
```

### 2. Install Dependencies

Using pnpm (required for this monorepo):

```bash
pnpm install
```

This installs all dependencies across the workspace, including:

- Extension lab (`apps/extension-lab`)
- Sandbox app (`apps/sandbox-app`)
- Shared utilities (`packages/shared`)

### 3. Set Up Environment Variables

Copy the example environment file to create your local configuration:

```bash
cp .env.example .env
```

The `.env` file configures:

- **NOVUS_AI_PROVIDER**: Set to `mock` for development (no API keys needed)
- **NOVUS_LOG_LEVEL**: Set to `debug` for verbose logging, `info` for normal

Example `.env`:

```env
NOVUS_AI_PROVIDER=mock
NOVUS_LOG_LEVEL=debug
NOVUS_ENV=development
```

### 4. Start Development Server

```bash
pnpm dev
```

This starts:

- **Sandbox App**: Running at `http://localhost:5173`
- **Service Worker**: Available for debugging
- **Watch mode**: Automatically rebuilds on file changes

## Next Steps

### View the Application

Open your browser and navigate to `http://localhost:5173` to see the sandbox app running.

### Run Tests

```bash
pnpm test
```

Runs all tests with Vitest. Watch mode rebuilds on changes.

### Build for Production

```bash
pnpm build
```

Compiles TypeScript and bundles all packages.

### Linting

```bash
pnpm lint
```

Checks code style with ESLint.

## Debugging in VS Code

The repository includes pre-configured launch profiles:

1. Open **Run and Debug** (Ctrl+Shift+D / Cmd+Shift+D)
2. Select a configuration:
   - **Extension**: Debug the browser extension
   - **Sandbox App**: Debug the web app with DevTools
   - **Unit Tests (Vitest)**: Run tests with debugger attached
   - **Full Stack**: Debug everything at once

Set breakpoints and step through code with full IDE support.

## Troubleshooting

### `pnpm: command not found`

Install pnpm globally:

```bash
npm install -g pnpm
```

### Dependencies won't install

Clear pnpm cache and reinstall:

```bash
pnpm store prune
pnpm install
```

### Port 5173 already in use

The sandbox app will auto-increment to 5174, 5175, etc., or manually specify:

```bash
pnpm dev -- --port 5180
```

### Environment variables not loading

Verify `.env` exists in the root directory and is not in `.gitignore`.

## Development Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally with `pnpm dev`
3. Run tests to ensure nothing broke: `pnpm test`
4. Lint code: `pnpm lint`
5. Commit and push: `git commit -m "feat: ..." && git push`

## File Structure

```
novus-lab-feasible-v1/
├── apps/
│   ├── extension-lab/     # Browser extension source
│   ├── sandbox-app/       # Web app frontend (Vite + React)
│   └── test-website/      # Test harness
├── packages/
│   └── shared/            # Shared utilities, types, errors, logger
├── docs/
│   ├── contributing/      # Developer guides
│   ├── architecture/      # Design decisions
│   └── security/          # Security documentation
├── .vscode/               # VS Code settings & debug configs
├── .env.example           # Example environment file
├── pnpm-workspace.yaml    # Monorepo configuration
└── package.json           # Root workspace config
```

## Key Features

- **Mock Mode**: Develop without any API keys using the `mock` provider
- **Structured Logging**: All logs go through `pino` for consistency
- **Type Safety**: Full TypeScript with strict mode enabled
- **Error Handling**: Centralized error classes for consistent error management
- **Hot Reload**: Changes rebuild automatically during `pnpm dev`

## Need Help?

- Check `docs/architecture/` for design decisions
- Review `docs/security/` for security practices
- See `docs/adr/` for architecture decision records
- Ask in team chat or create an issue

---

**Happy coding!** 🚀
