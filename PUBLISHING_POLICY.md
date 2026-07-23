# Public Publishing Policy

Publish only after the private archive write and safety checks succeed.

1. Copy the exact child-safe story body into the public schema.
2. Include only fictional title, date, summary, moral/fun purpose, fictional character names, public tags, reading time, accent, symbol, and paragraphs.
3. Run `npm run check`; any forbidden-data warning fails closed.
4. Run `npm run build` and inspect the generated story locally.
5. Commit with `publish: <story-id> <title>` and push to `main` only when automatic public publishing is enabled by the verified owner.
6. Verify the GitHub Actions deployment. If it fails, keep the private archive complete and mark website publication pending.

Never publish drafts, private canon proposals, Telegram metadata, request attribution, logs, prompts, moderation notes, system details, or real-child identifying information. Removing a public page does not erase Git history; use a repository history-rewrite incident procedure if sensitive data is ever committed, rotate exposed credentials, and assume clones may persist.
