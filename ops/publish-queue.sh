#!/bin/zsh
set -eu

export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

LIBRARY="/Users/djstd/Documents/Openclaw/storykeeper-library"
QUEUE="/Users/djstd/Documents/Openclaw/storykeeper-workspace/data/publication-queue"
PUBLISHED="/Users/djstd/Documents/Openclaw/storykeeper-workspace/data/publication-published"
LOCK="/private/tmp/storykeeper-library-publisher.lock"

if ! mkdir "$LOCK" 2>/dev/null; then
  exit 0
fi
trap 'rmdir "$LOCK"' EXIT

setopt null_glob
queued=("$QUEUE"/*.json)
if (( ${#queued[@]} == 0 )); then
  exit 0
fi

cd "$LIBRARY"
node scripts/import-queue.mjs "$QUEUE" "$LIBRARY/content/stories"
npm run check
npm run build

git add content/stories
if git diff --cached --quiet; then
  for source in "${queued[@]}"; do
    stamp="$(date -u +%Y%m%dT%H%M%SZ)"
    mv "$source" "$PUBLISHED/${source:t:r}.$stamp.json"
  done
  exit 0
fi

git commit -m "Publish queued Storykeeper story updates"
git push origin main

for source in "${queued[@]}"; do
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  mv "$source" "$PUBLISHED/${source:t:r}.$stamp.json"
done
