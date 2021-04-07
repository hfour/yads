import { computed, observable, action } from 'mobx';

export type MonoidObj<ValType, LeafType> = {
  operation: (a: ValType, b: ValType) => ValType;
  getCacheValue: (leaf: LeafType) => ValType;
  identity: ValType;
};

export class MonoidalCache<ValType, LeafType> {
  constructor(private node: BaseNode<LeafType>, private monoid: MonoidObj<ValType, LeafType>) {}

  @computed
  get value() {
    if (this.node instanceof Leaf) {
      return this.monoid.getCacheValue(this.node.data);
    } else if (this.node instanceof INode) {
      let result: ValType = this.monoid.identity;
      for (let i = 0; i < 4; ++i) {
        const n = this.node.childAt(i as ChildIndex);
        if (n) {
          result = this.monoid.operation(result, n.getField(this.monoid));
        } else {
          break;
        }
      }
      return result;
    }
  }
}

/**
 * The possible values of a node's index within it's parent node.
 * The value 3 is possible, but only temporarily before the parent is rebalanced.
 */
export type ChildIndex = 0 | 1 | 2 | 3;

/**
 * Base node class for the internal tree structure.
 */
export class BaseNode<T> {
  private monoidMap: WeakMap<MonoidObj<any, any>, MonoidalCache<any, any>> = new WeakMap();

  parent: INode<T> = null;

  /**
   * Node's index within its parent
   */
  @observable index: ChildIndex = null;

  /**
   * Lazily cache and get cached value.
   */
  getField<MonVal>(monoid: MonoidObj<MonVal, T>): MonVal {
    let s = this.monoidMap.get(monoid);
    if (!s) {
      s = new MonoidalCache(this, monoid);
      this.monoidMap.set(monoid, s);
    }
    return s.value;
  }

  /**
   * Returns this node's previous sibling, or `null` if first
   */
  get prevSibling(): BaseNode<T> {
    if (this.index > 0 && this.index < 3) {
      return this.parent.childAt((this.index - 1) as ChildIndex);
    }
    return null;
  }

  /**
   * Returns this node's next sibling, or `null` if last
   */
  get nextSibling(): BaseNode<T> {
    if (this.index > -1 && this.index < 2) {
      return this.parent.childAt((this.index + 1) as ChildIndex);
    }
    return null;
  }

  /**
   * Returns the first encountered node at the same level to the left
   */
  @computed
  get prevNodeAtSameLevel(): BaseNode<T> {
    if (!this.parent) {
      return null;
    }

    let target = this.prevSibling;
    if (target) {
      return target;
    }

    let counter = 0;
    target = this;
    while (true) {
      counter += 1;
      target = target.parent;
      if (!target.parent) {
        return null;
      }
      const sib = target.prevSibling as INode<T>;
      if (sib) {
        target = sib;
        while (counter > 0) {
          target = (target as INode<T>).last;
          counter -= 1;
        }
        return target;
      }
    }
  }

  /**
   * Returns the first encountered node at the same level to the right
   */
  get nextNodeAtSameLevel(): BaseNode<T> {
    if (!this.parent) {
      return null;
    }

    let target = this.nextSibling;
    if (target) {
      return target;
    }

    let counter = 0;
    target = this;
    while (true) {
      counter += 1;
      target = target.parent;
      if (!target.parent) {
        return null;
      }
      const sib = target.nextSibling as INode<T>;
      if (sib) {
        target = sib;
        while (counter > 0) {
          target = (target as INode<T>).first;
          counter -= 1;
        }
        return target;
      }
    }
  }
}

/**
 * Internal node class for the tree structure.
 */
export class INode<T> extends BaseNode<T> {
  @observable
  private _0: BaseNode<T>;

  @observable
  private _1: BaseNode<T>;

  @observable
  private _2: BaseNode<T>;

  @observable
  private _3: BaseNode<T>;

  set a(nu: BaseNode<T>) {
    this._0 = nu;
    if (nu) {
      nu.index = 0;
      nu.parent = this;
    }
  }

  get a() {
    return this._0;
  }

  set b(nu: BaseNode<T>) {
    this._1 = nu;
    if (nu) {
      nu.index = 1;
      nu.parent = this;
    }
  }

  get b() {
    return this._1;
  }

  set c(nu: BaseNode<T>) {
    this._2 = nu;
    if (nu) {
      nu.index = 2;
      nu.parent = this;
    }
  }

  get c() {
    return this._2;
  }

  set d(nu: BaseNode<T>) {
    this._3 = nu;
    if (nu) {
      nu.index = 3;
      nu.parent = this;
    }
  }

