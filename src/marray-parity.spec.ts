import { MArray } from './marray';
import * as mobx from 'mobx';
import * as iterall from 'iterall';

test('test1', function() {
  const a = MArray.from([] as number[]);
  expect(a.length).toBe(0);
  expect(Object.keys(a)).toEqual([]);
  expect(a.slice()).toEqual([]);

  a.push(1);
  expect(a.length).toBe(1);
  expect(a.slice()).toEqual([1]);

  a[1] = 2;
  expect(a.length).toBe(2);
  expect(a.slice()).toEqual([1, 2]);

  const sum = mobx.computed(function() {
    return (
      -1 +
      a.reduce(function(a, b) {
        return a + b;
      }, 1)
    );
  });

  expect(sum.get()).toBe(3);

  a[1] = 3;
  expect(a.length).toBe(2);
  expect(a.slice()).toEqual([1, 3]);
  expect(sum.get()).toBe(4);

  a.splice(1, 1, 4, 5);
  expect(a.length).toBe(3);
  expect(a.slice()).toEqual([1, 4, 5]);
  expect(sum.get()).toBe(10);

  a.replace([2, 4]);
  expect(sum.get()).toBe(6);

  a.splice(1, 1);
  expect(sum.get()).toBe(2);
  expect(a.slice()).toEqual([2]);

  a.spliceWithArray(0, 0, [4, 3]);
  expect(sum.get()).toBe(9);
  expect(a.slice()).toEqual([4, 3, 2]);

  a.clear();
  expect(sum.get()).toBe(0);
  expect(a.slice()).toEqual([]);

  a.length = 4;
  expect(isNaN(sum.get())).toBe(true);
  expect(a.length).toEqual(4);

  expect(a.slice()).toEqual([undefined, undefined, undefined, undefined]);

  a.replace([1, 2, 2, 4]);
  expect(sum.get()).toBe(9);
  a.length = 4;
  expect(sum.get()).toBe(9);

  a.length = 2;
  expect(sum.get()).toBe(3);
  expect(a.slice()).toEqual([1, 2]);

  expect(a.reverse()).toEqual([2, 1]);
  expect(a).toEqual([2, 1]);
  expect(a.slice()).toEqual([2, 1]);

  a.unshift(3);
  expect(a.sort()).toEqual([1, 2, 3]);
  expect(a).toEqual([1, 2, 3]);
  expect(a.slice()).toEqual([1, 2, 3]);

  expect(JSON.stringify(a)).toBe('[1,2,3]');

  expect(a[1]).toBe(2);
  a[2] = 4;
  expect(a[2]).toBe(4);

  expect(Object.keys(a)).toEqual(['0', '1', '2']);
});

test('array should support iterall / iterable ', () => {
  const a = MArray.from([1, 2, 3]);

  expect(iterall.isIterable(a)).toBe(true);
  expect(iterall.isArrayLike(a)).toBe(true);

  const values: number[] = [];
  iterall.forEach(a, v => values.push(v));

  expect(values).toEqual([1, 2, 3]);

  let iter = iterall.getIterator(a);
  expect(iter.next()).toEqual({ value: 1, done: false });
  expect(iter.next()).toEqual({ value: 2, done: false });
  expect(iter.next()).toEqual({ value: 3, done: false });
  expect(iter.next()).toEqual({ value: undefined, done: true });

  a.replace([]);
  iter = iterall.getIterator(a);
  expect(iter.next()).toEqual({ value: undefined, done: true });
});

test('find(findIndex) and remove', function() {
  const a = MArray.from([10, 20, 20]);
  let idx = -1;
  function predicate(item: number, index: number) {
    if (item === 20) {
      idx = index;
      return true;
    }
    return false;
  }
  [].findIndex;
  expect(a.find(predicate)).toBe(20);
  expect(a.findIndex(predicate)).toBe(1);
  expect(a.find(predicate)).toBe(20);

  expect(a.remove(20)).toBe(true);
  expect(a.find(predicate)).toBe(20);
  expect(idx).toBe(1);
  expect(a.findIndex(predicate)).toBe(1);
  idx = -1;
  expect(a.remove(20)).toBe(true);
  expect(a.find(predicate)).toBe(undefined);
  expect(idx).toBe(-1);
  expect(a.findIndex(predicate)).toBe(-1);

  expect(a.remove(20)).toBe(false);
});

test('concat should work', () => {
  const a1 = MArray.from([1, 2]);
  const a2 = MArray.from([3, 4]);
  expect(a1.concat(a2)).toEqual([1, 2, 3, 4]);
});

test('array modification1', function() {
  const a = MArray.from([1, 2, 3]);
  const r = a.splice(-10, 5, 4, 5, 6);
  expect(a.slice()).toEqual([4, 5, 6]);
  expect(r).toEqual([1, 2, 3]);
});

