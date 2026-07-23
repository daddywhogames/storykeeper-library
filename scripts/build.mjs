import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import './check.mjs';

const root = new URL('../', import.meta.url);
const src = new URL('../src/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const storiesDir = new URL('../content/stories/', import.meta.url);

await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true, force: true });
await mkdir(new URL('./data/', dist), { recursive: true });

const files = (await readdir(storiesDir)).filter((name) => name.endsWith('.json')).sort();
const stories = [];
for (const file of files) stories.push(JSON.parse(await readFile(join(storiesDir.pathname, file), 'utf8')));
stories.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title));
await writeFile(new URL('./data/stories.json', dist), `${JSON.stringify(stories)}\n`);
await writeFile(new URL('./build-info.json', dist), `${JSON.stringify({ storyCount: stories.length, builtFrom: 'sanitized-public-content' })}\n`);
console.log(`Built Storykeeper Library with ${stories.length} public stor${stories.length === 1 ? 'y' : 'ies'}.`);
