import { MArray } from './marray';

const Total = {
  operation: (a: number, b: number) => a + b,
  identity: 0,
  getCacheValue: (a: number) => a,
};

describe('array', () => {
  it('has basic functionality', () => {
    let a = new MArray(1, 2, 3);
    expect(a[1]).toEqual(2);
    expect(a[1.1]).toEqual(undefined);
    expect(() => a[-1]).toThrow();
    expect(() => a[3]).toThrow();
    a.push(5);
    let r = a.pop();
    expect(r).toEqual(5);
    let t = a.shift();
    expect(t).toEqual(1);
    expect(a.at(0)).toEqual(2);
    expect(a.at(a.length - 1)).toEqual(3);
    expect(a.length).toEqual(2);
    a.unshift(10);
    a.unshift(5);
    a.push(11);
    expect(a.toArray()).toEqual([5, 10, 2, 3, 11]);
    a[2] = 4;
    expect(a.reduceTo(2, Total)).toEqual(19);
    expect(() => a.reduceTo(100, Total)).toThrowError('Index out of bounds');
  });

  describe('MArray.concat test suite', () => {
    it('should not mutate original array when concating', () => {
      const a = new MArray(1, 2, 3);

      a.concat(4);

      expect(a.toArray()).toEqual([1, 2, 3]);
    });

    it('should return same array when concat with no arguments ', () => {
      const a = new MArray(1, 2, 3);

      const result = a.concat();

      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should concat with arguments of multiple types', () => {
      const a = new MArray(1, 2, 3);

      const result = a.concat(4, [5, 6], new MArray(7, 8));

      expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('Finding stuff in MArray', () => {
    it('Finds a thing, [ .find(f) ]', () => {
      let a = new MArray('xy', 'yz', 'zx', 'rgb', 'gb', 'ba');

      let res = a.find(x => x.length > 2);
      let noRes = a.find(x => x == undefined);

      expect(res).toEqual('rgb');
      expect(noRes).toBeUndefined();
    });

    it('Finds a thing with "this", [ .find(f, t) ]', () => {
      let a = new MArray('xy', 'yz', 'zx', 'rgb', 'gb', 'ba');

      function finder(this: any, x: any): boolean {
        return this.toFind === x;
      }

      let res = a.find(finder, { toFind: 'rgb' });
      let noRes = a.find(finder, { toFind: 'ghost' });

      expect(res).toEqual('rgb');
      expect(noRes).toBeUndefined();
    });

    it('Finds index of a thing, [ .indexOf(x[, i]) ]', () => {
      let a = new MArray('xy', 'yz', 'zx', 'rgb', 'gb', 'ba');

      let res = a.indexOf('rgb');
      let resNot = a.indexOf('ghost');
      let resFromIndex = a.indexOf('rgb', 4);
      let resExactlyAt = a.indexOf('zx', 2);
      let resFromNegativeIndex = a.indexOf('rgb', -4);
      let resUpperBound = a.indexOf('ba', 5);
      let resOverUpperBound = a.indexOf('ba', 6);
      let resLowerBound = a.indexOf('xy', -6);
      let resOverLowerBound = a.indexOf('ba', -7);

      expect(res).toEqual(3);
      expect(resNot).toEqual(-1);
      expect(resFromIndex).toEqual(-1);
      expect(resExactlyAt).toEqual(2);
      expect(resFromNegativeIndex).toEqual(3);
      expect(resUpperBound).toEqual(5);
      expect(resOverUpperBound).toEqual(-1);
      expect(resLowerBound).toEqual(0);
      expect(resOverLowerBound).toEqual(-1);
    });

    it('every() returns true if all elements satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'bx');

      let res = a.every(x => x.includes('x'));

      expect(res).toBe(true);
    });

    it('every() returns false if at least one element does not satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'b');

      let res = a.every(x => x.includes('x'));

      expect(res).toBe(false);
    });

    it('every() returns false if all the elements do not satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'b');

      let res = a.every(x => x.includes('l'));

      expect(res).toBe(false);
    });

    it('some() returns true if at least one element satisfies a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'bx');

      let res = a.some(x => x.includes('y'));

      expect(res).toBe(true);
    });

    it('some() returns true if all the elements satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'bx');

      let res = a.some(x => x.includes('x'));

      expect(res).toBe(true);
    });

    it('some() returns false if none of the elements satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'bx');

      let res = a.some(x => x.includes('l'));

      expect(res).toBe(false);
    });
  });

  describe('MArray - mapping, filtering and reducing', () => {
    it('Should reduce (+) numbered array', () => {
      let arr = new MArray(0, 1, 2, 3, 4);

      let result = arr.reduce((acc, itm) => acc + itm, 0);

      expect(result).toEqual(10);
    });

    it('Should map numbers to strings', () => {
      let arr = new MArray(0, 1, 2, 3, 4);
      let res = new MArray('0', '1', '2', '3', '4');

      let result = arr.map(itm => itm.toString());

      expect(result).toEqual(res);
    });

    it('Should map numbers using thisArg', () => {
      let arr = new MArray(0, 1, 2, 3, 4);
      let res = new MArray(5, 6, 7, 8, 9);

      function summer(this: any, x: any): number {
        return this.add + x;
      }

      let result = arr.map(summer, { add: 5 });

      expect(result).toEqual(res);
    });

    it('Should filter numbers', () => {
      let arr = new MArray(0, 1, 2, 3, 4);
      let res = new MArray(0, 2, 4);

      let result = arr.filter(i => i % 2 === 0);

      expect(result).toEqual(res);
    });

    it('Should filter numbers using thisArg', () => {
      let arr = new MArray(0, 1, 2, 3, 4);
      let res = new MArray(0, 2, 4);

      function filter(this: any, x: number): boolean {
        return this.f(x);
      }

      let result = arr.filter(filter, { f: (x: number) => x % 2 === 0 });

      expect(result).toEqual(res);
    });
  });

  describe('MArray slice method tests suite', () => {
    it('should return a copy of the array when passed no arguments', () => {
      const arr = new MArray(1, 3, 5, 7, 9);

      expect(arr.slice()).toEqual(arr);
      expect(arr.length).toEqual(5);
    });

    it('should not modify the original array', () => {
      const arr = new MArray(0, 1, 1, 2, 3, 5);
      arr.slice(1, 3);

      expect(arr.length).toEqual(6);
    });

    it('should behave in the same way as Array.slice', () => {
      const arr = [1, 2, 3, 4, 5];
      const marr = MArray.from(arr);

      expect(marr.slice().toArray()).toEqual(arr.slice());
      expect(marr.slice(4).toArray()).toEqual(arr.slice(4));
      expect(marr.slice(6).toArray()).toEqual(arr.slice(6));
      expect(marr.slice(0, 3).toArray()).toEqual(arr.slice(0, 3));
      expect(marr.slice(1, 3).toArray()).toEqual(arr.slice(1, 3));
      expect(marr.slice(4, 3).toArray()).toEqual(arr.slice(4, 3));
      expect(marr.slice(1, 6).toArray()).toEqual(arr.slice(1, 6));
      expect(marr.slice(-2).toArray()).toEqual(arr.slice(-2));
      expect(marr.slice(1, -1).toArray()).toEqual(arr.slice(1, -1));
      expect(marr.slice(-2, -3).toArray()).toEqual(arr.slice(-2, -3));
      expect(marr.slice(-3, -2).toArray()).toEqual(arr.slice(-3, -2));
    });
  });

  describe('MArray splice method tests suite', () => {
    let arr = new Array();
    let marr = new MArray();

    beforeEach(() => {
      arr = [1, 2, 3, 4, 5];
      marr = MArray.from(arr);
    });

    it('should return a copy of the array and remove all elements from the original one', () => {
      const spliced = marr.splice(0);

      expect(marr.length).toEqual(0);
      expect(spliced.toArray()).toEqual(arr.splice(0));
    });

    it('should preserve all elements from the original array', () => {
      const originalLength = marr.length;
      const spliced = marr.splice(1, 0);

      expect(marr.length).toEqual(originalLength);
      expect(spliced.length).toEqual(0);
      expect(spliced.toArray()).toEqual(arr.splice(1, 0));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should remove the last element of the array and return it', () => {
      const spliced = marr.splice(marr.length - 1);

      expect(marr.length).toEqual(4);
      expect(spliced.toArray()).toEqual(arr.splice(arr.length - 1));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should remove the two last elements (negative index) and return them', () => {
      const spliced = marr.splice(-2);

      expect(spliced.toArray()).toEqual([4, 5]);
      expect(spliced.toArray()).toEqual(arr.splice(-2));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should return an empty array for a non-existing index', () => {
      const spliced = marr.splice(6);

      expect(spliced.length).toEqual(0);
      expect(spliced.toArray()).toEqual(arr.splice(6));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should remove the first two elements and return them', () => {
      const spliced = marr.splice(0, 2);

      expect(spliced.length).toEqual(2);
      expect(spliced.toArray()).toEqual(arr.splice(0, 2));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should remove the next two elements from the specified index and return them', () => {
      const spliced = marr.splice(1, 2);

      expect(spliced.toArray()).toEqual([2, 3]);
      expect(spliced.toArray()).toEqual(arr.splice(1, 2));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should remove the last element only if the delete count exceeds array length', () => {
      const spliced = marr.splice(marr.length - 1, 2);

      expect(spliced.length).toEqual(1);
      expect(spliced.toArray()).toEqual(arr.splice(arr.length - 1, 2));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should insert an element at index without removing existing ones', () => {
      const spliced = marr.splice(1, 0, 8);

      expect(spliced.length).toEqual(0);
      expect(marr.length).toEqual(6);
      expect(marr[1]).toEqual(8);
      expect(spliced.toArray()).toEqual(arr.splice(1, 0, 8));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should insert multiple elements without removing existing ones', () => {
      const spliced = marr.splice(1, 0, 4, 12, 60);

      expect(spliced.length).toEqual(0);
      expect(marr.length).toEqual(8);
      expect([marr[1], marr[2], marr[3]]).toEqual([4, 12, 60]);
      expect(spliced.toArray()).toEqual(arr.splice(1, 0, 4, 12, 60));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should remove elements and insert new ones at a specified index', () => {
      const spliced = marr.splice(1, 2, 10, 50, 100);

      expect(spliced.length).toEqual(2);
      expect(marr.length).toEqual(6);
      expect([marr[1], marr[2], marr[3]]).toEqual([10, 50, 100]);
      expect(spliced.toArray()).toEqual(arr.splice(1, 2, 10, 50, 100));
      expect(marr.toArray()).toEqual(arr);
    });

    it('should work on strange ranges', () => {
      const items = MArray.from([1, 2, 3, 3, 4, 5, 6, 7]);
      items.splice(2, 1); // This ensures the first child has 3 items
      expect(items.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7]);

      const result = items.splice(2, 3);
      expect(result.toArray()).toEqual([3, 4, 5]);
      expect(items.toArray()).toEqual([1, 2, 6, 7]);
      expect(items.length).toEqual(4);
    });
  });

  describe('MArray iteration test suite', () => {
    it('should be iterable by a for...of loop', () => {
      const mArray = new MArray(1, 2, 3, 4, 5);
      let result: number[] = [];

      for (let x of mArray) result.push(x);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should not return anything when iterating through an empty MArray', () => {
      const mArray = new MArray();
      let result: any[] = [];

      for (let x of mArray) result.push(x);

      expect(result).toEqual([]);
    });

    it('should behave in a same way as a regular array when being iterated with a for...of loop', () => {
      const regArray = [2, 4, 6, 8, 10];
      const mArray = new MArray(...regArray);
      let result1: number[] = [];
      let result2: number[] = [];

      for (let x of mArray) result1.push(x);
      for (let y of regArray) result2.push(y);

      expect(result1).toEqual(result2);
    });

    it('should behave in a same way as a regular array when being iterated with a MArray.forEach', () => {
      const regArray = [2, 4, 6, 8, 10];
      const mArray = new MArray(...regArray);
      const regResult: [number, number, number[]][] = [];
      const marrayResult: typeof regResult = [];

      regArray.forEach((v, i, a) => regResult.push([v, i, a]));
      mArray.forEach((v, i, a) => {
        expect(a).toBe(mArray);
        marrayResult.push([v, i, [...a]]);
      });

      expect(mArray.toArray()).toEqual(regArray); // ensure not mutated
      expect(regResult).toEqual(marrayResult);
    });

    it('should not return anything when forEach through an empty MArray', () => {
      const mArray = new MArray();
      let result: any[] = [];

      mArray.forEach(v => result.push(v));

      expect(result).toHaveLength(0);
    });
  });

  describe('MArray.foldTo and MArray.reduceAll test suite', () => {
    it('should fold to specified index', () => {
      const mArray = new MArray(1, 3, 5, 7);

      expect(mArray.foldTo(2, Total)).toEqual(9);
    });

    it('should throw when trying to fold to an out of bounds index', () => {
      const mArray = new MArray(1, 2, 3);

      expect(() => mArray.foldTo(100, Total)).toThrowError('Index out of bounds');
    });

    it('should reduce all items to their sum', () => {
      const mArray = new MArray(1, 2, 3, 4, 5);

      expect(mArray.reduceAll(Total)).toEqual(15);
    });
  });
});

