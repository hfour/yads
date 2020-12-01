import { INode, Leaf } from '../src';

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
