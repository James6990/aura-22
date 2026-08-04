# Apex Developer Handbook

## Build workflow

1. Inspect existing contracts.
2. Build one focused capability.
3. Export it.
4. Create a dedicated test.
5. Register the test.
6. Run `npm run apex:quick`.
7. Resolve every test and type error.
8. Update project documentation.
9. Run `npm run docs:check`.
10. Create a checkpoint.
11. Push to `apex-foundation-1.0`.

## Terminal workflow

When creating files in Termux, always provide a complete command block containing:

- `cd ~/aura-22`
- `mkdir -p`
- `cat > file <<'EOF'`
- the complete file contents
- `EOF`

Do not instruct the user to paste raw TypeScript directly into Bash.

## Architectural rules

- Domain logic remains independent of storage.
- Services coordinate workflows.
- Repositories handle persistence.
- Events represent meaningful changes.
- Safety overrides progression.
- Cross-user data must be rejected.
