import { BaseNode, INode, Leaf, ChildIndex, MonoidObj } from './tree-structure';

/**
 * The cache object used to track the number of leaf nodes in the tree.
 */
export const Size: MonoidObj<number, any> = Object.freeze({
  identity: 0,
  operation: (a: number, b: number) => a + b,
  getCacheValue: () => 1,
});

export const fromArray = <T>(data: T[], start = 0, len = data.length): INode<T> => {
  if (len === 2) {
    return new INode(new Leaf(data[start]), new Leaf(data[start + 1]));
  }
  if (len === 3) {
    return new INode(new Leaf(data[start]), new Leaf(data[start + 1]), new Leaf(data[start + 2]));
  }
  if (len === 1) {
    return new INode(new Leaf(data[start]));
  }
  if (len === 0) {
    return new INode();
  }

  // Highest power of 2, lesser than len
  const half = Math.pow(2, Math.floor(Math.log2(len)));
  const quart = half / 2;
  const rest = len - half;

  if (rest >= quart) {
    return new INode(
      fromArray(data, start, quart),
      fromArray(data, start + quart, quart),
      fromArray(data, start + half, rest),
    );
  } else {
    return new INode(fromArray(data, start, quart), fromArray(data, start + quart, quart + rest));
  }
};

/**
 * Returns the leaf node at `index`.
 */
export function atIndex<T>(root: BaseNode<T>, index: number) {
  if (index < 0) {
    index = root.getField(Size) + index;
  }
  if (index > root.getField(Size) - 1 || index < 0) {
    throw new Error('Index out of bounds');
  }

  while (root instanceof INode) {
    if (root.a.getField(Size) <= index) {
      index -= root.a.getField(Size);
    } else {
      root = root.a;
      continue;
    }

    if (root.b.getField(Size) <= index) {
      index -= root.b.getField(Size);
    } else {
      root = root.b;
      continue;
    }

    root = root.c;
  }

  return root as Leaf<T>;
}

export function foldToIndex<T, U>(root: BaseNode<T>, index: number, monoid: MonoidObj<U, T>): U {
  if (index > root.getField(Size) || index < 0) {
    throw new Error('Index out of bounds');
  }

  return foldToFindValue(root, Size, sz => sz <= index, monoid);
}

export function foldToFindValue<NodeContent, ConditionValue, SumValue>(
  root: BaseNode<NodeContent>,
  criteriaMonoid: MonoidObj<ConditionValue, NodeContent>,
  takeWhile: (c: ConditionValue) => boolean, // example:
  sumMonoid: MonoidObj<SumValue, NodeContent>,
): SumValue {
  let sumValue = sumMonoid.identity;
  let criteriaValue = criteriaMonoid.identity;

  while (root instanceof INode) {
    let res = criteriaMonoid.operation(criteriaValue, root.a.getField(criteriaMonoid));
    if (takeWhile(res)) {
      criteriaValue = res;
      sumValue = sumMonoid.operation(sumValue, root.a.getField(sumMonoid));
    } else {
      root = root.a;
      continue;
    }

    let res2 = criteriaMonoid.operation(criteriaValue, root.b.getField(criteriaMonoid));
    if (takeWhile(res2)) {
      criteriaValue = res2;
      sumValue = sumMonoid.operation(sumValue, root.b.getField(sumMonoid));
    } else {
      root = root.b;
      continue;
    }

    root = root.c;
  }

  return sumValue;
}

export function findIndex<NodeContent, ConditionValue>(
  root: BaseNode<NodeContent>,
  criteriaMonoid: MonoidObj<ConditionValue, NodeContent>,
  takeWhile: (c: ConditionValue) => boolean, // example:
): number {
  return foldToFindValue(root, criteriaMonoid, takeWhile, Size);
}

/**
 * Removes `count` number of leaf nodes, starting from the `start` index
 * and leaves the tree in a balanced state.
 */
