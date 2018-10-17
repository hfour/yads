import { fromArray, INode, Leaf, atIndex, Size, remove, insert, iterate } from '../src';
import { printtree, isBalanced } from './test.util';

describe('Internal tree structure', () => {
  const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  /**
   * Unskip this if you wanna explore how a tree gets balanced.
   */
  it.skip('Print the rebalancing progression', () => {
    const tree = fromArray([1]);
    for (let i = 0; i < 16; ++i) {
      insert(tree, 0, [i]);
      printtree(tree);
    }
    expect(1).toBe(1);
  });

  it('Creates a tree', () => {
    const data: number[] = [0];
    for (let i = 1; i < 11; ++i) {
      const tree = fromArray(data);
      expect(isBalanced(tree)).toBeTruthy();
      expect(tree.getField(Size)).toEqual(i);
      data.push(i);
    }
  });

  it('Pushes to a tree', () => {
    const tree = fromArray([0]);
    for (let i = 1; i < 10; ++i) {
      let last = tree.last;
      while (last instanceof INode) {
        last = last.last;
      }

      expect(isBalanced(tree)).toBeTruthy();
      expect(tree.getField(Size)).toEqual(i);
      last.parent.push(new Leaf(i));
      last.parent.rebalance();
    }
  });

  it('Correctly accesses nodes by index', () => {
    const tree = fromArray(data);
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 3).data).toBe(3);
    expect(atIndex(tree, 7).data).toBe(7);
    expect(atIndex(tree, 10).data).toBe(10);
    expect(atIndex(tree, 14).data).toBe(14);
    expect(atIndex(tree, -15).data).toBe(0);
    expect(atIndex(tree, -12).data).toBe(3);
    expect(atIndex(tree, -8).data).toBe(7);
    expect(atIndex(tree, -5).data).toBe(10);
    expect(atIndex(tree, -1).data).toBe(14);
  });

  it('Can insert nodes in the middle', () => {
    const tree = fromArray(data);
    const node = atIndex(tree, 3);
    node.parent.push(new Leaf(66), 2);
    node.parent.rebalance();
    node.parent.push(new Leaf(66), 2);
    node.parent.rebalance();
    expect(isBalanced(tree)).toBeTruthy();

    node.parent.push(new Leaf(66), 2);
    node.parent.rebalance();
    expect(isBalanced(tree)).toBeTruthy();
  });

  it('Correctly removes a single node at start', () => {
    const tree = fromArray(data);
    remove(tree, 0, 1);
    expect(tree.getField(Size)).toBe(14);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(1);
    expect(atIndex(tree, 13).data).toBe(14);
  });

  it('Correctly removes a single node at end', () => {
    const tree = fromArray(data);
    remove(tree, 14, 1);
    expect(tree.getField(Size)).toBe(14);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 13).data).toBe(13);
  });

  it('Correctly removes a single node at middle', () => {
    const tree = fromArray(data);
    remove(tree, 7, 1);
    expect(tree.getField(Size)).toBe(14);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 7).data).toBe(8);
    expect(atIndex(tree, 13).data).toBe(14);
  });

  it('Correctly removes a single node at middle #2', () => {
    const tree = fromArray(data);
    remove(tree, 4, 1);
    expect(tree.getField(Size)).toBe(14);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 4).data).toBe(5);
    expect(atIndex(tree, 13).data).toBe(14);
  });

  it('Correctly removes multiple nodes at start', () => {
    const tree = fromArray(data);
    remove(tree, 0, 6);
    expect(tree.getField(Size)).toBe(9);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(6);
    expect(atIndex(tree, 8).data).toBe(14);
  });

  it('Correctly removes multiple nodes at end', () => {
    const tree = fromArray(data);
    remove(tree, 9, 6);
    expect(tree.getField(Size)).toBe(9);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 8).data).toBe(8);
  });

  it('Correctly removes multiple nodes in the middle', () => {
    const tree = fromArray(data);
    remove(tree, 4, 6);
    expect(tree.getField(Size)).toBe(9);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 4).data).toBe(10);
    expect(atIndex(tree, 8).data).toBe(14);
  });

  it('Correctly removes multiple nodes in the middle #2', () => {
    const tree = fromArray(data);
    remove(tree, 2, 12);
    expect(tree.getField(Size)).toBe(3);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 1).data).toBe(1);
    expect(atIndex(tree, 2).data).toBe(14);
  });

  it('Correctly inserts a single node at the start', () => {
    const tree = fromArray(data);
    insert(tree, 0, [-1]);
    expect(tree.getField(Size)).toBe(16);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(-1);
    expect(atIndex(tree, 1).data).toBe(0);
    expect(atIndex(tree, 15).data).toBe(14);
  });

  it('Correctly inserts a single node at the middle', () => {
    const tree = fromArray(data);
    insert(tree, 5, [66]);
    expect(tree.getField(Size)).toBe(16);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 5).data).toBe(66);
    expect(atIndex(tree, 6).data).toBe(5);
    expect(atIndex(tree, 15).data).toBe(14);
  });

  it('Correctly inserts a single node at the end', () => {
    const tree = fromArray(data);
    insert(tree, 15, [15]);
    expect(tree.getField(Size)).toBe(16);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 6).data).toBe(6);
    expect(atIndex(tree, 15).data).toBe(15);
  });

  it('Correctly inserts multiple nodes at the start', () => {
    const tree = fromArray(data);
    insert(tree, 0, [-5, -4, -3, -2, -1]);
    expect(tree.getField(Size)).toBe(20);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(-5);
    expect(atIndex(tree, 1).data).toBe(-4);
    expect(atIndex(tree, 2).data).toBe(-3);
    expect(atIndex(tree, 3).data).toBe(-2);
    expect(atIndex(tree, 4).data).toBe(-1);
    expect(atIndex(tree, 5).data).toBe(0);
    expect(atIndex(tree, 19).data).toBe(14);
    expect(atIndex(tree, 15).data).toBe(10);
  });

  it('Correctly inserts multiple nodes at the end', () => {
    const tree = fromArray(data);
    insert(tree, 15, [15, 16, 17, 18, 19]);
    expect(tree.getField(Size)).toBe(20);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 7).data).toBe(7);
    expect(atIndex(tree, 15).data).toBe(15);
    expect(atIndex(tree, 16).data).toBe(16);
    expect(atIndex(tree, 17).data).toBe(17);
    expect(atIndex(tree, 18).data).toBe(18);
    expect(atIndex(tree, 19).data).toBe(19);
  });

  it('Correctly inserts multiple nodes at the middle', () => {
    const tree = fromArray(data);
    insert(tree, 8, [71, 72, 73, 74, 75]);
    expect(tree.getField(Size)).toBe(20);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 7).data).toBe(7);
    expect(atIndex(tree, 8).data).toBe(71);
    expect(atIndex(tree, 9).data).toBe(72);
    expect(atIndex(tree, 10).data).toBe(73);
    expect(atIndex(tree, 11).data).toBe(74);
    expect(atIndex(tree, 12).data).toBe(75);
    expect(atIndex(tree, 19).data).toBe(14);
  });

  it('Correctly iterates over nodes', () => {
    const tree = fromArray(data);
    const result: number[] = [];

    for (let node of iterate(tree, 0, 5)) {
      result.push(node.data);
    }
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });

  it('Correctly iterates over nodes #2', () => {
    const tree = fromArray(data);
    const result: number[] = [];

    for (let node of iterate(tree, 11, 10)) {
      result.push(node.data);
    }
    expect(result).toEqual([11, 12, 13, 14]);
  });

  it('Correctly iterates over nodes #3', () => {
    const tree = fromArray(data);
    const result: number[] = [];

    for (let node of iterate(tree, 5, 8)) {
      result.push(node.data);
    }
    expect(result).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);
  });
});
