import drawTree from 'asciitree';
import { BaseNode, INode, Leaf } from '../src';

/**
 * Converts a tree to an array consumable by `asciitree`.
 */
function toDebugArray(root: BaseNode<any>, pos?: string): any[];
function toDebugArray(root: Leaf<any>, pos?: string): string;
function toDebugArray(root: INode<any>, pos?: string): any[];
function toDebugArray(root: BaseNode<any>, pos: string = 'R') {
  if (root instanceof INode) {
    const arr: any[] = [pos];
    if (root.a) {
      arr.push(toDebugArray(root.a, 'a'));
    }
    if (root.b) {
      arr.push(toDebugArray(root.b, 'b'));
    }
    if (root.c) {
      arr.push(toDebugArray(root.c, 'c'));
    }
    if (root.d) {
      arr.push(toDebugArray(root.d, 'd'));
    }
    return arr;
  } else if (root instanceof Leaf) {
    return root.data;
  } else {
    return '[No Tree]';
  }
}

/**
 * Uses the "asciitree" library to print a tree to a string.
 */
export function printtree<T>(root: INode<T>) {
  console.log(drawTree(toDebugArray(root)));
}

/**
 * Returns `0` if the tree is not balanced, otherwise a positive integer
 * which denotes the tree's depth. A tree is balanced if all of its leaves
 * are at the same depth and all nodes have either 2 or 3 children.
 */
export function isBalanced<T>(root: INode<T> | Leaf<T>, depth: number = 0): number {
  if (root instanceof Leaf) {
    return depth;
  }

  if (depth === 0 && (root.size === 0 || root.size === 1)) {
    return 1;
  }

  if (root.size !== 2 && root.size !== 3) {
    return 0;
  }

  const a = isBalanced(root.a as INode<T> | Leaf<T>, depth + 1);
  const b = isBalanced(root.b as INode<T> | Leaf<T>, depth + 1);

  if (a !== b) {
    return 0;
  }
  if (root.c && a !== isBalanced(root.c as INode<T> | Leaf<T>, depth + 1)) {
    return 0;
  }

  return a;
}
