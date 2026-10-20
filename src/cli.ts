#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { explain } from './explain.js';

const [command, file] = process.argv.slice(2);

if (command !== 'explain' || !file) {
  console.error('Verwendung: receipt explain <datei.json>');
  process.exit(2);
}

try {
  const tx = JSON.parse(readFileSync(file, 'utf8'));
  console.log(explain(tx));
} catch (error) {
  console.error(`Fehler: ${(error as Error).message}`);
  process.exit(1);
}
