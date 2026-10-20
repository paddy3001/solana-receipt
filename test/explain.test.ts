import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { explain } from '../src/explain.js';

const SENDER = '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs';
const RECEIVER = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';

const load = (): any => JSON.parse(readFileSync('fixtures/sol-transfer.json', 'utf8'));

test('erklärt Absender, Empfänger, Betrag und Unterschrift', () => {
  const text = explain(load());

  assert.ok(text.includes(SENDER), 'Absender fehlt');
  assert.ok(text.includes(RECEIVER), 'Empfänger fehlt');
  assert.ok(text.includes('1,5 SOL'), 'Betrag fehlt');
  assert.ok(text.includes('unterschrieben'), 'Unterschrift fehlt');
});

test('schlägt fehl, wenn der Betrag fehlt', () => {
  const tx = load();
  tx.transaction.message.instructions = [];

  assert.throws(() => explain(tx), /SOL-Betrag/);
});

test('schlägt fehl, wenn die Unterschrift fehlt', () => {
  const tx = load();
  tx.transaction.signatures = [];

  assert.throws(() => explain(tx), /Unterschrift/);
});

test('schlägt fehl, wenn der Absender nicht als Signer markiert ist', () => {
  const tx = load();
  tx.transaction.message.accountKeys[0].signer = false;

  assert.throws(() => explain(tx), /Unterschrift/);
});

test('sagt bei gesetztem meta.err, dass die Transaktion fehlgeschlagen ist', () => {
  const tx = load();
  tx.meta.err = { InstructionError: [0, { Custom: 1 }] };

  const text = explain(tx);

  assert.ok(text.includes('fehlgeschlagen'), 'Fehlschlag fehlt');
  assert.ok(!text.includes('überweist'), 'Absatz behauptet eine Überweisung');
});
