import * as ts from './tree-structure';
import * as tu from './tree-utils';

function toInteger(s: any): number | null {
  if (s === '' || typeof s === 'symbol') return null;
  let n = Number(s);
  if (Number.isInteger(n)) return n;
  return null;
}

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
      get: (target, prop, receiver) => {
        let maybeInteger = toInteger(prop);
        if (maybeInteger === null) {
          return Reflect.get(target, prop, receiver);
        } else return this.at(maybeInteger);
      },
      set: (target, prop, value, receiver): boolean => {
        let maybeInteger = toInteger(prop);
        if (maybeInteger === null) {
          return Reflect.set(target, prop, value, receiver);
        } else {
          this.update(maybeInteger, value);
          return true;
        }
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
   * Combines two or more arrays.
   * @param items Additional items to add to the end of array.
   */
  concat(...items: (T | ConcatArray<T> | MArray<T>)[]): MArray<T> {
    const resultArray = this.toArray();

    for (const item of items) {
      if (Array.isArray(item)) {
        resultArray.push(...item);
      } else if (item instanceof MArray) {
        resultArray.push(...item);
      } else {
        resultArray.push(item as T);
      }
    }

    return MArray.from(resultArray);
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

  reduce<Val>(
    operation: (acc: Val, currVal: T, currIndex?: number, arr?: this) => Val,
    accumulator: Val,
  ): Val {
    let index = 0;

    for (let item of this) {
      accumulator = operation(accumulator, item, index, this);
      index++;
    }

    return accumulator;
  }

  map(operation: (item: T, index?: number, arr?: this) => any, thisArg?: any): MArray<any> {
    let index = 0;
    let result = new MArray();

    for (let item of this) {
      let newItem = operation.call(thisArg, item, index, this);
      result.push(newItem);
      index++;
    }

    return result;
  }

  filter(predicate: (item: T, index?: number, arr?: this) => boolean, thisArg?: any): MArray<T> {
    let index = 0;
    let result = new MArray<T>();

    for (let item of this) {
      if (predicate.call(thisArg, item, index, this)) result.push(item);
      index++;
    }

    return result;
  }

  find(
    predicate: (item: T, index?: number, mArray?: MArray<T>) => boolean,
    thisArg?: any,
  ): T | undefined {
    let index = 0;

    for (let item of this) {
      let found = predicate.call(thisArg, item, index, this);
      if (found) return item;
      index++;
    }
    return undefined;
  }

  indexOf(itemToFind: T, fromIndex?: number): number {
    if (fromIndex === undefined) {
      fromIndex = 0;
    } else if (fromIndex < 0 && fromIndex >= -this.length) {
      fromIndex = this.length + fromIndex;
    } else if (fromIndex < -this.length || fromIndex >= this.length) {
      return -1;
    }

    for (let index = fromIndex; index < this.length; index++) {
      let item = this[index];
      let found = item === itemToFind;
      if (found) return index;
    }
    return -1;
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
