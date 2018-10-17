import { fromArray, atIndex, insert, remove, Size } from '../src';
import { autorun, Lambda } from 'mobx';
import { isBalanced, printtree } from './test.util';

describe('Performance experiments', () => {
  const data: number[] = [];
  const INITIAL_SIZE = 1000;
  for (let i = 0; i < INITIAL_SIZE; ++i) {
    data.push(i);
  }

  const BULK_SIZE = 10000;
  const insertees: number[] = [];
  for (let i = 0; i < BULK_SIZE; ++i) {
    insertees.push(i);
  }

  const tree = fromArray(data);
  let disposer: Lambda;

  beforeAll(() => {
    // Make mobx cache stuff
    disposer = autorun(() => tree.getField(Size));
  });

  it.skip('debug', () => {
    // `remove` had some very peculiar fails for specific tree sizes
    for (let i = 0; i < 13; ++i) {
      for (let j = 0; j < 53; ++j) {
        const data: number[] = [];
        const INITIAL_SIZE = 2 + i;
        for (let i = 0; i < INITIAL_SIZE; ++i) {
          data.push(i);
        }

        const BULK_SIZE = 2 + j;
        const insertees: number[] = [];
        for (let i = 0; i < BULK_SIZE; ++i) {
          insertees.push(i);
        }

        const tree = fromArray(data);
        insert(tree, Math.floor(INITIAL_SIZE / 2), insertees);
        remove(tree, Math.floor(INITIAL_SIZE / 2), BULK_SIZE);
        if (!isBalanced(tree)) {
          console.log('SIZE:', INITIAL_SIZE, BULK_SIZE);
          throw new Error('STOP')!;
        }
      }
    }
  });

  it('Reading cache', () => {
    console.time('Read Size');
    expect(tree.getField(Size)).toBe(INITIAL_SIZE);
    console.timeEnd('Read Size');
    console.time('Read Size Again');
    expect(tree.getField(Size)).toBe(INITIAL_SIZE);
    console.timeEnd('Read Size Again');
  });

  it('Inserting items', () => {
    console.time(`Insert ${BULK_SIZE} items`);
    for (let i = 0; i < BULK_SIZE; ++i) {
      insert(tree, Math.floor(INITIAL_SIZE / 2), [1]);
    }
    console.timeEnd(`Insert ${BULK_SIZE} items`);
    expect(isBalanced(tree)).toBeTruthy();
  });

  it('Random access', () => {
    let sum: number = 0;
    console.time(`Random Access ${BULK_SIZE} items, ${BULK_SIZE} times`);
    for (let i = 0; i < BULK_SIZE; ++i) {
      const node = atIndex(tree, i);
      sum += node.data;
    }
    console.timeEnd(`Random Access ${BULK_SIZE} items, ${BULK_SIZE} times`);
    expect(sum).toBeTruthy();
  });

  it('Removing items', () => {
    console.time(`Remove ${BULK_SIZE} items`);
    for (let i = 0; i < BULK_SIZE; ++i) {
      remove(tree, Math.floor(INITIAL_SIZE / 2), 1);
    }
    console.timeEnd(`Remove ${BULK_SIZE} items`);
    expect(tree.getField(Size)).toBe(INITIAL_SIZE);
    expect(isBalanced(tree)).toBeTruthy();
  });

  it('Inserting bulk items', () => {
    console.time(`Insert ${BULK_SIZE} items in bulk`);
    insert(tree, Math.floor(INITIAL_SIZE / 2), insertees);
    console.timeEnd(`Insert ${BULK_SIZE} items in bulk`);
    expect(isBalanced(tree)).toBeTruthy();
  });

  it('Removing bulk items', () => {
    console.time(`Remove ${BULK_SIZE} items in bulk`);
    remove(tree, Math.floor(INITIAL_SIZE / 2), BULK_SIZE);
    console.timeEnd(`Remove ${BULK_SIZE} items in bulk`);
    expect(tree.getField(Size)).toBe(INITIAL_SIZE);
    expect(isBalanced(tree)).toBeTruthy();
  });

  afterAll(() => {
    disposer();
  });
});