test('serialize', function() {
  let a = [1, 2, 3];
  const m = MArray.from(a);

  expect(JSON.stringify(m)).toEqual(JSON.stringify(a));

  expect(a).toEqual(m.slice());

  a = [4];
  m.replace(a);
  expect(JSON.stringify(m)).toEqual(JSON.stringify(a));
  expect(a).toEqual(m.toJSON());
});

test('array modification functions', function() {
  const ars = [[], [1, 2, 3]];
  const funcs = ['push', 'pop', 'shift', 'unshift'];
  funcs.forEach(function(f) {
    ars.forEach(function(ar) {
      const a = ar.slice() as any;
      const b = MArray.from(a) as any;
      const res1 = a[f](4);
      const res2 = b[f](4);
      expect(res1).toEqual(res2);
      expect(a).toEqual(b.slice());
    });
  });
});

test('array modifications', function() {
  const a2 = MArray.from([]);
  const inputs = [undefined, -10, -4, -3, -1, 0, 1, 3, 4, 10];
  const arrays = [
    [],
    [1],
    [1, 2, 3, 4],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [1, undefined],
    [undefined],
  ];
  for (let i = 0; i < inputs.length; i++)
    for (let j = 0; j < inputs.length; j++)
      for (let k = 0; k < arrays.length; k++)
        for (let l = 0; l < arrays.length; l++) {
          [
            'array mod: [',
            arrays[k].toString(),
            '] i: ',
            inputs[i],
            ' d: ',
            inputs[j],
            ' [',
            arrays[l].toString(),
            ']',
          ].join(' ');
          const a1 = arrays[k].slice();
          a2.replace(a1);
          const res1 = a1.splice.apply(a1, [inputs[i], inputs[j]].concat(arrays[l]));
          const res2 = a2.splice.apply(a2, [inputs[i], inputs[j]].concat(arrays[l]));
          expect(a1.slice()).toEqual(a2.slice());
          expect(res1).toEqual(res2);
          expect(a1.length).toBe(a2.length);
        }
});

test('is array', function() {
  const x = MArray.from([]);
  expect(x instanceof Array).toBe(true);

  // would be cool if this would return true...
  expect(Array.isArray(x)).toBe(true);
});

test('stringifies same as ecma array', function() {
  const x = MArray.from([]);
  expect(x instanceof Array).toBe(true);

  // would be cool if these two would return true...
  expect(x.toString()).toBe('');
  expect(x.toLocaleString()).toBe('');
  x.push(1, 2);
  expect(x.toString()).toBe('1,2');
  expect(x.toLocaleString()).toBe('1,2');
});

test('observes when stringified', function() {
  const x = MArray.from([]);
  let c = 0;
  mobx.autorun(function() {
    x.toString();
    c++;
  });
  x.push(1);
  expect(c).toBe(2);
});

test('react to sort changes', function() {
  const x = MArray.from([4, 2, 3]);
  const sortedX = mobx.computed(function() {
    return x.slice().sort();
  });
  let sorted;

  mobx.autorun(function() {
    sorted = sortedX.get();
  });

  expect(x.slice()).toEqual([4, 2, 3]);
  expect(sorted).toEqual([2, 3, 4]);
  x.push(1);
  expect(x.slice()).toEqual([4, 2, 3, 1]);
  expect(sorted).toEqual([1, 2, 3, 4]);
  x.shift();
  expect(x.slice()).toEqual([2, 3, 1]);
  expect(sorted).toEqual([1, 2, 3]);
});

test('autoextend buffer length', function() {
  const ar = MArray.from(new Array(1000));
  let changesCount = 0;
  mobx.observe(ar, () => ++changesCount);

  ar[ar.length] = 0;
  ar.push(0);

  expect(changesCount).toBe(2);
});

test('array exposes correct keys', () => {
  const keys = [];
  const ar = MArray.from([1, 2]);
  for (const key in ar) keys.push(key);

  expect(keys).toEqual(['0', '1']);
});

test('isArrayLike', () => {
  const arr = [0, 1, 2];
  const observableArr = MArray.from(arr);

  const isArrayLike = mobx.isArrayLike;
  expect(typeof isArrayLike).toBe('function');

  expect(isArrayLike(observableArr)).toBe(true);
  expect(isArrayLike(arr)).toBe(true);
  expect(isArrayLike(42)).toBe(false);
  expect(isArrayLike({})).toBe(false);
});

