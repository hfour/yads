# Yads (yet another data structure)

So what is it?

It's an array-like data structure that caches derived data about its elements in an efficient way.

Suppose you have an array of elements that look like this:

```typescript
type Element = {
  value: number;
};

const myArray: Element[] = [{ value: 1 }, { value: 2 }, { value: 5 }, { value: 6 }];
```

You want to know how many of the elements in your array have an even value. You have to calculate
it, maybe using a reduce:

```typescript
const evenCount = myArray.reduce((count, el) => count + (el.value % 2 === 0 ? 1 : 0), 0);
```

If your array is large and gets mutated often, this becomes inefficient, so you must devise some
caching mechanism. This data structure makes caching fast and easy for very large arrays whose
operations on elements are associative. You could do something like this:

```typescript
import { EvenCount } from './someplace';
const evenCount = myArray.getValue(EvenCount); // Much much faster than running reduce.
```

## How to use it

**Note:** This repo is still a work in progress. It does not expose a true array API to the data
structure yet, so you will need to use helper functions.

First, we need a way to describe what we're caching. We do this by defining a monoid. A monoid is a
simple structure that defines an _identity value_ and an _associative operation_.

An associative operation is a binary operation (has 2 operands) that gives the same result, no
matter how the operands are grouped. For example, addition and multiplication are associative
operations: `(a + b) + c = a + (b + c)`.

The identity value is a special value for an associative operation. When the operation is performed
on any value (A) with the identity value (I), the result is always (A). For addition, the identity
value is `0`, and for multiplication it's `1`. For example: `5 + 0 = 5` and `1 * 6 = 6`.

The current design is dependent on associativity since we're folding form the left and there is no
order defined between any child nodes. Consider the following example:

```
      R___
     /    \
    a      b
   / \    / \
  e1  e2 e3  e4
```

Since there is a partial fold `pf` defined on `a` and `b`, we require associativity so that
`pf(a) o pf(b) = pf(R)` for any operation `o`. This will not be fulfilled e.g. for the operation
`-` since we will have that `pf(a) = e1 - e2` and `pf(b) = e3 - e4`, but
`pf(a) - pf(b) = e1 - e2 - e3 + e4`, which is different from `pf(R) = e1 - e2 - e3 - e4`.

We also need a way to express how the cache values are extracted from a single element in the array.
We do this by defining a function property on the monoid called `getCacheValue`.

So, here's how we define a cache for our array:

```typescript
import { MonoidObj, fromArray, insert } from 'yads'

/**
 * EvenCount is a number value. It tells us how many values in the array are even.
 * The associative operation is simple arithmetic addition.
 * The cached value for a single element is `1` if the element value is even, otherwise `0`.
 */
const EvenCount: MonoidObj<number> = Object.freeze({
  // It's the same operation as the reduce in the above example
  operation: (a, b) => a + b,
  // Addition's identity is 0
  identity: 0,
  // Cache value is 1 if data val is even
  getCacheValue: (leaf) => leaf.data.value % 2 === 0 ? 1 : 0
});

const myYadsArray = fromArray(myArray);
myYadsArray.getField(EvenCount); // Returns 2 (2 and 6 are even elements)

insert(myYadsArray, 2, [{ value: 7 }, { value: 8 }]);
myYadsArray.getField(EvenCount); // Returns 3 (2, 6 and 8 are even elements)
```

One cool thing about this data structure is that you can lazily define caches, by passing the monoid
each time you do cache lookups. If the cache is cold, the `getCacheValue` function is used to
construct it. A warm cache will be reused as much as possible. Adding a new element to the array
will trigger a single run of `getCacheValue` for the new element, and at most Log2(N) runs of the
`operation` function.

Notice that `getCacheValue` accepts something called `leaf`, and you access the data with
`leaf.data.value` instead of `leaf.value`. This exposes the internals of the implementation, which
we talk about next.

## Internals

