import { copyFile, mkdir, readdir, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const [queueArg, contentArg] = process.argv.slice(2);
if (!queueArg || !contentArg) throw new Error('Usage: node scripts/import-queue.mjs QUEUE_DIR CONTENT_DIR');

const queueDir = resolve(queueArg);
const contentDir = resolve(contentArg);
await mkdir(contentDir, { recursive: true });

const allowedKeys = new Set(['id','title','publishedAt','summary','purpose','heroes','villains','tags','readingMinutes','accent','symbol','body']);
const requiredKeys = [...allowedKeys];
const forbidden = /telegram|chat[_ -]?id|user[_ -]?id|token|password|secret|system[_ -]?prompt|\/Users\/|@Cheng|requested_by|group_scope/i;
const files = (await readdir(queueDir)).filter((name) => name.endsWith('.json')).sort();

for (const file of files) {
  if (basename(file) !== file) throw new Error(`Unsafe queue filename: ${file}`);
  const source = join(queueDir, file);
  const raw = await readFile(source, 'utf8');
  if (forbidden.test(raw)) throw new Error(`${file}: possible private or operational data detected`);
  const story = JSON.parse(raw);
  for (const key of Object.keys(story)) if (!allowedKeys.has(key)) throw new Error(`${file}: unexpected key ${key}`);
  for (const key of requiredKeys) if (!(key in story)) throw new Error(`${file}: missing ${key}`);
  if (!/^STY-[A-Z0-9-]+$/.test(story.id)) throw new Error(`${file}: invalid story id`);
  if (file !== `${story.id}.json`) throw new Error(`${file}: filename must match story id`);
  if (!Array.isArray(story.body) || !story.body.length || story.body.some((paragraph) => typeof paragraph !== 'string' || !paragraph.trim())) throw new Error(`${file}: invalid story body`);
  await copyFile(source, join(contentDir, file));
  console.log(`Imported ${story.id}`);
}

console.log(`Imported ${files.length} queued publication${files.length === 1 ? '' : 's'}.`);
