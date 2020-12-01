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
