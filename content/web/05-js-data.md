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