  get d() {
    return this._3;
  }

  get size() {
    return this.d ? 4 : this.c ? 3 : this.b ? 2 : this.a ? 1 : 0;
  }

  get first() {
    return this.a;
  }

  get last() {
    return this.d || this.c || this.b || this.a;
  }

  constructor(_0: BaseNode<T> = null, _1: BaseNode<T> = null, _2: BaseNode<T> = null) {
    super();
    this.a = _0;
    this.b = _1;
    this.c = _2;
    this.d = null;
  }

  childAt(index: ChildIndex) {
    switch (index) {
      case 0:
        return this.a;
      case 1:
        return this.b;
      case 2:
        return this.c;
      case 3:
        return this.d;
      default:
        throw new Error('Invalid child index');
    }
  }

  @action
  push(child: BaseNode<T>, pos: ChildIndex = this.size as ChildIndex) {
    if (this.size === 4) {
      throw new Error('Cannot add more than 4 children to a node');
    }

    if (pos - this.size > 0) {
      throw new Error('Cannot skip nodes when pushing');
    }

    switch (pos) {
      case 0: {
        this.d = this.c;
        this.c = this.b;
        this.b = this.a;
        this.a = child;
        break;
      }
      case 1: {
        this.d = this.c;
        this.c = this.b;
        this.b = child;
        break;
      }
      case 2: {
        this.d = this.c;
        this.c = child;
        break;
      }
      default: {
        this.d = child;
      }
    }
  }

  @action
  pop(pos: ChildIndex = (this.size - 1) as ChildIndex) {
    let popped: BaseNode<T> = null;
    if (pos >= this.size) {
      throw new Error('Cannot pop, node does not exist');
    }
    switch (pos) {
      case 0: {
        popped = this.a;
        this.a = this.b;
        this.b = this.c;
        this.c = this.d;
        this.d = null;
        break;
      }
      case 1: {
        popped = this.b;
        this.b = this.c;
        this.c = this.d;
        this.d = null;
        break;
      }
      case 2: {
        popped = this.c;
        this.c = this.d;
        this.d = null;
        break;
      }
      default: {
        popped = this.d;
        this.d = null;
      }
    }

    if (popped) {
      popped.index = null;
      popped.parent = null;
    }
    return popped;
  }

  /**
   * Rebalances an INode by doing the following:
   *  - If the INode has no children, it gets destroyed
   *  - If it has only one child it gets merged with its left or right sibling
   *    depending on which one has 2 children (right if both have 2)
   *
   * The function expects that **only** the node on which rebalance is called is
   * in an imbalanced state. It won't work if the tree has other nodes that are
   * not balanced (have 0, 1 or 4 children).
   */
  @action
  rebalance() {
    if (this.size === 0) {
      if (!this.parent) {
        return;
      }
      const parent = this.parent;
      parent.pop(this.index);
      parent.rebalance();
    } else if (this.size === 1) {
      if (!this.parent) {
        const only = this.a;
        if (only instanceof INode) {
          // Handle the case where rebalancing has left the root node
          // with only a single child. This won't happen for non-root inodes.
          this.pop();
          this.a = only.a;
          this.b = only.b;
          this.c = only.c;
          this.d = only.d;
          only.parent = null;
          only.index = null;
          this.rebalance();
        }
        return;
      }

      const moved = this.pop(0);
      const left = this.prevSibling as INode<T>;
      const right = this.nextSibling as INode<T>;

      let rebalanceSibling: INode<T> = null;
      if (!left || (right && right.size < left.size)) {
        right.push(moved, 0);
        if (right.size === 4) {
          rebalanceSibling = right;
        }
      } else {
        left.push(moved);
        if (left.size === 4) {
          rebalanceSibling = left;
        }
      }

      const parent = this.parent;
      parent.pop(this.index);
      if (rebalanceSibling) {
        rebalanceSibling.rebalance();
      }
      if (parent.size === 1) {
        parent.rebalance();
      }
    } else if (this.size === 4) {
      const second = this.pop();
      const first = this.pop();
      const newNode = new INode(first, second);

      // If this is the root node, replace it with a new root
      // that contains this node and the new node as children.
      if (!this.parent) {
        const second = this.pop();
        const first = this.pop();
        this.push(new INode(first, second));
        this.push(newNode);
      } else {
        this.parent.push(newNode, (this.index + 1) as ChildIndex);
        this.parent.rebalance();
      }
    }
  }
}

/**
 * Leaf node.
 */
export class Leaf<T> extends BaseNode<T> {
  data: T;

  constructor(data: T) {
    super();
    this.data = data;
  }
}