The data structure is implemented as a modified 2-3 tree (https://en.wikipedia.org/wiki/2–3_tree).
The difference from regular 2-3 trees is that data is only kept in the leaf nodes, while the
internal nodes (iNodes) are only used to store the cummulative cached values for their descendants.
All leaf nodes are kept at the same depth which makes it easier to balance the tree.

The leaf nodes have a `data` property which references the actual data element they represent. The
leaf nodes are passed to the `getCacheValue` function instead of the data elements - that's why you
access the actual array elements with `leaf.data`.

2-3 trees are much easier to keep balanced and the balancing algorithm is quite simple: Each iNode
can have either 2 or 3 children. If an iNode ends up with a single child, that child is moved into
one of its siblings. If an iNode ends up with no children, it's destroyed. If a iNode ends up with 4
children, it gets split into two iNodes with 2 children each. That's pretty much it.

The balancing algorithm will work recursively up the tree splitting and merging iNodes where needed
and eventually increasing the depth of the tree. The depth of the tree is between Log2(N) and
Log3(N).

The data structure is also efficient on how often it triggers a rebalance since it's sparse. An
iNode that has 2 children won't trigger a rebalance when another child is added. When a 4th child is
added, the the iNode will rebalance by splitting into 2 iNodes, which will only trigger a rebalance
to the parent node if the parent already contained 3 children. This does not happen often. The worst
case is when all the iNodes have 3 children. In this case adding a leaf node will trigger Log3(N)
rebalances. However, after this rebalance cascade, the tree will be sparse again so the next
inserted element will be again efficient.

Here's an example of how the tree changes when we keep adding leaf nodes.

```
    R
   / \
  e   e

    R___
   / \  \
  e   e  e

      R___
     /    \
    a      b
   / \    / \
  e   e  e   e

      R___
     /    \
    a      b___
   / \    / \  \
  e   e  e   e  e

      R__________
     /    \      \
    a      b      c
   / \    / \    / \
  e   e  e   e  e   e

      R__________
     /    \      \
    a      b      c___
   / \    / \    / \  \
  e   e  e   e  e   e  e

        R__________
       /           \
      a___          b___
     /    \        /    \
    a      b      a      b
   / \    / \    / \    / \
  e   e  e   e  e   e  e   e

        R__________
       /           \
      a___          b___
     /    \        /    \
    a      b      a      b___
   / \    / \    / \    / \  \
  e   e  e   e  e   e  e   e  e

        R__________
       /           \
      a___          b__________
     /    \        /    \      \
    a      b      a      b      c
   / \    / \    / \    / \    / \
  e   e  e   e  e   e  e   e  e   e

        R__________
       /           \
      a___          b__________
     /    \        /    \      \
    a      b      a      b      c___
   / \    / \    / \    / \    / \  \
  e   e  e   e  e   e  e   e  e   e  e
```

Random access is a Log2(N) operation. We leverage the cache system to keep track of how many leaf
nodes (elements) there are under each iNode and there's a predefined `Size` monoid that you can use
to query the array's `length` property:

```typescript
import { Size } from 'yads';

// Don't forget, we pushed 2 elements in the other example
const length = myYadsArray.getField(Size); // Returns 6
```

## Dependencies

The data structure depends on MobX. This part of the documentation should be extended to explain why
and how Mobx can be leveraged to compute stuff.

## Contributing

This is very much an early work in progress. There are a lot of optimizations to be done and a true
array-like interface that hides the internals properly.

The cache system currently supports only associative operations. Having a traversal-based cache
system will also be useful.

You will need yarn (https://yarnpkg.com/en/) and parcel (https://parceljs.org/).

1. Run `yarn`
2. You can either tinker with the tests, or alternatively;
3. You can run `yarn browser` to start a development server with `parcel`, then visit
   "http://localhost:1234" to play around with it in the browser. Check out the `dev` folder for the
   browser code.

## Known bugs

1. The `remove` helper method can leave the tree in an unbalanced state which throws an error. This
   example is illustrated in the `dev` folder when you run it in the browser (open the console, see
   the error - there's an iNode with no children that doesn't get removed).
