# Yads (yet another data structure)

So what is it?

Its an array-like data structure that caches derived data about its elements using MobX

Imagine an array that can re-compute the following reduce call:

```typescript
array.reduce((acc, el) => acc + el);
```

in `O(log(n))` instead of `O(n)` any time you change or add an element in the array.

For an array of length 1024, that would be `7` steps instead of `1024`.

Now imagine that you can also get a partial reduce (fold):

```typescript
array.reduceTo(elementIndex, (acc, el) => acc + el);
```

in the same `O(log(n))` time. Magic!

## How to use it?

For yads to work, the reduce operation has to be defined in a slightly more complex way.

Instead of just the reduce function, you will need 3 pieces of information

- **identity** - the initial value (like the one you would pass to `array.reduce(fn, initialValue)`)
- **operation** - the function to apply for any two elements
- **getCacheValue** - the function to apply to every leaf element

By giving these items, `yads` will effectively compute:

```typescript
array.reduce((acc, el) => operation(acc, getCacheValue(el)), identity);
```

Lets see how we can write the code to do this:

```typescript
import { MArray, MonoidObj } from 'yads';

let Total: MonoidObj<number, number> = {
  operation: (a: number, b: number) => a + b,
  identity: 0,
  getCacheValue: a => a,
};

let a = new MArray([5, 10, 2, 3, 11]);

expect(a.reduceTo(2, Total)).toEqual(17); // reduces to the 3rd element
```

## What can you use this for?

One example would be a custom calculated layout:

- The height of each element in a list affects the top offset of all the other elements.
- Updating one element's height will cause updates for the top offsets of the subsequent elements
- If you are rendering only k visible elements, this will cost `O(log(n) + k)` with yads regardless
  of which element got updated; it will cost `O(n + k)` for a regular array

Another example are live search results for a huge list of items

- The associative operation can construct a mirrored search results tree { leftResults: L,
  rightResults: R}
- An `@observer` react component can render results of this tree (either direct results from a leaf
  or a tree of recursive results)
- Updating any of the individual items content will only trigger `O(1)` re-renders of the search
  results (only the leaf items will update)

TODO: more examples

## Theory

A monoid is a simple structure that defines an _identity value_ and an _associative operation_.

An associative operation is a binary operation (has 2 operands) that gives the same result, no
matter how the operands are grouped. For example, addition and multiplication are associative
operations: `(a + b) + c = a + (b + c)`.

The identity value is a special value for an associative operation. When the operation is performed
on any value (A) with the identity value (I), the result is always (A). For addition, the identity
value is `0`, and for multiplication it's `1`. For example: `5 + 0 = 5` and `1 * 6 = 6`.

The current design is dependent on associativity since we're reducing form the left and there is no
order defined between any child nodes. Consider the following example:

```

      R___
     /    \
    a      b
   / \    / \
 e1  e2  e3 e4

```

Since there is a partial fold `pf` defined on `a` and `b`, we require associativity so that
`pf(a) o pf(b) = pf(R)` for any operation `o`. This will not be fulfilled e.g. for the operation `-`
since we will have that `pf(a) = e1 - e2` and `pf(b) = e3 - e4`, but
`pf(a) - pf(b) = e1 - e2 - e3 + e4`, which is different from `pf(R) = e1 - e2 - e3 - e4`.

We also need a way to express how the cache values are extracted from a single element in the array.
We do this by defining a function property on the monoid called `getCacheValue`.

One cool thing about this data structure is that you can lazily define caches, by passing the monoid
each time you do cache lookups. If the cache is cold, the `getCacheValue` function is used to
construct it. A warm cache will be reused as much as possible. Adding a new element to the array
will trigger a single run of `getCacheValue` for the new element, and `O(log(N))` runs of the
`operation` function.

## Internals

The data structure is implemented as a modified [2-3 tree](https://en.wikipedia.org/wiki/2–3_tree).
The difference from regular 2-3 trees is that data is only kept in the leaf nodes, while the
internal nodes (iNodes) are only used to store the cumulative cached values for their descendants.
Additionally, ordering of the elements is _not_ taken into consideration. All leaf nodes are kept at
the same depth which makes it easier to balance the tree.

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

Random access is a `log(N)` operation. We leverage the cache system to keep track of how many leaf
nodes (elements) there are under each iNode and there's a predefined `Size` monoid that you can use
to query the array's `length` property "indirectly"

```typescript
import { Size } from 'yads';

const length = myYadsArray.reduceAll(Size); // Returns myYadsArray.length
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
