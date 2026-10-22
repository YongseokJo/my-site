import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
import { pathToFileURL } from 'node:url';

const records = new Map();
const db = {
  rateLimit: async () => true,
  putPaperShare: async (token, data) => records.set(token, data),
  getPaperShare: async token => records.get(token),
  prepareShareImage: async () => {},
  hasShareImage: async () => false,
};
globalThis.__collectionShareTestEnv = { LINKEDIN_STORE: { idFromName: x => x, get: () => db } };
const source = await fs.readFile(new URL('../src/lib/paper-share-server.ts', import.meta.url), 'utf8');
const titleModule = pathToFileURL(new URL('../src/lib/paper-title-text.ts', import.meta.url).pathname).href;
let compiled = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext}}).outputText;
compiled = compiled.replace('from "./paper-title-text"', `from ${JSON.stringify(titleModule)}`)
  .replace('import { env } from "cloudflare:workers";', 'const env = globalThis.__collectionShareTestEnv;');
const api = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const paper = { title: 'A paper', url: 'https://arxiv.org/abs/2610.10522', authors: ['A. Author'] };
const request = data => new Request('https://example.test/readea/share/bundle', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)});
const named = {version: 1, collectionName: 'Early SMBH formation', collectionDescription: 'My introduction to early black holes.', papers: Array(500).fill(paper)};
const created = await api.createPaperShare(request(named));
assert.equal(created.status, 201);
const {url} = await created.json();
const fetched = await api.getPaperShare(new Request(url));
const restored = await fetched.json();
assert.equal(restored.collectionName, named.collectionName);
assert.equal(restored.collectionDescription, named.collectionDescription);
assert.equal(restored.papers.length, 500);
const preview = await api.sharePreviewMetadata(new URL(url).searchParams.get('id'));
assert.equal(preview.title, named.collectionName);
assert.equal(preview.description, named.collectionDescription);
assert.equal((await api.createPaperShare(request({...named, collectionDescription: "a".repeat(2001)}))).status, 400);
assert.equal((await api.createPaperShare(request({...named, papers: Array(501).fill(paper)}))).status, 400);
assert.equal((await api.createPaperShare(request({version:1, papers:Array(41).fill(paper)}))).status, 400);
assert.equal((await api.createPaperShare(request({version:1, papers:[paper]}))).status, 201);
for (const name of ['', ' ', 'a'.repeat(201), 9, '<i></i>']) {
  assert.equal((await api.createPaperShare(request({...named, collectionName:name}))).status, 400);
}
delete globalThis.__collectionShareTestEnv;
console.log('Collection sharing: 500-paper round trip, named preview, legacy links and invalid limits passed.');
