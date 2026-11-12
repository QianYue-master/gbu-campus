import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {bilingual, translations, translateNight} from '../src/bilingual.js';

test('known strings retain English and add Chinese, without double translation', () => {
  for (const [english, chinese] of Object.entries(translations)) {
    assert.equal(bilingual(english), `${english} / ${chinese}`);
    assert.equal(bilingual(bilingual(english)), bilingual(english));
  }
});
test('unknown text, numbers and empty values stay safe', () => {
  for (const value of ['New text', '30s', '0 / 4', '…', '']) assert.equal(bilingual(value), value);
  assert.equal(bilingual(null), '');
});
test('dynamic warning counts, timers and interactions remain bilingual', () => {
  for (const english of [
    '1 student is chasing', '4 students are chasing', 'Kick · 0.8s', 'Bell returns in 13s',
    'Checkpoint 2 / 4. Follow the next blue beacon.', 'Track beacon 1 / 4 · 30 units',
    'TRACK · 2 / 4', '3 memories are still waiting. M shows the campus routes.',
    'Reach the blue track beacons in order. 8 seconds remain.', 'The room sings: III',
    'The final lap — remembered. 1 remain.', 'The final lap — remembered. Return to the plaza gate.',
    'Final lap: blue beacon 2 of 4. Sprint to beat the clock.'
  ]) {
    const result = bilingual(english);
    assert.ok(result.startsWith(`${english} / `), english);
    assert.match(result, /[\u3400-\u9fff]/);
    assert.equal(bilingual(result), result);
  }
});
test('static translation does not touch daytime documents', () => {
  translateNight({body: {dataset: {campusMode: 'tour'}}});
});
test('UI translates display values but not gameplay state attributes', async () => {
  const source = await readFile(new URL('../src/ui.js', import.meta.url), 'utf8');
  assert.ok(source.includes('translateNight(document)'));
  assert.ok(source.includes('value = bilingual(value)'));
  assert.ok(source.includes("name === 'aria-label' || name === 'title' ? bilingual(value) : String(value)"));
});
