import { BaseNode, INode, Leaf, ChildIndex, MonoidObj } from './tree-structure';

/**
 * The cache object used to track the number of leaf nodes in the tree.
 */
export const Size: MonoidObj<number> = Object.freeze({
  identity: 0,
  operation: (a: number, b: number) => a + b,
  getCacheValue: () => 1,
});

/**
 * A not-so-efficient way to create a tree from arrays.
 * TODO: Optimize.
 */
function distribute<T>(nodes: BaseNode<T>[]): INode<T> {
  const len = nodes.length;

  if (len === 0) {
    return new INode();
  }

  if (len === 1) {
    if (nodes[0] instanceof INode) {
      return nodes[0] as INode<T>;
    } else {
      return new INode(nodes[0]);
    }
  }

  const result: INode<T>[] = [];

  for (let i = 0; i < len; i += 2) {
    if (i + 3 === len) {
      result.push(new INode(nodes[i], nodes[i + 1], nodes[i + 2]));
      break;
    } else if (i + 1 === len) {
      result.push(new INode(nodes[i]));
      break;
    } else {
      result.push(new INode(nodes[i], nodes[i + 1]));
    }
  }

  return distribute(result);
}

export function fromArray<T>(data: T[]) {
  return distribute(data.map(d => new Leaf(d)));
}

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

  while (count) {
    let node: BaseNode<T> = root;
    let tmpStart = start;

    while (node instanceof INode) {
      if (tmpStart === 0) {
        // We have the oportunity to remove the entire node
        if (count >= node.getField(Size)) {
          if (node === root) {
            while (node.size) {
              node.pop();
              return;
            }
          } else {
            count -= node.getField(Size);
            const parent = node.parent;
            parent.pop(node.index);
            parent.rebalance();
            break;
          }
        }

        if (node.a instanceof Leaf) {
          // Just remove leaves
          while (count && node.size) {
            count -= 1;
            node.pop(0);
          }
          node.rebalance();
          break;
        }

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
        if (node.a instanceof Leaf) {
          // Remove leaves.
          // Also, tmpStart can be only 1 or 2
          while (count && node.size > 1) {
            count -= 1;
            node.pop(tmpStart as 1 | 2);
          }
          node.rebalance();
          break;
        }

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
        // Now node.c, is necessarily present, and its size is > tmpStart
        node = node.c;
        continue;
      }
    }
  }

  //   if (start === 0) {
  //     // When start is `0`, we have the opportunity to remove
  //     // entire INodes at once, instead of going leaf by leaf
  //     const length = node.getField(Size);
  //     if (count >= length) {
  //       if (node === root) {
  //         // Special case when the entire tree is deleted, return an empty root.
  //         while (node.size) {
  //           node.pop();
  //           return;
  //         }
  //       }
  //       count -= length;
  //       node.parent.pop(node.index);
  //       node.parent.rebalance();
  //     }

  //   }

  //   if (node.a.getField(Size) <= start) {
  //     start -= node.a.getField(Size);
  //   } else {
  //     node = node.a;
  //     continue;
  //   }
  // }

  // while (root instanceof INode) {
  //   if (root.a.getField(Size) <= index) {
  //     index -= root.a.getField(Size);
  //   } else {
  //     root = root.a;
  //     continue;
  //   }

  //   if (root.b.getField(Size) <= index) {
  //     index -= root.b.getField(Size);
  //   } else {
  //     root = root.b;
  //     continue;
  //   }

  //   root = root.c;
  // }

  // if (node instanceof INode) {
  //   if (node.a.getField(Size) > start) {
  //     // Get into node
  //   }
  //   start -= node.a.getField(Size);
  //   if (node.b.getField(Size) > start) {
  //     // Get into node
  //   }
  //   start -= node.b.getField(Size);
  //   if (node.c.getField(Size) > start) {
  //     // Get into node
  //   }
  //   start -= node.c.getField(Size);
  // }

  // // Nodes marked for rebalancing
  // const marked: INode<T>[] = [];
  // let lastMarked: INode<T> = null;
  // node = atIndex(root, start);

  // // This loop fixes the usage of `atIndex`, which always gives a leaf.
  // // If that leaf happens to be the first child, and remove it and all
  // // of its siblings, the parent will be left empty instead of removed.
  // // Another fix (probably the right one) is to not use `atIndex`, but
  // // traverse down starting from the root node. Whatever.
  // if (node.index === 0) {
  //   while (node.getField(Size) < count && node.index === 0) {
  //     node = node.parent;
  //   }
  // }

  // while (count > 0) {
  //   if (count >= node.getField(Size)) {
  //     let parent = node.parent;
  //     const nix = node.index;

  //     // If the node's size is smaller than the number of items
  //     // to be removed, remove the entire node and move right.
  //     parent.pop(nix);
  //     count -= node.getField(Size);

  //     if (lastMarked !== parent) {
  //       marked.push(parent);
  //       lastMarked = parent;
  //     }

  //     // Move to next sibling, or go up if no next sibling
  //     node = parent.childAt(nix);
  //     while (!node) {
  //       if (!parent.parent) {
  //         break;
  //       }
  //       node = parent.nextSibling;
  //       parent = parent.parent;
  //     }
  //   } else {
  //     // If the node's size is bigger than the number of items
  //     // to be removed, traverse it.
  //     node = (node as INode<T>).first;
  //   }
  // }

  // marked.forEach(node => node.parent && node.rebalance());
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
  count: number = root.getField(Size) - 1,
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