type Node = { type: 'h1' | 'h2' | 'h3' | 'p'; text: string };

type ParentList = Array<Node>;
let ParentListLength = 3;

let VirtualParent = {
  operation(a: ParentList, b: ParentList) {
    let res = new Array(ParentListLength) as ParentList;
    let useA = true;
    res.fill(null);
    for (let k = 0; k < res.length; ++k) {
      if (b[k] != null) {
        useA = false;
        res[k] = b[k];
      } else if (useA) {
        res[k] = a[k];
      }
    }
    return res;
  },
  getCacheValue(n: Node) {
    let res = new Array(ParentListLength).fill(null) as ParentList;
    if (n.type === 'p') return res;
    let idx = Number(n.type.substr(1)) - 1;
    res[idx] = n;
    return res;
  },
  identity: [null, null, null] as ParentList,
};

describe('virtual parents', () => {
  it('works', () => {
    let v = MArray.from<Node>([
      { type: 'p', text: 'p1' },
      { type: 'h1', text: 'h1-1' },
      { type: 'p', text: 'a' },
      { type: 'h2', text: 'h2-1' },
      { type: 'p', text: 'b' },
      { type: 'h3', text: 'h3-1' },
      { type: 'p', text: 'c' },
      { type: 'p', text: 'd' },
      { type: 'p', text: 'e' },
      { type: 'h1', text: 'h1-2' },
      { type: 'h3', text: 'h3-2' },
      { type: 'p', text: 'f' },
      { type: 'p', text: 'g' },
      { type: 'p', text: 'h' },
    ]);
    for (let k = 7; k < 12; ++k) {
      console.log(v.at(k), v.reduceTo(k, VirtualParent));
    }
  });
});

