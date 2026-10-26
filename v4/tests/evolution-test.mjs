import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const box = { window: {} };
vm.runInNewContext(readFileSync(new URL('../data.js', import.meta.url), 'utf8'), box);
const E = box.window.RPB_EVOLUTION;
const spec = box.window.RPB.evolution;
let checks = 0;
function check(fn) { fn(); checks++; }
check(() => assert.equal(spec.evidence.length, 5));
check(() => assert.equal(spec.community.length, 5));
for (const b of box.window.RPB.bridges) check(() => assert.equal(E.clean(b.evolution).evidence, 'Conceptual'));
check(() => assert.equal(E.clean(undefined).history.length, 0));
let e = E.initial();
for (let i = 0; i < 5; i++) {
  e = E.record(e, spec.evidence[i], spec.community[i], 'Documented review in this context', `2026-10-2${i}T12:00:00.000Z`);
  check(() => assert.equal(e.evidence, spec.evidence[i]));
}
check(() => assert.equal(E.record(e, 'Emerging', 'Reviewed', 'Correction after review', '2026-10-25T12:00:00.000Z').community, 'Reviewed'));
check(() => assert.throws(() => E.record(e, 'Invalid', 'Reviewed', 'Review')));
check(() => assert.throws(() => E.record(e, 'Tested', 'Adapted', '  ')));
check(() => assert.throws(() => E.record(e, 'Tested', 'Adapted', 'x'.repeat(1001))));
check(() => assert.throws(() => E.clean({ ...e, evidence: 'Conceptual' })));
check(() => assert.throws(() => E.clean({ ...e, history: [{ ...e.history[0], at: 'invalid' }] })));
check(() => assert.throws(() => E.clean({ ...e, history: [{ ...e.history[0], from: { evidence: 'Tested', community: 'Proposed' } }] })));
check(() => assert.equal(JSON.stringify(E.clean(JSON.parse(JSON.stringify(e)))), JSON.stringify(e)));
check(() => assert.throws(() => E.clean({ ...e, schema: 99 })));
console.log(`Passed ${checks} lifecycle model checks.`);
