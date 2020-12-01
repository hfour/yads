import * as ts from './tree-structure';
import * as tu from './tree-utils';

let isNumber = (thing: number | string): thing is number => {
  return !isNaN(Number.parseInt(thing.toString()));
};

export class MArray<T> {
  [n: number]: T;
  private $data: ts.INode<T>;

  static from<T>(items: Iterable<T>) {
    const arr = new MArray<T>();
    arr.$data = tu.fromArray([...items]);
    return arr;
  }

  constructor(...items: T[]) {
    this.$data = tu.fromArray(items);

    return new Proxy(this, {
      get: (target, prop: string, receiver) => {
        if (isNumber(prop)) {
          return this.at(prop);
        } else return Reflect.get(target, prop, receiver);
      },
      set: (target, prop: string, value, receiver): boolean => {
        if (isNumber(prop)) {
          this.update(prop, value);
          return true;
        } else return Reflect.set(target, prop, value, receiver);
      },
    });
  }

  push(...items: T[]) {
    tu.insert(this.$data, this.length, items);
  }

  pop() {
    let lastIndex = this.$data.getField(tu.Size) - 1;
    let item = tu.atIndex(this.$data, lastIndex);
    tu.remove(this.$data, lastIndex, 1);
    return item.data;
  }

  shift() {
    let item = tu.atIndex(this.$data, 0);
    tu.remove(this.$data, 0, 1);
    return item.data;
  }

  unshift(t: T) {
    tu.insert(this.$data, 0, [t]);
  }

  /**
   * Like Array.splice
   * @param at the position
   * @param deleteCount item count to delete
   * @param items items to insert
   */
  splice(at: number, deleteCount: number, ...items: T[]) {
    tu.remove(this.$data, at, deleteCount);
    if (items.length > 0) {
      tu.insert(this.$data, at, items);
    }
  }

  /**
   * Insert item at given position
   * @param at the position
   * @param item the content
   */
  insert(at: number, item: T) {
    tu.insert(this.$data, at, [item]);
  }

  /**
   * Get element at the given index
   * @param index the index to search for
   */
  at(index: number) {
    return tu.atIndex(this.$data, index).data;
  }

  update(index: number, val: T) {
    tu.atIndex(this.$data, index).data = val;
  }

  foldTo<Val>(index: number, monoid: ts.MonoidObj<Val, T>) {
    return tu.foldToIndex(this.$data, index + 1, monoid);
  }

  reduceTo<Val>(index: number, monoid: ts.MonoidObj<Val, T>) {
    return tu.foldToIndex(this.$data, index + 1, monoid);
  }

  reduceAll<Val>(monoid: ts.MonoidObj<Val, T>) {
    return this.$data.getField(monoid);
  }

  get length() {
    return this.$data.getField(tu.Size);
  }

  [Symbol.iterator]() {
    return tu.iterateData(this.$data);
  }

  toArray() {
    let res = [];
    for (let item of this) res.push(item);
    return res;
  }
}
