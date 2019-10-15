import { MArray } from './marray';

let Total = {
  operation: (a: number, b: number) => a + b,
  identity: 0,
  getCacheValue: (a: number) => a,
};

describe('array', () => {
  it('has basic functionality', () => {
    let a = new MArray(1, 2, 3);
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
    expect(a.reduceTo(2, Total)).toEqual(17);
  });
});
