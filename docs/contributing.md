# Contributing

## Setup

```bash
# Clone and install
git clone <repo>
cd langgraph-visual-modeler
npm install

# Run dev server
npm run dev
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes with commits
3. Run tests: `npm run test:run && npm run types && npm run lint`
4. Push and create PR

## Code Style

- **TypeScript** — Strict mode enabled
- **ESLint** — Run `npm run lint` before committing
- **File naming** — `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Exports** — Prefer named exports; default only for React components

## Commit Conventions

Follow Conventional Commits:

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code change without feature change
- `test:` — Adding/updating tests
- `docs:` — Documentation
- `chore:` — Build/config changes

## Adding a New Node Type

1. Define type in `src/models/graph.ts`
2. Add color scheme in `src/features/canvas/nodes/CustomNode.tsx`
3. Create config component in `src/features/canvas/node-configs/`
4. Add icon to `getNodeIcon()` function
5. Update palette in `src/features/canvas/NodePalette.tsx`

## Adding a New Template

1. Create `GraphModel` in `src/models/template.ts`
2. Add to `TEMPLATES` constant
3. Test import/export flow

## Running Tests Before PR

```bash
# Full check
npm run types       # TypeScript
npm run lint        # ESLint
npm run test:run    # Unit tests
npm run test:e2e    # E2E tests (if changed UI)
```
