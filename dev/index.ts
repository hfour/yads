import 'babel-polyfill';
import { autorun } from 'mobx';
import { fromArray, atIndex, insert, remove, Size, INode, Leaf } from '../src';
import { printtree, isBalanced } from '../tests/test.util';

// Handcrafting a specific tree
// const specTree = new INode(
//   new INode(
//     new INode(
//       new INode(new Leaf(0), new Leaf(1)),
//       new INode(new Leaf(2), new Leaf(2), new Leaf(4)),
//       new INode(new Leaf(1), new Leaf(6), new Leaf(7)),
//     ),
//     new INode(new INode(new Leaf(8), new Leaf(9)), new INode(new Leaf(10), new Leaf(11))),
//   ),
//   new INode(
//     new INode(
//       new INode(new Leaf(12), new Leaf(0), new Leaf(13)),
//       new INode(new Leaf(14), new Leaf(15)),
//     ),
//     new INode(new INode(new Leaf(16), new Leaf(17)), new INode(new Leaf(18), new Leaf(19))),
//   ),
// );

// printtree(specTree);
// remove(specTree, 8, 1);
// printtree(specTree);

const INITIAL_SIZE = 20000;
const ITERATIONS = 1000;

// ---------------------------
// Creating an array
const data: number[] = [];
for (let i = 0; i < INITIAL_SIZE; ++i) {
  data.push(i);
}

// // ---------------------------
// // Creating a tree
const CREATION = `Creating a tree with ${INITIAL_SIZE} elements took`;
console.time(CREATION);
const tree = fromArray(data);
console.timeEnd(CREATION);

const disposer = autorun(() => tree.getField(Size));

const INSERTION = `Inserting another ${INITIAL_SIZE} elements in that tree took`;
console.time(INSERTION);
insert(tree, INITIAL_SIZE / 2, data);
console.timeEnd(INSERTION);

const DELETION = `Removing ${INITIAL_SIZE} elements in that tree took`;
console.time(DELETION);
remove(tree, INITIAL_SIZE, INITIAL_SIZE);
console.timeEnd(DELETION);

// // ---------------------------
// // Pushing and popping a lot of times

[10, 5, 3, 1].forEach(num => {
  const insertees = Array(num).fill(3);

  console.log(
    `\nInserting and removing ${num} elements at a time in the tree of ${INITIAL_SIZE} elements, at random positions`,
  );

  const ITERS = `${ITERATIONS} iterations took`;
  console.time(ITERS);
  for (let i = 0; i < ITERATIONS; ++i) {
    const ins = Math.floor(Math.random() * INITIAL_SIZE);
    const rem = Math.floor(Math.random() * INITIAL_SIZE);
    // console.log('indices', ins, rem);
    // printtree(tree);
    insert(tree, ins, insertees);
    // printtree(tree);
    remove(tree, rem, insertees.length);
    // printtree(tree);
    // console.log('--END ITER--');
    // if (!isBalanced(tree)) {
    //   throw new Error('Tree is not balanced');
    // }
  }
  console.timeEnd(ITERS);
});

// // ---------------------------
// // Pushing and popping a lot of times
// console.log(`Array: Inserting and removing in the middle ${ITERATIONS} times:`);
// console.time('time');
// for (let i = 0; i < ITERATIONS; ++i) {
//   data.splice(Math.floor(Math.random() * INITIAL_SIZE), 0, i);
//   data.splice(Math.floor(Math.random() * INITIAL_SIZE), 1);
// }
// console.timeEnd('time');

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
