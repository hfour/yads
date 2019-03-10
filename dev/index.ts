import { autorun } from 'mobx';
import { MArray } from '../src';
// import { printtree } from './utils';

const INITIAL_SIZE = 20000;
const ITERATIONS = 1000;

// ---------------------------
// Creating an array
const data: number[] = [];
for (let i = 0; i < INITIAL_SIZE; ++i) {
  data.push(i);
}

console.log(`\nCreating a ${INITIAL_SIZE} element array`);
console.time('time');
const array = MArray.from(data);
console.timeEnd('time');

const disposer = autorun(() => array.length);

console.log(`\nInserting ${INITIAL_SIZE} elements in an array of ${array.length}`);
console.time('time');
array.splice(INITIAL_SIZE / 2 - 1, 0, ...data);
console.timeEnd('time');

console.log(`\nDeleting ${INITIAL_SIZE} elements from an array of ${array.length}`);
console.time('time');
array.splice(INITIAL_SIZE / 2 - 1, INITIAL_SIZE);
console.timeEnd('time');

console.log(`\nInserting/removing various number of elements in an array of ${array.length}`);
[10, 5, 3, 1].forEach(num => {
  const insertees = Array(num).fill(3);
  console.time(`${ITERATIONS} iterations with ${num} items`);
  for (let i = 0; i < ITERATIONS; ++i) {
    const ins = Math.floor(Math.random() * INITIAL_SIZE);
    const rem = Math.floor(Math.random() * INITIAL_SIZE);
    array.splice(ins, 0, ...insertees);
    array.splice(rem, insertees.length);
  }
  console.timeEnd(`${ITERATIONS} iterations with ${num} items`);
});
