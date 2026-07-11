/**
 * Pure unit checks for skillVariants — run with:
 *   cd backend && npx ts-node src/utils/skillVariants.test.ts
 * No test framework needed; node:assert throws on the first mismatch.
 */
import assert from 'node:assert/strict';
import { skillVariants } from './skillVariants';

assert.deepEqual(skillVariants('machine learning'), ['machine learning', 'Machine Learning', 'MACHINE LEARNING']);
assert.deepEqual(skillVariants('Machine Learning'), ['Machine Learning', 'machine learning', 'MACHINE LEARNING']);
assert.deepEqual(skillVariants('SQL'), ['SQL', 'sql', 'Sql']);
assert.deepEqual(skillVariants('  Data  '), ['Data', 'data', 'DATA']);
assert.deepEqual(skillVariants('human-computer interaction'), [
  'human-computer interaction',
  'Human-Computer Interaction',
  'HUMAN-COMPUTER INTERACTION',
]);
assert.deepEqual(skillVariants(''), []);
assert.deepEqual(skillVariants('   '), []);

// eslint-disable-next-line no-console
console.log('skillVariants: all assertions passed');
