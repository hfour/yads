import { MArray } from './marray';

let Total = {
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
      let resFromNegativeIndex = a.indexOf('rgb', -4);
      let resUpperBound = a.indexOf('ba', 5);
      let resOverUpperBound = a.indexOf('ba', 6);
      let resLowerBound = a.indexOf('xy', -6);
      let resOverLowerBound = a.indexOf('ba', -7);

      expect(res).toEqual(3);
      expect(resNot).toEqual(-1);
      expect(resFromIndex).toEqual(-1);
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
    })

    it('every() returns false if at least one element does not satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'b');

      let res = a.every(x => x.includes('x'));

      expect(res).toBe(false);
    })

    it('every() returns false if all the elements do not satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'b');

      let res = a.every(x => x.includes('l'));

      expect(res).toBe(false);
    })

    it('some() returns true if at least one element satisfies a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'bx');

      let res = a.some(x => x.includes('y'));

      expect(res).toBe(true);
    })

    it('some() returns true if all the elements satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'bx');

      let res = a.some(x => x.includes('x'));

      expect(res).toBe(true);
    })

    it('some() returns false if none of the elements satisfy a predicate', () => {
      let a = new MArray('xy', 'xz', 'rxb', 'gxb', 'bx');

      let res = a.some(x => x.includes('l'));

      expect(res).toBe(false);
    })
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