export function remove<T>(root: INode<T>, start: number, count: number) {
  if (start < 0) {
    start = root.getField(Size) + start;
  }

  if (start > root.getField(Size) - 1 || start < 0) {
    throw new Error('Index out of bounds');
  }

  // After each node removal, we rebalance and start over again
  // from the root. The `count` will be decremented, but the `start`
  // index will remain the same. We *can* remove entire subtrees.
  // however, due to how the balancing algo works, we can't remove
  // multiple siblings / cousins and rebalance afterwards.
  while (count) {
    let node: BaseNode<T> = root;
    let tmpStart = start;

    while (node instanceof INode) {
      if (tmpStart === 0) {
        // We have the oportunity to remove the entire node if count is bigger than it
        if (count >= node.getField(Size)) {
          if (node === root) {
            // Special case, if we remove the entire tree, empty the root.
            while (node.size) {
              node.pop();
              return;
            }
          } else {
            // Otherwise remove the entire node
            count -= node.getField(Size);
            const parent = node.parent;
            parent.pop(node.index);
            parent.rebalance();
            break;
          }
        }

        // When node's children are leaves start removing
        // them instead of doing the inner loop again.
        if (node.a instanceof Leaf) {
          while (count && node.size) {
            count -= 1;
            node.pop(0);
          }
          node.rebalance();
          break;
        }

        // Otherwise either enter the first child or
        // remove it and start over
        if (count <= node.a.getField(Size)) {
          node = node.a;
          continue;
        } else {
          count -= node.a.getField(Size);
          node.pop(0);
          node.rebalance();
          break;
        }
      } else {
        // When node's children are leaves start removing
        // them instead of doing the inner loop again.
        // Also, tmpStart can be only 1 or 2 here.
        if (node.a instanceof Leaf) {
          while (count && node.size > 1) {
            count -= 1;
            node.pop(tmpStart as 1 | 2);
          }
          node.rebalance();
          break;
        }

        // Otherwise go to the start position
        if (node.a.getField(Size) > tmpStart) {
          node = node.a;
          continue;
        } else {
          tmpStart -= node.a.getField(Size);
        }
        if (node.b.getField(Size) > tmpStart) {
          node = node.b;
          continue;
        } else {
          tmpStart -= node.b.getField(Size);
        }

        // Now `node.c` is necessarily present and its size is > tmpStart
        node = node.c;
        continue;
      }
    }
  }
}

/**
 * Inserts the `insertees` array of INodes at position `index`.
 * TODO: This function can be optimized to reduce the number of rebalances:
 *   1. When inserting check if the neighboring parent nodes have room
 *   2. Combine the insertees into a tree and insert entire subtrees at once
 *   3. Accept a ready-made tree instead of an array data (reuse the cache)
 */
export function insert<T>(root: INode<T>, index: number, insertees: T[]) {
  if (index < 0) {
    index = root.getField(Size) + index;
  }
  if (index > root.getField(Size) || index < 0) {
    throw new Error('Index out of bounds');
  }

  let node: Leaf<T>;
  let childIndex: ChildIndex;
  let parent: INode<T>;

  // Special case when inserting at the end of the tree (no node at that index).
  if (index === root.getField(Size)) {
    while (root.last instanceof INode) {
      root = root.last;
    }
    node = root.last as Leaf<T>;
    parent = root;
    childIndex = parent.size as ChildIndex;
  } else {
    node = atIndex(root, index);
    parent = node.parent;
    childIndex = node.index;
  }

  for (let i = insertees.length - 1; i >= 0; --i) {
    node = new Leaf(insertees[i]);
    parent.push(node, childIndex);
    parent.rebalance();
    parent = node.parent;
    childIndex = node.index;
  }
}

/**
 * Returns an iterator over each leaf node in a given range within the tree
 */
export function* iterate<T>(
  root: INode<T>,
  index: number = 0,
  count: number = root.getField(Size),
) {
  if (index < 0) {
    index = root.getField(Size) + index;
  }
  if (index > root.getField(Size) - 1 || index < 0) {
    throw new Error('Index out of bounds');
  }

  let node = atIndex(root, index);
  do {
    yield node;
    node = node.nextNodeAtSameLevel as Leaf<T>;
    if (!node) {
      break;
    }
    count -= 1;
  } while (count > 0);
}

export function* iterateData<T>(root: INode<T>, index?: number, count?: number) {
  for (let item of iterate(root, index, count)) {
    yield item.data;
  }
}
