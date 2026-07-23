# Storykeeper Library

A public, child-friendly static story library for GitHub Pages. It publishes sanitized fictional content only. Telegram IDs, participant names, prompts, logs, canonical operational metadata, credentials, and private chat content must never enter this repository.

## Local validation

```sh
npm run check
npm run build
```

The generated site is written to `dist/`. GitHub Actions validates and publishes it whenever `main` changes.

## Add a story

Create one JSON file in `content/stories/` following `content/story.schema.json`. Use a stable story ID and include only the story text and public fictional metadata. The build creates the search catalog automatically; do not hand-edit generated files.

## Privacy boundary

This repository is intended to be public. Never include:

- Telegram group/user IDs, usernames, display names, or message history
- bot/model tokens, credentials, local paths, or logs
- system prompts, moderation notes, request IDs, hashes tied to participants, or private canon proposals
- real children's names, schools, addresses, birthdays, photos, or identifying details

The authoritative archive remains in the private Storykeeper workspace. This site receives a sanitized publication copy only.
