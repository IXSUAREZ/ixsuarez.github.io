import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('./cards.js', import.meta.url), 'utf8');
const context = { window: {} }; vm.createContext(context); vm.runInContext(source, context);
const cards = context.window.FOI_CARDS;
const required = ['Maslow', 'Dr, Dr, CPR', 'MUA', 'G-STEP', 'RAMP', 'CAAR', 'REEPIR', 'RUAC', 'COIL', 'LIQIR', 'PAMS', 'P-PAR', 'FAST COCO', 'DR COVU', 'FIRCUPS', 'MACK BAG', '3 SAD', '14 CFR 61.87', '14 CFR 121.542', 'hazardous attitudes'];
if (!Array.isArray(cards) || cards.length < 250) throw new Error(`Expected 250+ cards after atomic split, found ${cards?.length}`);
if (new Set(cards.map(card => card.prompt)).size !== cards.length) throw new Error('Duplicate card prompts found');
for (const page of [1,2,3,4,5,6,7,8]) if (!cards.some(card => card.sourcePage === page)) throw new Error(`Missing source-page coverage: ${page}`);
for (const phrase of required) if (!source.includes(phrase)) throw new Error(`Missing required source concept: ${phrase}`);
const atomics = cards.filter(card => card.kind === 'atomic');
const recaps = cards.filter(card => card.kind === 'recap');
if (!atomics.length || !recaps.length) throw new Error('Expected both atomic and recap cards');
for (const term of ['compensation', 'projection', 'reaction formation', 'fantasy']) {
  if (!atomics.some(card => card.prompt.toLowerCase() === `what is ${term}?`)) throw new Error(`Missing atomic defense-mechanism card: ${term}`);
}
console.log(`FOI Cards content audit passed: ${cards.length} cards (${atomics.length} atomic, ${recaps.length} recap), all 8 pages, ${required.length} anchor concepts.`);
