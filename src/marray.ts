import * as ts from './tree-structure';
import * as tu from './tree-utils';
import { EventHandler, toInteger } from './marray-utils';

export class MArray<T> {
  [n: number]: T;
  private $data: ts.INode<T>;
  private onCreateHandler: EventHandler<T>;
  private onRemoveHandler: EventHandler<T>;

  static from<T>(items: Iterable<T>) {
    const arr = new MArray<T>();
    arr.$data = tu.fromArray([...items]);
    return arr;
  }

  constructor(...items: T[]) {
    this.$data = tu.fromArray(items);
    this.onCreateHandler = new EventHandler();
    this.onRemoveHandler = new EventHandler();

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

  track(onCreated: (t: T) => void, onRemoved: (t: T) => void) {
    this.onCreateHandler.addListener(onCreated);
    this.onRemoveHandler.addListener(onRemoved);
    return () => {
      this.onCreateHandler.removeListener(onCreated);
      this.onRemoveHandler.removeListener(onRemoved);
    };
  }

  /**
   * Insert items at given position
   * @param at the position
   * @param item the content
   */
  private insert(at: number, items: T[]) {
    tu.insert(this.$data, at, items);
    items.forEach(i => this.onCreateHandler.run(i));
  }

  /**
   * Removes the specified number of items from a given index
   * @param start the starting index
   * @param count number of items to be removed
   */
  private remove(start: number, count: number) {
    let removed;
    if (count > 0) removed = this.slice(start, start + count);
    tu.remove(this.$data, start, count);
    for (let i of removed) {
      this.onRemoveHandler.run(i);
    }
  }

  push(...items: T[]) {
    this.insert(this.length, items);
  }

  pop() {
    let lastIndex = this.$data.getField(tu.Size) - 1;
    if (lastIndex < 0) return undefined;
    let item = tu.atIndex(this.$data, lastIndex);
    this.remove(lastIndex, 1);
    return item.data;
  }

  shift() {
    let item = tu.atIndex(this.$data, 0);
    this.remove(0, 1);
    return item.data;
  }

  unshift(t: T) {
    this.insert(0, [t]);
  }

  /**
   * Like Array.slice - Returns a section of an array.
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array, exclusive of the element at the index 'end'.
   */
  slice(start?: number, end?: number) {
    const extractedElements = new MArray<T>();

    if (start > this.length) {
      return extractedElements;
    } else if (start < 0) {
      start = this.length + start;
    }
    start = start ?? 0;

    if (end < 0) {
      end = this.length + end;
    }
    end = !end || end > this.length ? this.length : end;

    if (end > start) {
      for (let node of tu.iterateData(this.$data, start, end - start)) {
        extractedElements.push(node);
      }
    }

    return extractedElements;
  }

  /**
   * Like Array.splice
   * @param at the position
   * @param deleteCount item count to delete
   * @param items items to insert
   */
  splice(at: number, deleteCount?: number, ...items: T[]) {
    let deletedElements = new MArray<T>();
    at = at < 0 ? this.length + at : at;

    if (at < this.length) {
      deleteCount = deleteCount ?? this.length - at;
      if (deleteCount > 0) {
        deletedElements = this.slice(at, at + deleteCount);
        this.remove(at, deleteCount);
      }
    }
    if (items.length > 0) {
      this.insert(at, items);
    }

    return deletedElements;
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
   * Like Array.every; returns true if all elements satisfy the predicate
   * @param predicate
   * @param thisArg?
   * @returns boolean
   */
  every(
    predicate: (value: T, index?: number, mArray?: MArray<T>) => unknown,
    thisArg?: any,
  ): boolean {
    let index = 0;

    for (let item of this) {
      if (!predicate.call(thisArg, item, index, this)) return false;

      index++;
    }

    return true;
  }

  /**
   * Like Array.some; returns true if at least one element satisfies the predicate
   * @param predicate
   * @param thisArg?
   * @returns boolean
   */
  some(
    predicate: (value: T, index?: number, mArray?: MArray<T>) => unknown,
    thisArg?: any,
  ): boolean {
    let index = 0;

    for (let item of this) {
      if (predicate.call(thisArg, item, index, this)) return true;

      index++;
    }

    return false;
  }

  /**
   * Get element at the given index
   * @param index the index to search for
   */
  at(index: number) {
    return tu.atIndex(this.$data, index).data;
  }

  update(index: number, val: T) {
    const oldVal = tu.atIndex(this.$data, index).data;
    tu.atIndex(this.$data, index).data = val;
    if (val !== oldVal) {
      this.onRemoveHandler.run(oldVal);
      this.onCreateHandler.run(val);
    }
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
