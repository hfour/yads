import { fromArray, atIndex, insert, remove, MonoidObj } from '../src';

describe('Internal computed cache structure', () => {
  const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const Sum: MonoidObj<number> = {
    identity: 0,
    operation: (a, b) => a + b,
    getCacheValue: () => 1,
  };

  it('Cache works', () => {
    const tree = fromArray(data);
    expect(tree.getField(Sum)).toBe(11);
  });

  it('Cache works with inserting nodes', () => {
    const tree = fromArray(data);
    insert(tree, 0, [1, 2]);
    expect(tree.getField(Sum)).toBe(13);
  });

  it('Cache works with removing nodes', () => {
    const tree = fromArray(data);
    remove(tree, 0, 2);
    expect(tree.getField(Sum)).toBe(9);
  });
});
