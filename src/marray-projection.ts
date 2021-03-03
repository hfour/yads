// import { MArray } from './marray';
// import { toInteger } from './marray-utils';
// import * as ts from './tree-structure';

// class MArrayProjection<Val> {
//   constructor(private m: MArray<any>, private monoid: ts.MonoidObj<Val, any>) {
//     return new Proxy(this, {
//       get: (target, prop, receiver) => {
//         let maybeInteger = toInteger(prop);
//         if (maybeInteger === null) {
//           return Reflect.get(target, prop, receiver);
//         } else return this.m.getMonoidAt(maybeInteger, this.monoid);
//       },
//       set: (target, prop, value, receiver): boolean => {
//         let maybeInteger = toInteger(prop);
//         if (maybeInteger === null) {
//           return Reflect.set(target, prop, value, receiver);
//         } else {
//           throw new Error('Cannot mutatie an MArray projection');
//         }
//       },
//     });
//   }

//   get length() {
//     return this.m.length;
//   }

//   [Symbol.iterator]() {
//     for (let item of tu.iterate(this.m)) {
//       return i;
//     }
//   }

//   forEach(callbackfn: (value: T, index: number, array: MArray<T>) => void, thisArg?: any): void {
//     let index = 0;

//     for (const value of this) {
//       callbackfn.call(thisArg, value, index, this);
//       index++;
//     }
//   }

//   toArray(): T[] {
//     let res = [];
//     for (let item of this) res.push(item);
//     return res;
//   }
// }
