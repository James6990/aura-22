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

## Chat ↔ Termux workflow

Termux is the primary development environment.

Use Termux to:

- create and edit files;
- run npm commands;
- execute tests;
- perform builds;
- manage Git commits, branches, and pushes.

ChatGPT is the engineering partner.

Use ChatGPT to:

- review architecture;
- design features;
- explain implementation decisions;
- generate code;
- debug problems;
- review test failures.

### Communication rules

- Prefer complete files or complete implementation sections when they are quicker to apply in Termux.
- Avoid copying very large code blocks into ChatGPT unless they are specifically required for review.
- When requesting help, provide only the relevant code, command output, or error needed to continue.
- Do not paste commands back into ChatGPT; only provide their output when useful.
- Keep conversations focused on the active milestone.

### Conversation management

If a conversation becomes large or unstable:

1. Finish the current verified milestone where practical.
2. Perform the normal Hard Save workflow.
3. Start a fresh conversation.
4. Resume from the repository using the Apex Startup Protocol.

The repository and its documentation remain Apex's durable memory.
Chat history is temporary working context and must never replace the repository.

## Architectural rules

- Domain logic remains independent of storage.
- Services coordinate workflows.
- Repositories handle persistence.
- Events represent meaningful changes.
- Safety overrides progression.
- Cross-user data must be rejected.
