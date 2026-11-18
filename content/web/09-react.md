---
id: web-react
title: React fundamentals
level: intermediate
minutes: 35
summary: Components, props, state, effects and lists. Think in components and build UIs that stay in sync with data.
---

## The big idea

In the DOM lesson you wrote state, a render function, and actions. React is that pattern, industrialised. You describe **what the UI should look like for a given state**, and React updates the page efficiently whenever the state changes.

Start a project:

```bash
npm create vite@latest shop -- --template react-ts
cd shop && npm install && npm run dev
```

## Components and JSX

A component is a function that returns **JSX**, HTML-like syntax inside JavaScript:

```tsx
function ProductCard() {
  return (
    <article className="card">
      <h2>Linen Wrap Dress</h2>
      <p>£68.00</p>
    </article>
  );
}
```

JSX differences from HTML: `className` instead of `class`, `htmlFor` instead of `for`, every tag must close (`<img />`), and `{curly braces}` drop in any JavaScript expression.

:::exercise Your first component
@@file ProductCard.tsx
@@prompt
Write a component called `ProductCard` that returns an `h2` saying `Linen Wrap Dress`. Three lines: the function line, a `return` line, and the closing brace.
@@solution
function ProductCard() {
  return <h2>Linen Wrap Dress</h2>;
}
@@hint function\s+ProductCard\s*\(\s*\)\s*\{
Line 1: `function ProductCard() {` (components start with a capital letter).
@@hint return\s+<h2>\s*Linen Wrap Dress\s*</h2>
Line 2: `return <h2>Linen Wrap Dress</h2>;` JSX goes straight after `return`.
@@hint ^\s*\}\s*$
Close the function with `}`.
:::

## Props: inputs to a component

```tsx
type ProductCardProps = {
  name: string;
  pricePence: number;
  onAdd: () => void;
};

function ProductCard({ name, pricePence, onAdd }: ProductCardProps) {
  return (
    <article className="card">
      <h2>{name}</h2>
      <p>£{(pricePence / 100).toFixed(2)}</p>
      <button onClick={onAdd}>Add to bag</button>
    </article>
  );
}

// used like an HTML tag:
<ProductCard name="Camp shirt" pricePence={4200} onAdd={() => console.log('added')} />
```

Props flow **down** from parent to child. Children talk back up by calling functions passed as props (`onAdd`).

## State: data that changes

```tsx
import { useState } from 'react';

function Counter() {
  const [qty, setQty] = useState(1);
  return (
    <div>
      <button onClick={() => setQty(qty - 1)} disabled={qty <= 1}>-</button>
      <span>{qty}</span>
      <button onClick={() => setQty(qty + 1)}>+</button>
    </div>
  );
}
```

`useState` returns the current value and a setter. Calling the setter re-renders the component with the new value. **Never** change state directly (`qty++` does nothing visible); always call the setter, and for arrays and objects pass a **new** copy:

```tsx
setCart([...cart, newItem]);                                    // add
setCart(cart.filter((item) => item.id !== id));                 // remove
setCart(cart.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item)); // update
```

:::exercise State with useState
@@file Counter.tsx
@@prompt
Write a `Counter` component:

1. `function Counter() {`
2. Create state: `const [qty, setQty] = useState(1);`
3. Return a button that adds one when clicked: `return <button onClick={() => setQty(qty + 1)}>{qty}</button>;`
4. `}`
@@solution
function Counter() {
  const [qty, setQty] = useState(1);
  return <button onClick={() => setQty(qty + 1)}>{qty}</button>;
}
@@hint function\s+Counter\s*\(\s*\)\s*\{
Line 1: `function Counter() {`
@@hint const\s*\[\s*qty\s*,\s*setQty\s*\]\s*=\s*useState\(\s*1\s*\)
Line 2: `const [qty, setQty] = useState(1);` (square brackets on the left).
@@hint onClick=\{\s*\(\s*\)\s*=>\s*setQty\(\s*qty\s*\+\s*1\s*\)\s*\}
The click handler: `onClick={() => setQty(qty + 1)}`
@@hint >\s*\{\s*qty\s*\}\s*</button>
Between the tags show the value: `{qty}</button>;`
:::

## Lists and keys

```tsx
<ul>
  {products.map((p) => (
    <li key={p.id}>{p.name}</li>
  ))}
</ul>
```

Each item needs a stable, unique `key` (an id, not the array index) so React can track which item is which.

:::exercise Render a list with keys
@@file ProductList.tsx
@@prompt
Inside a `ul`, map over `products` and return an `li` for each, with `key={p.id}` and the product's name. Three lines: `<ul>`, the map line, `</ul>`.
@@solution
<ul>
  {products.map((p) => <li key={p.id}>{p.name}</li>)}
</ul>
@@also
<ul>
  {products.map(p => <li key={p.id}>{p.name}</li>)}
</ul>
@@hint ^\s*<ul>\s*$
Line 1: `<ul>`
@@hint \{\s*products\.map\(
Line 2 starts with a curly brace (JavaScript inside JSX), then `products.map(`
@@hint <li\s+key=\{\s*p\.id\s*\}\s*>
Each item: `<li key={p.id}>`
@@hint \{\s*p\.name\s*\}\s*</li>\s*\)\s*\}
Then `{p.name}</li>`, close the map with `)` and the brace with `}`.
@@hint ^\s*</ul>\s*$
Line 3: `</ul>`
:::

## Derived data: do not store what you can calculate

```tsx
const [cart, setCart] = useState<CartItem[]>([]);
const totalPence = cart.reduce((sum, i) => sum + i.pricePence * i.qty, 0);   // calculated every render
```

Storing `total` in its own state would let it drift out of sync with `cart`. Calculate it instead.

## Effects: syncing with the outside world

`useEffect` runs code **after** render, for things outside React: fetching data, timers, subscriptions.

```tsx
import { useEffect, useState } from 'react';

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');

  useEffect(() => {
    let ignore = false;                       // avoid setting state after unmount
    fetch('/products.json')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { if (!ignore) { setProducts(data); setStatus('ready'); } })
      .catch(() => { if (!ignore) setStatus('error'); });
    return () => { ignore = true; };          // cleanup
  }, []);                                     // [] = run once, when first shown

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'error') return <p>Could not load products.</p>;
  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

The array at the end lists **dependencies**: the effect re-runs when any of them change. In real apps, use a data library like **TanStack Query** for fetching; it handles caching, retries and loading states for you.

:::pro Thinking in components
Before coding a page, sketch it and draw boxes around pieces: `Header`, `ProductGrid`, `ProductCard`, `CartDrawer`. Decide which component owns each piece of state: the closest common parent of everything that needs it. Then pass data down as props.
:::

## Quiz

? How should you add an item to a cart stored in React state?
- [ ] cart.push(item)
- [x] setCart([...cart, item])
- [ ] cart = [...cart, item]
> State must be replaced with a new value through its setter, or React will not re-render.

? Why does each item in a mapped list need a key?
- [ ] For CSS styling
- [x] So React can track which item is which between renders
- [ ] Keys make the list sorted
> Use a stable id. Array indexes break when items are reordered or removed.

? The cart total can be calculated from the cart items. Where should it live?
- [ ] In its own useState, updated whenever the cart changes
- [x] Calculated during render from the cart state
- [ ] In localStorage
> Derived data should be computed, not stored, so it can never go out of sync.

? What does the empty array in useEffect(() => {...}, []) mean?
- [x] Run the effect once, after the component first renders
- [ ] Run the effect on every render
- [ ] Never run the effect
> The dependency array controls when the effect re-runs. Empty means no dependencies.