test('accessing out of bound values throws', () => {
  const a = MArray.from([]);

  let warns = 0;
  const baseWarn = console.warn;
  console.warn = () => {
    warns++;
  };

  a[0]; // out of bounds
  a[1]; // out of bounds

  expect(warns).toBe(2);

  expect(() => (a[0] = 3)).not.toThrow();
  expect(() => (a[2] = 4)).toThrow(/Index out of bounds, 2 is larger than 1/);

  console.warn = baseWarn;
});

test('replace can handle large arrays', () => {
  const a = MArray.from([] as number[]);
  const b = [] as number[];
  b.length = 1000 * 1000;
  expect(() => {
    a.replace(b);
  }).not.toThrow();

  expect(() => {
    a.spliceWithArray(0, 0, b);
  }).not.toThrow();
});

test('can iterate arrays', () => {
  const x = MArray.from([] as string[]);
  const y = [] as number[];
  const d = mobx.reaction(() => Array.from(x), items => y.push(items), { fireImmediately: true });

  x.push('a');
  x.push('b');
  expect(y).toEqual([[], ['a'], ['a', 'b']]);
  d();
});

test('array is concat spreadable, #1395', () => {
  const x = MArray.from([1, 2, 3, 4]);
  const y = [5].concat(x);
  expect(y.length).toBe(5);
  expect(y).toEqual([5, 1, 2, 3, 4]);
});

test('array is spreadable, #1395', () => {
  const x = MArray.from([1, 2, 3, 4]);
  expect([5, ...x]).toEqual([5, 1, 2, 3, 4]);

  const y = MArray.from([]);
  expect([5, ...y]).toEqual([5]);
});

test('array supports toStringTag, #1490', () => {
  // N.B. on old environments this requires polyfils for these symbols *and* Object.prototype.toString.
  // core-js provides both
  const a = MArray.from([]);
  expect(Object.prototype.toString.call(a)).toBe('[object Array]');
});

test('slice works', () => {
  const a = MArray.from([1, 2, 3]);
  expect(a.slice(0, 2)).toEqual([1, 2]);
});

test('toString', () => {
  expect(MArray.from([1, 2]).toString()).toEqual([1, 2].toString());
  expect(MArray.from([1, 2]).toLocaleString()).toEqual([1, 2].toLocaleString());
});

test('can define properties on arrays', () => {
  const ar = MArray.from([1, 2]);
  Object.defineProperty(ar, 'toString', {
    enumerable: false,
    configurable: true,
    value: function() {
      return 'hoi';
    },
  });

  expect(ar.toString()).toBe('hoi');
  expect('' + ar).toBe('hoi');
});

test('concats correctly #1667', () => {
  const x = { data: MArray.from([]) };

  function generate(count: number) {
    const d = MArray.from([]);
    for (let i = 0; i < count; i++) d.push({});
    return d;
  }

  x.data = generate(10000);
  const first = x.data[0];
  expect(Array.isArray(x.data)).toBe(true);

  x.data = x.data.concat(generate(1000));
  expect(Array.isArray(x.data)).toBe(true);
  expect(x.data[0]).toBe(first);
  expect(x.data.length).toBe(11000);
});

test('correct array should be passed to callbacks #2326', () => {
  const array = MArray.from([1, 2, 3]);

  function callback() {
    const lastArg = arguments[arguments.length - 1];
    expect(lastArg).toBe(array);
  }
  [
    'every',
    'filter',
    'find',
    'findIndex',
    'flatMap',
    'forEach',
    'map',
    'reduce',
    'reduceRight',
    'some',
  ].forEach(method => {
    if (Array.prototype[method as any]) (array as any)[method](callback);
    else console.warn('SKIPPING: ' + method);
  });
});

test('very long arrays can be safely passed to nativeArray.concat #2379', () => {
  const nativeArray = ['a', 'b'];
  const longNativeArray = [...Array(10000).keys()]; // MAX_SPLICE_SIZE seems to be the threshold
  const longObservableArray = MArray.from(longNativeArray);
  expect(longObservableArray.length).toBe(10000);
  expect(longObservableArray).toEqual(longNativeArray);
  expect(longObservableArray[9000]).toBe(longNativeArray[9000]);
  expect(longObservableArray[9999]).toBe(longNativeArray[9999]);
  expect(longObservableArray[10000]).toBe(longNativeArray[10000]);

  const expectedArray = nativeArray.concat(longNativeArray);
  const actualArray = nativeArray.concat(longObservableArray);

  expect(actualArray).toEqual(expectedArray);

  const anotherArray = [0, 1, 2, 3, 4, 5];
  const observableArray = MArray.from(anotherArray);
  const r1 = anotherArray.splice(2, 2, ...longNativeArray);
  const r2 = observableArray.splice(2, 2, ...longNativeArray);
  expect(r2).toEqual(r1);
  expect(observableArray).toEqual(anotherArray);
});
