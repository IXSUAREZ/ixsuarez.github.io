import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('./cards.js', import.meta.url), 'utf8');
const context = { window: {} }; vm.createContext(context); vm.runInContext(source, context);
const cards = context.window.FOI_CARDS;
const required = ['Maslow', 'Dr, Dr, CPR', 'MUA', 'G-STEP', 'RAMP', 'CAAR', 'REEPIR', 'RUAC', 'COIL', 'LIQIR', 'PAMS', 'P-PAR', 'FAST COCO', 'DR COVU', 'FIRCUPS', 'MACK BAG', '3 SAD', '14 CFR 61.87', '14 CFR 121.542', 'hazardous attitudes'];
if (!Array.isArray(cards) || cards.length < 200 || cards.length > 260) throw new Error(`Expected a curated 200-260 card deck, found ${cards?.length}`);
if (new Set(cards.map(card => card.prompt)).size !== cards.length) throw new Error('Duplicate card prompts found');
if (new Set(cards.map(card => card.id)).size !== cards.length) throw new Error('Duplicate card ids found');
if (cards.some(card => !card.id || !card.cardType || card.kind || /item \d+/i.test(card.prompt))) throw new Error('Found an invalid card shape, legacy kind, or generic item prompt');
for (const page of [1,2,3,4,5,6,7,8]) if (!cards.some(card => card.sourcePage === page)) throw new Error(`Missing source-page coverage: ${page}`);
for (const phrase of required) if (!source.includes(phrase)) throw new Error(`Missing required source concept: ${phrase}`);
const motivation = cards.filter(card => card.prompt === 'How can motivations vary?');
if (motivation.length !== 1 || !['positive or negative', 'tangible or intangible', 'obvious or subtle'].every(text => motivation[0].answer.toLowerCase().includes(text))) throw new Error('Motivation variations should be one coherent list card');
for (const term of ['compensation', 'projection', 'reaction formation', 'fantasy']) {
  if (!cards.some(card => card.prompt.toLowerCase() === `what is ${term}?`)) throw new Error(`Missing individual defense-mechanism card: ${term}`);
}
for (const prompt of ['What are the laws of learning? (REEPIR)', 'What is readiness in REEPIR?', 'What are the essential teaching skills? (PAMS)', 'What are People Skills in PAMS?']) {
  if (!cards.some(card => card.prompt === prompt)) throw new Error(`Missing mnemonic overview or named-term card: ${prompt}`);
}
console.log(`FOI Cards content audit passed: ${cards.length} curated cards, all 8 pages, ${required.length} anchor concepts.`);
