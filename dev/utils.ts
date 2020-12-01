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
