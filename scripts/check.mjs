import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = new URL('../content/stories/', import.meta.url);
const files = (await readdir(dir)).filter((name) => name.endsWith('.json')).sort();
if (!files.length) throw new Error('At least one public story is required.');

const ids = new Set();
const allowedKeys = new Set(['id','title','publishedAt','summary','purpose','heroes','villains','tags','readingMinutes','accent','symbol','body']);
const forbidden = /telegram|chat[_ -]?id|user[_ -]?id|token|password|secret|prompt|\/Users\/|@Cheng|requested_by|group_scope/i;

for (const file of files) {
  const raw = await readFile(join(dir.pathname, file), 'utf8');
  if (forbidden.test(raw)) throw new Error(`${file}: possible private or operational data detected`);
  const story = JSON.parse(raw);
  for (const key of Object.keys(story)) if (!allowedKeys.has(key)) throw new Error(`${file}: unexpected key ${key}`);
  for (const key of ['id','title','publishedAt','summary','purpose','heroes','villains','tags','readingMinutes','accent','symbol','body']) {
    if (!(key in story)) throw new Error(`${file}: missing ${key}`);
  }
  if (!/^STY-[A-Z0-9-]+$/.test(story.id)) throw new Error(`${file}: invalid id`);
  if (ids.has(story.id)) throw new Error(`${file}: duplicate id ${story.id}`);
  ids.add(story.id);
  if (!Array.isArray(story.body) || !story.body.length || story.body.some((p) => typeof p !== 'string' || !p.trim())) throw new Error(`${file}: invalid body`);
  if (!Array.isArray(story.tags) || story.tags.some((tag) => !/^[a-z0-9-]+$/.test(tag))) throw new Error(`${file}: invalid tags`);
  if (!Number.isInteger(story.readingMinutes) || story.readingMinutes < 1 || story.readingMinutes > 30) throw new Error(`${file}: invalid readingMinutes`);
}

console.log(`Validated ${files.length} public stor${files.length === 1 ? 'y' : 'ies'}.`);
