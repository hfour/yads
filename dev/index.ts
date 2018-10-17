import 'babel-polyfill';
import { autorun } from 'mobx';
import { fromArray, atIndex, insert, remove, Size, INode } from '../src';
import { printtree } from '../tests/test.util';

const INITIAL_SIZE = 20;
const ITERATIONS = 1000;

// ---------------------------
// Creating an array
console.log(`Creating a ${INITIAL_SIZE} element array by pushing numbers:`);
console.time('time');
const data: number[] = [];
for (let i = 0; i < INITIAL_SIZE; ++i) {
  data.push(i);
}
console.timeEnd('time');
console.log(`Create an array with ${data.length} elements`);

// ---------------------------
// Creating a tree
console.log(`Creating a ${INITIAL_SIZE} element tree by pushing numbers:`);
console.time('time');
const tree = fromArray(data);
console.timeEnd('time');
console.log(`Create a tree with ${tree.getField(Size)} elements`);

const disposer = autorun(() => tree.getField(Size));

// ---------------------------
// Pushing and popping a lot of times
console.log(`Yads: Inserting and removing in the middle ${ITERATIONS} times:`);
console.time('time');
for (let i = 0; i < ITERATIONS; ++i) {
  const ins = Math.floor(Math.random() * INITIAL_SIZE);
  const rem = Math.floor(Math.random() * INITIAL_SIZE);
  console.log('indices', ins, rem);
  printtree(tree);
  insert(tree, ins, [i]);
  printtree(tree);
  remove(tree, rem, 1);
  printtree(tree);
  console.log('--END ITER--');
}
console.timeEnd('time');

// ---------------------------
// Pushing and popping a lot of times
console.log(`Array: Inserting and removing in the middle ${ITERATIONS} times:`);
console.time('time');
for (let i = 0; i < ITERATIONS; ++i) {
  data.splice(Math.floor(Math.random() * INITIAL_SIZE), 0, i);
  data.splice(Math.floor(Math.random() * INITIAL_SIZE), 1);
}
console.timeEnd('time');

// const BULK_SIZE = 10000;
// const insertees: number[] = [];
// for (let i = 0; i < BULK_SIZE; ++i) {
//   insertees.push(i);
// }

// console.time('Creating a tree');
// const tree = fromArray(data);
// console.timeEnd('Creating a tree');

// const disposer = autorun(() => tree.getField(Size));

// // Insert bulk
// console.time(`Insert ${BULK_SIZE} items in bulk`);
// insert(tree, Math.floor(INITIAL_SIZE / 2), insertees);
// console.timeEnd(`Insert ${BULK_SIZE} items in bulk`);

// // Insert bulk array
// console.time(`Array: Insert ${BULK_SIZE} items in bulk`);
// for (let i = 0; i < BULK_SIZE; ++i) {
//   insertees.splice(INITIAL_SIZE / 2, 0, i);
// }
// console.timeEnd(`Array: Insert ${BULK_SIZE} items in bulk`);

// Insert
// console.time(`Insert ${BULK_SIZE} items`);
// for (let i = 0; i < BULK_SIZE; ++i) {
//   insert(tree, Math.floor(INITIAL_SIZE / 2), [1]);
// }
// console.timeEnd(`Insert ${BULK_SIZE} items`);

// Remove
// console.time(`Remove ${BULK_SIZE} items`);
// for (let i = 0; i < BULK_SIZE; ++i) {
//   remove(tree, Math.floor(INITIAL_SIZE / 2), 1);
// }
// console.timeEnd(`Remove ${BULK_SIZE} items`);

// let sum = 0;
// console.time(`Random Access ${BULK_SIZE} items, ${BULK_SIZE} times`);
// for (let i = 0; i < BULK_SIZE; ++i) {
//   const node = atIndex(tree, i);
//   sum += node.data;
// }
// console.timeEnd(`Random Access ${BULK_SIZE} items, ${BULK_SIZE} times`);

// // Remove bulk
// console.time(`Remove ${BULK_SIZE} items in bulk`);
// remove(tree, Math.floor(INITIAL_SIZE / 2), BULK_SIZE);
// console.timeEnd(`Remove ${BULK_SIZE} items in bulk`);

// // Remove bulk array
// console.time(`Array: Remove ${BULK_SIZE} items in bulk`);
// const removed = insertees.splice(INITIAL_SIZE / 2, BULK_SIZE);
// console.timeEnd(`Array: Remove ${BULK_SIZE} items in bulk`);

// // I Hate unused vars
// console.log('removed', removed.length);
// console.log('sum', sum);
// disposer();
