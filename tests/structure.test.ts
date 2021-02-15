import {
  fromArray,
  INode,
  Leaf,
  atIndex,
  Size,
  remove,
  insert,
  iterate,
  iterateData,
  ChildIndex,
  findIndex,
} from '../src';
import { isBalanced } from './test.util';

describe('Internal tree structure', () => {
  const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  /**
   * Unskip this if you wanna explore how a tree gets balanced.
   */
  it.skip('Print the rebalancing progression', () => {
    const tree = fromArray([1]);
    for (let i = 0; i < 16; ++i) {
      insert(tree, 0, [i]);
    }
    expect(1).toBe(1);
  });

  it('Creates a tree', () => {
    const data: number[] = [];
    for (let i = 0; i < 11; ++i) {
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

  it('Rebalances an empty tree', () => {
    const tree = fromArray([]);
    tree.rebalance();

    expect(isBalanced(tree)).toBeTruthy();
  });

  it('Rebalances a tree after removing the last leaf of a child', () => {
    const tree = fromArray([1, 2, 3, 4]);

    const parent = tree.childAt(1) as INode<number>;
    parent.pop();
    parent.pop();

    parent.rebalance();
    expect(isBalanced(tree)).toBeTruthy();
    expect(tree.childAt(1)).toBeInstanceOf(Leaf);
  });

  it('Correctly returns previous nodes at same level', () => {
    const tree = fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    let prevNode = atIndex(tree, 8).prevNodeAtSameLevel as Leaf<number>;
    expect(prevNode.data).toEqual(8);

    prevNode = atIndex(tree, 1).prevNodeAtSameLevel as Leaf<number>;
    expect(prevNode.data).toEqual(1);

    prevNode = prevNode.prevNodeAtSameLevel as Leaf<number>;
    expect(prevNode).toBeNull();

    const topLevelPrevNode = tree.prevNodeAtSameLevel;
    expect(topLevelPrevNode).toBeNull();
  });

  it('Correctly returns next nodes at same level', () => {
    const tree = fromArray([1, 2, 3, 4, 5]);

    let nextNode = atIndex(tree, 3).nextNodeAtSameLevel as Leaf<number>;
    expect(nextNode.data).toEqual(5);

    nextNode = nextNode.nextNodeAtSameLevel as Leaf<number>;
    expect(nextNode).toBeNull();

    const topLevelNextNode = tree.nextNodeAtSameLevel;
    expect(topLevelNextNode).toBeNull();
  });

  it('Correctly accesses child nodes by child index', () => {
    const tree = fromArray(data);

    const leaf = atIndex(tree, 2);
    const node = leaf.parent;
    const child1 = node.childAt(0) as Leaf<number>;
    const child2 = node.childAt(1) as Leaf<number>;

    expect(child1.data).toEqual(2);
    expect(child2.data).toEqual(3);
    expect(() => node.childAt(4 as ChildIndex)).toThrowError();
  });

  it('Correctly accesses nodes by index', () => {
    const tree = fromArray(data);
    expect(atIndex(tree, 0).data).toBe(0);
    expect(atIndex(tree, 3).data).toBe(3);
    expect(atIndex(tree, 7).data).toBe(7);
    expect(atIndex(tree, 10).data).toBe(10);
    expect(atIndex(tree, 14).data).toBe(14);
    expect(() => atIndex(tree, -1).data).toThrowError();
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

  it('Throws when trying to push a child node at unexpected positions', () => {
    const tree = fromArray([0, 1, 2, 3]);
    const node = atIndex(tree, 2);

    expect(() => node.parent.push(new Leaf(100), 3)).toThrowError(
      new Error('Cannot skip nodes when pushing'),
    );

    node.parent.push(new Leaf(101), 1);
    node.parent.push(new Leaf(102), 1);
    expect(() => node.parent.push(new Leaf(103), 1)).toThrowError(
      new Error('Cannot add more than 4 children to a node'),
    );
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

  it('Correctly removes a single node at a negative index', () => {
    const tree = fromArray([1, 2, 3, 4]);
    remove(tree, -3, 1);
    expect(isBalanced(tree)).toBeTruthy();
    expect(tree.getField(Size)).toEqual(3);
    expect(atIndex(tree, 1).data).toEqual(3);
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

  it('Correctly removes all nodes', () => {
    const tree = fromArray(data);
    remove(tree, 0, data.length);
    expect(isBalanced(tree)).toBeTruthy();
    expect(tree.getField(Size)).toEqual(0);
  });

  it('Throws when trying to insert or remove at an out of bounds index', () => {
    const tree = fromArray(data);
    expect(() => remove(tree, 100, 1)).toThrowError('Index out of bounds');
    expect(() => insert(tree, 100, [18])).toThrowError('Index out of bounds');
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

  it('Correctly inserts at a negative index', () => {
    const tree = fromArray(data);
    insert(tree, -1, [100]);
    expect(isBalanced(tree)).toBeTruthy();
    expect(atIndex(tree, data.length - 1).data).toBe(100);
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

  it('Correctly iterates over the specified number of nodes', () => {
    const tree = fromArray(data);
    const result: number[] = [];
    const count = 5;

    for (let node of iterate(tree, 0, count)) {
      result.push(node.data);
    }
    expect(result.length).toEqual(count);
  });

  it('Correctly iterates over nodes starting from the specified index', () => {
    const tree = fromArray(data);
    const result: number[] = [];
    const index = 2;

    for (let node of iterate(tree, 2)) {
      result.push(node.data);
    }
    expect(result[0]).toEqual(atIndex(tree, index).data);
  });

  it('Correctly iterates over an empty tree', () => {
    const tree = fromArray([]);
    const result: any[] = [];

    for (let node of iterate(tree, data.length)) {
      result.push(node);
    }
    expect(result.length).toBe(0);
  });

  it('Correctly iterates from index < 0', () => {
    const tree = fromArray(data);
    const result = [];

    for (let node of iterate(tree, -2)) result.push(node.data);
    expect(result.length).toEqual(2);
    expect(result).toEqual([data[data.length - 2], data[data.length - 1]]);
  });

  it('Throws when trying to iterate over an out of bounds index', () => {
    const tree = fromArray(data);
    const iterator = iterate(tree, 100);

    expect(() => iterator.next()).toThrowError('Index out of bounds');
  });

  it('Correctly iterates data over all nodes', () => {
    const tree = fromArray(data);
    const result: number[] = [];

    for (let node of iterateData(tree)) {
      result.push(node);
    }
    expect(result).toEqual(data);
  });

  it('Ensures iteration through node data behaves similarly to regular arrays', () => {
    const tree = fromArray(data);
    const result_iterate_data: number[] = [];
    const result_for_loop: number[] = [];

    for (let node of iterateData(tree)) {
      result_iterate_data.push(node);
    }
    for (let i of data) {
      result_for_loop.push(i);
    }
    expect(result_iterate_data).toEqual(result_for_loop);
  });

  it('should find index based on a given condition', () => {
    const tree = fromArray([1, 2, 3, 4, 5]);

    const Total = {
      operation: (a: number, b: number) => a + b,
      identity: 0,
      getCacheValue: (a: number) => a,
    };

    expect(findIndex(tree, Total, c => c <= 6)).toEqual(3);
    expect(findIndex(tree, Total, c => c <= 10)).toEqual(4);
    expect(findIndex(tree, Total, c => c === 100)).toEqual(0);
  });
});
