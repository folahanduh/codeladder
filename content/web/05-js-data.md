---
id: web-js-data
title: "JavaScript data: arrays, objects and loops"
level: beginner
minutes: 25
summary: Store lists and records, loop over them, and transform data with map, filter and reduce.
---

## Arrays: ordered lists

```js
const sizes = ['XS', 'S', 'M', 'L'];

sizes[0];          // 'XS' (counting starts at 0)
sizes.length;      // 4
sizes.push('XL');  // add to the end
sizes.includes('M');   // true
sizes.indexOf('L');    // 3
```

:::exercise Work with an array
@@file sizes.js
@@prompt
Write four lines:

1. `const sizes = ['XS', 'S', 'M', 'L'];`
2. Add `'XL'` to the end with `push`.
3. Print how many sizes there are.
4. Print the first size.
@@solution
const sizes = ['XS', 'S', 'M', 'L'];
sizes.push('XL');
console.log(sizes.length);
console.log(sizes[0]);
@@hint const\s+sizes\s*=\s*\[
Line 1: an array in square brackets: `const sizes = ['XS', 'S', 'M', 'L'];`
@@hint sizes\.push\(\s*['"]XL['"]\s*\)
Line 2: `sizes.push('XL');`
@@hint console\.log\(\s*sizes\.length\s*\)
Line 3: `console.log(sizes.length);`
@@hint console\.log\(\s*sizes\[\s*0\s*\]\s*\)
Line 4: the first item is at position 0: `console.log(sizes[0]);`
@@explain
Output: `5` then `XS`. A `const` array can still have items added: `const` only stops you replacing the whole array with a new one.
:::

## Objects: named properties

```js
const product = {
  id: 'dr-001',
  name: 'Linen Wrap Dress',
  pricePence: 6800,
  sizes: ['S', 'M', 'L'],
  inStock: true,
};

product.name;            // 'Linen Wrap Dress'
product['pricePence'];   // 6800 (bracket form works with variables too)
product.colour = 'sage'; // add a property
```

Real data is usually **an array of objects**. That is exactly what an API sends back:

```js
const products = [
  { name: 'Wrap dress', pricePence: 6800, category: 'dresses' },
  { name: 'Camp shirt', pricePence: 4200, category: 'tops' },
  { name: 'Bucket hat', pricePence: 2200, category: 'accessories' },
  { name: 'Slip dress', pricePence: 5400, category: 'dresses' },
];
```

:::exercise Work with an object
@@file product.js
@@prompt
Write three lines:

1. A constant `product` that is an object with `name: 'Wrap dress'` and `pricePence: 6800`.
2. Print `product.name`.
3. Print the price in pounds: `product.pricePence / 100`.
@@solution
const product = { name: 'Wrap dress', pricePence: 6800 };
console.log(product.name);
console.log(product.pricePence / 100);
@@hint const\s+product\s*=\s*\{
Line 1 starts `const product = {` (curly braces for objects).
@@hint name\s*:\s*['"]Wrap dress['"]\s*,
`name: 'Wrap dress',` then a comma before the next property.
@@hint pricePence\s*:\s*6800\s*\}
`pricePence: 6800 }` then close the object.
@@hint console\.log\(\s*product\.name\s*\)
Line 2: `console.log(product.name);`
@@hint product\.pricePence\s*\/\s*100
Line 3: `console.log(product.pricePence / 100);`
:::

## Loops

```js
for (const p of products) {
  console.log(`${p.name}: £${p.pricePence / 100}`);
}

// classic counter loop, when you need the index
for (let i = 0; i < products.length; i++) {
  console.log(i + 1, products[i].name);
}
```

## map, filter, reduce: the professional way

These three methods replace most loops. They do not change the original array; they return a new value.

```js try
const products = [
  { name: 'Wrap dress', pricePence: 6800, category: 'dresses' },
  { name: 'Camp shirt', pricePence: 4200, category: 'tops' },
  { name: 'Bucket hat', pricePence: 2200, category: 'accessories' },
  { name: 'Slip dress', pricePence: 5400, category: 'dresses' },
];

// map: transform every item -> new array of the same length
const names = products.map((p) => p.name);

// filter: keep only items that pass a test
const dresses = products.filter((p) => p.category === 'dresses');

// reduce: boil the array down to one value
const totalPence = products.reduce((sum, p) => sum + p.pricePence, 0);

// find: the first match (or undefined)
const hat = products.find((p) => p.name.includes('hat'));

// some / every: true or false questions
const anyUnder25 = products.some((p) => p.pricePence < 2500);

// sort (copy first: sort changes the array in place)
const cheapestFirst = [...products].sort((a, b) => a.pricePence - b.pricePence);

console.log(names);
console.log(dresses);
console.log('Total £' + totalPence / 100);
console.log(hat, anyUnder25);
console.table(cheapestFirst);
```

You can **chain** them: `products.filter(p => p.category === 'dresses').map(p => p.name)`.

:::exercise filter and reduce
@@file prices.js
@@prompt
Write four lines:

1. `const prices = [6800, 4200, 2200];`
2. A constant `cheap` holding only the prices under 5000, using `filter` with an arrow function `(p) => p < 5000`.
3. A constant `total` that adds them all up with `reduce((sum, p) => sum + p, 0)`.
4. `console.log(cheap, total);`
@@solution
const prices = [6800, 4200, 2200];
const cheap = prices.filter((p) => p < 5000);
const total = prices.reduce((sum, p) => sum + p, 0);
console.log(cheap, total);
@@also
const prices = [6800, 4200, 2200];
const cheap = prices.filter(p => p < 5000);
const total = prices.reduce((sum, p) => sum + p, 0);
console.log(cheap, total);
@@hint const\s+prices\s*=\s*\[\s*6800\s*,\s*4200\s*,\s*2200\s*\]
Line 1: `const prices = [6800, 4200, 2200];`
@@hint prices\.filter\(\s*\(?\s*p\s*\)?\s*=>\s*p\s*<\s*5000\s*\)
Line 2: `const cheap = prices.filter((p) => p < 5000);`
@@hint prices\.reduce\(\s*\(\s*sum\s*,\s*p\s*\)\s*=>\s*sum\s*\+\s*p\s*,\s*0\s*\)
Line 3: `const total = prices.reduce((sum, p) => sum + p, 0);` The `0` is the starting value.
@@hint console\.log\(\s*cheap\s*,\s*total\s*\)
Line 4: `console.log(cheap, total);`
@@explain
Output: `[4200, 2200]` and `13200`. `filter` keeps items that pass the test; `reduce` carries a running `sum` through the array, starting from `0`.
:::

## Destructuring and spread

Shortcuts you will see in every modern codebase:

```js
const { name, pricePence } = product;        // pull properties into variables
const [first, second] = sizes;               // pull array items into variables

const updated = { ...product, pricePence: 6000 };  // copy an object, changing one field
const allSizes = [...sizes, 'XXL'];                 // copy an array, adding one item
```

Copying instead of changing (mutating) data avoids a whole family of bugs, and it is how React expects you to work.

## JSON

JSON is how data travels between servers and browsers. It looks like JavaScript objects, with stricter rules (double quotes, no trailing commas, no functions).

```js
const text = JSON.stringify(product);   // object -> string (to send or store)
const back = JSON.parse(text);          // string -> object (after receiving)
```

:::exercise Copy an object with spread
@@file sale.js
@@prompt
Write three lines:

1. The same `product` object: `{ name: 'Wrap dress', pricePence: 6800 }`.
2. A constant `sale` that copies `product` with spread (`...product`) but sets `pricePence` to `5400`.
3. `console.log(sale);`
@@solution
const product = { name: 'Wrap dress', pricePence: 6800 };
const sale = { ...product, pricePence: 5400 };
console.log(sale);
@@hint const\s+product\s*=\s*\{\s*name\s*:\s*['"]Wrap dress['"]\s*,\s*pricePence\s*:\s*6800\s*\}
Line 1: `const product = { name: 'Wrap dress', pricePence: 6800 };`
@@hint \{\s*\.\.\.product\s*,
Line 2 starts the new object with three dots: `{ ...product,`
@@hint pricePence\s*:\s*5400\s*\}
Then override the price: `pricePence: 5400 }`
@@hint console\.log\(\s*sale\s*\)
Line 3: `console.log(sale);`
@@explain
Output: `{ name: "Wrap dress", pricePence: 5400 }`. The original `product` still costs 6800. Copying instead of changing data is how React expects you to work.
:::

## Quiz

? What does `['a', 'b', 'c'][1]` return?
- [ ] 'a'
- [x] 'b'
- [ ] 'c'
> Arrays are zero-indexed: position 0 is the first item.

? You want only the products under £30 from an array. Which method?
- [ ] map
- [x] filter
- [ ] reduce
> filter keeps items that pass a test; map transforms every item; reduce combines into one value.

? What does `products.reduce((sum, p) => sum + p.pricePence, 0)` produce?
- [ ] An array of prices
- [x] The total of all prices in pence
- [ ] The most expensive product
> reduce starts at 0 and adds each price to the running sum.

? What does `{ ...product, pricePence: 6000 }` do?
- [x] Makes a new object with every property of product, but pricePence set to 6000
- [ ] Changes product.pricePence to 6000
- [ ] Deletes the other properties
> The spread copies, then the later property overrides. The original is unchanged.
