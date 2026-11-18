---
id: web-typescript
title: TypeScript essentials
level: intermediate
minutes: 30
summary: Add types to JavaScript so your editor catches bugs before your users do.
---

## Why TypeScript

TypeScript is JavaScript with **type annotations**. It compiles to plain JavaScript, so it runs anywhere JS runs. The point is the editor: it knows the shape of every value, autocompletes properties, and underlines mistakes as you type. Most professional teams use it, and every serious web3 library (viem, wagmi) is built for it.

```ts
function formatGBP(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

formatGBP('6800');   // error: Argument of type 'string' is not assignable to parameter of type 'number'
```

## Basic types

```ts
let name: string = 'Amara';
let stock: number = 12;
let isLive: boolean = true;
let sizes: string[] = ['S', 'M'];
let maybe: string | null = null;         // union: one OR the other
let status: 'draft' | 'live' | 'archived' = 'draft';   // literal union: only these exact strings
```

You rarely need annotations on variables. TypeScript **infers** them: `let stock = 12` is already a `number`. Annotate function parameters, return types of exported functions, and data shapes.

:::exercise Add types to a function
@@file money.ts
@@prompt
Write a TypeScript function `formatGBP` that takes `pence` of type `number` and returns a `string`: a template literal with a pound sign and `${(pence / 100).toFixed(2)}`.
@@solution
function formatGBP(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}
@@hint function\s+formatGBP\s*\(\s*pence\s*:\s*number\s*\)
Parameter types go after a colon: `function formatGBP(pence: number)`
@@hint \)\s*:\s*string\s*\{
The return type goes after the closing bracket: `): string {`
@@hint return\s+`£\$\{\s*\(\s*pence\s*\/\s*100\s*\)\.toFixed\(\s*2\s*\)\s*\}`
Line 2: `return` then a template literal: backtick, `£${(pence / 100).toFixed(2)}`, backtick.
:::

## Describing objects

```ts
type Product = {
  id: string;
  name: string;
  pricePence: number;
  sizes: string[];
  salePricePence?: number;      // ? = optional
};

const dress: Product = {
  id: 'dr-001',
  name: 'Linen Wrap Dress',
  pricePence: 6800,
  sizes: ['S', 'M', 'L'],
};

function displayPrice(p: Product): number {
  return p.salePricePence ?? p.pricePence;
}
```

`interface Product { ... }` does almost the same as `type Product = { ... }`. Pick one style per project; `type` is more flexible.

:::exercise Describe a product type
@@file product.ts
@@prompt
Write a `type` called `Product` with four properties: `id` (string), `name` (string), `pricePence` (number), and an **optional** `salePricePence` (number).
@@solution
type Product = {
  id: string;
  name: string;
  pricePence: number;
  salePricePence?: number;
};
@@hint ^\s*type\s+Product\s*=\s*\{
Line 1: `type Product = {`
@@hint id\s*:\s*string
`id: string;`
@@hint name\s*:\s*string
`name: string;`
@@hint pricePence\s*:\s*number
`pricePence: number;`
@@hint salePricePence\?\s*:\s*number
Optional properties get a question mark before the colon: `salePricePence?: number;`
:::

## Narrowing

When a value could be several types, check it and TypeScript narrows it for you:

```ts
function label(stock: number | 'unknown') {
  if (stock === 'unknown') return 'Check back soon';
  return stock > 0 ? `${stock} left` : 'Sold out';   // here stock is definitely a number
}
```

## Generics in one minute

Generics let a type take a type, like a function takes an argument:

```ts
type ApiResponse<T> = { data: T; error: string | null };

const res: ApiResponse<Product[]> = { data: [], error: null };
```

You will mostly use generics written by libraries (`useState<Product[]>([])`, `Promise<User>`), not write your own at first.

## Set up a TypeScript project

The easiest way is a Vite template, which is pre-configured:

```bash
npm create vite@latest shop -- --template react-ts
cd shop
npm install
npm run dev
```

Check types for the whole project without building:

```bash
npx tsc --noEmit
```

Keep `"strict": true` in `tsconfig.json`. Strict mode catches the most bugs; turning it off defeats the purpose.

:::warn Types vanish at runtime
TypeScript checks your code, not your data. JSON from an API or a form can be anything, whatever type you claim. Validate untrusted data at the boundary with a library like **Zod**, which gives you both a runtime check and a TypeScript type from one schema.
:::

```ts
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  pricePence: z.number().int().nonnegative(),
});
type Product = z.infer<typeof ProductSchema>;

const product = ProductSchema.parse(await res.json());   // throws if the shape is wrong
```

:::tip Avoid any
`any` switches type checking off for that value, and it spreads. If you truly do not know a type yet, use `unknown`, which forces you to check before using it.
:::

:::exercise A union of allowed values
@@file status.ts
@@prompt
Two lines:

1. A type `Status` that only allows `'draft'`, `'live'` or `'archived'` (separate them with the `|` symbol).
2. A variable (`let`) `status` of type `Status`, set to `'draft'`.
@@solution
type Status = 'draft' | 'live' | 'archived';
let status: Status = 'draft';
@@hint type\s+Status\s*=
Line 1 starts `type Status =`
@@hint ['"]draft['"]\s*\|\s*['"]live['"]\s*\|\s*['"]archived['"]
List the three strings with a bar between each: `'draft' | 'live' | 'archived'`
@@hint let\s+status\s*:\s*Status\s*=\s*['"]draft['"]
Line 2: `let status: Status = 'draft';`
@@explain
Now `status = 'deleted'` is an error in your editor before the code ever runs, and typing `status = '` offers the three valid options.
:::

## Quiz

? What does TypeScript do with your type annotations when the code runs in a browser?
- [ ] Checks every value at runtime
- [x] Removes them: types exist only while you develop and compile
- [ ] Sends them to the server
> Types are erased at compile time. That is why you validate external data with something like Zod.

? What does `salePricePence?: number` mean in a type?
- [ ] It must be a number greater than zero
- [x] The property is optional: it may be missing, but if present it is a number
- [ ] It can be any type
> The question mark marks an optional property.

? Which type allows only the exact strings 'draft', 'live' or 'archived'?
- [ ] string
- [x] 'draft' | 'live' | 'archived'
- [ ] any
> A union of string literals restricts values to that set, and the editor autocompletes them.

? You do not know the shape of some data yet. What is safer than any?
- [x] unknown
- [ ] object
- [ ] never
> unknown forces you to check the value before using it; any silently disables checking.