describe('MArray track array functionality test suite', () => {
  let marr: MArray<number>;
  let added: MArray<number>;
  let removed: MArray<number>;

  beforeEach(() => {
    marr = new MArray(2, 4, 6, 8, 10);
    added = new MArray<number>();
    removed = new MArray<number>();
  });

  it('should track additions for a tracked MArray', () => {
    marr.track(
      item => added.push(item),
      () => {},
    );

    marr.push(100);
    expect(added[0]).toEqual(100);

    marr.splice(marr.length - 1, 0, 200);
    expect(added[1]).toEqual(200);

    marr.unshift(300);
    expect(added[2]).toEqual(300);
  });

  it('should track deletions for a tracked MArray', () => {
    marr.track(
      () => {},
      item => removed.push(item),
    );

    marr.splice(4);
    expect(removed[0]).toEqual(10);

    marr.pop();
    expect(removed[1]).toEqual(8);

    marr.shift();
    expect(removed[2]).toEqual(2);

    marr.splice(0, 2);
    expect([removed[3], removed[4]]).toEqual([4, 6]);
    expect(removed.length).toEqual(5);

    marr.pop();
    expect(removed.length).toEqual(5); //no changes since there are no items left
  });

  it('should track additions, deletions and updates for a tracked MArray', () => {
    marr.track(
      item => added.push(item),
      item => removed.push(item),
    );

    marr.pop();
    expect(removed[0]).toEqual(10);

    marr.push(12);
    expect(added[0]).toEqual(12);

    marr.update(0, 1);
    expect(added[1]).toEqual(1);
    expect(removed[1]).toEqual(2);

    marr[0] = 0;
    expect(added[2]).toEqual(0);
    expect(removed[2]).toEqual(1);
    expect(added.length).toEqual(3);
    expect(removed.length).toEqual(3);

    marr[0] = 0;
    expect(added.length).toEqual(3); // no changes since we are assigning the same value
    expect(removed.length).toEqual(3); // no changes since we are assigning the same value
  });

  it('should correctly track a MArray that has been tracked multiple times', () => {
    let events = new MArray<string>();
    let eventCount = 0;

    marr.track(
      item => added.push(item),
      item => removed.push(item),
    );

    marr.track(
      item => events.push(`added item: ${item}`),
      item => events.push(`removed item: ${item}`),
    );

    marr.track(
      _ => (eventCount += 1),
      _ => (eventCount += 1),
    );

    marr.pop();
    marr.push(12);
    marr.splice(0, 1, 100);
    marr[2] = marr[2] * 10;

    expect(removed).toEqual(MArray.from([10, 2, 6]));
    expect(added).toEqual(MArray.from([12, 100, 60]));
    expect(events).toEqual(
      MArray.from([
        'removed item: 10',
        'added item: 12',
        'removed item: 2',
        'added item: 100',
        'removed item: 6',
        'added item: 60',
      ]),
    );
    expect(eventCount).toEqual(6);
  });

  it('should correctly stop tracking a tracked MArray', () => {
    const untrack = marr.track(
      item => added.push(item),
      item => removed.push(item),
    );

    marr.pop();
    marr.push(100);
    marr[0] = 500;

    expect(removed).toEqual(MArray.from([10, 2]));
    expect(added).toEqual(MArray.from([100, 500]));
    expect(marr).toEqual(new MArray(500, 4, 6, 8, 100));
    expect([removed.length, added.length]).toEqual([2, 2]);

    untrack();

    marr.pop();
    marr.splice(1, 2, 400, 300);
    marr[3] = 200;
    marr.push(100);

    expect(marr).toEqual(MArray.from([500, 400, 300, 200, 100]));
    expect([removed.length, added.length]).toEqual([2, 2]); // the changes after the untrack should't be added
  });
});
