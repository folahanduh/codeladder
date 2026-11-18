---
id: web-testing
title: Testing that gives you confidence
level: advanced
minutes: 30
summary: Unit, component and end-to-end tests with Vitest, Testing Library and Playwright, and what is worth testing.
---

## Why test

Tests let you change code without fear. Without them, every change risks breaking something you will only hear about from an angry customer. With them, you refactor freely and ship faster. Senior developers write tests not because they are told to, but because it saves them time.

## The testing pyramid

| Type | Tests | Speed | How many |
|---|---|---|---|
| **Unit** | One function in isolation | Milliseconds | Many |
| **Component / integration** | Several pieces together (a component with its logic) | Fast | Some |
| **End-to-end (E2E)** | The real app in a real browser, like a user | Seconds | A few, for critical journeys |

## Unit tests with Vitest

```bash
npm install -D vitest
```

```ts
// src/lib/cart.ts
export type Item = { pricePence: number; qty: number };

export function cartTotal(items: Item[], discountPercent = 0): number {
  const subtotal = items.reduce((sum, i) => sum + i.pricePence * i.qty, 0);
  return Math.round(subtotal * (1 - discountPercent / 100));
}
```

```ts
// src/lib/cart.test.ts
import { describe, it, expect } from 'vitest';
import { cartTotal } from './cart';

describe('cartTotal', () => {
  it('adds up price times quantity', () => {
    expect(cartTotal([{ pricePence: 2000, qty: 2 }, { pricePence: 1500, qty: 1 }])).toBe(5500);
  });

  it('returns 0 for an empty cart', () => {
    expect(cartTotal([])).toBe(0);
  });

  it('applies a percentage discount and rounds to the penny', () => {
    expect(cartTotal([{ pricePence: 999, qty: 1 }], 10)).toBe(899);
  });
});
```

```bash
npx vitest          # watch mode: re-runs on every save
```

Each test follows **Arrange, Act, Assert**: set up the data, run the code, check the result.

## Component tests with Testing Library

Test what the user sees and does, not implementation details:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

it('increases the quantity when + is clicked', async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole('button', { name: '+' }));
  expect(screen.getByText('2')).toBeInTheDocument();
});
```

Querying by **role** and **accessible name** (`getByRole('button', { name: '+' })`) also proves your UI is accessible.

## End-to-end tests with Playwright

```bash
npm init playwright@latest
```

```ts
// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('a shopper can add a dress to the bag', async ({ page }) => {
  await page.goto('/products/linen-wrap-dress');
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await page.getByRole('link', { name: /bag/i }).click();
  await expect(page.getByText('Linen Wrap Dress')).toBeVisible();
});
```

```bash
npx playwright test
npx playwright test --ui     # watch it click through, step by step
```

## What is worth testing

- **Money, maths and dates**: totals, discounts, tax, time zones. Bugs here cost real money.
- **Business rules**: who can do what, stock limits, order states.
- **Edge cases**: empty, zero, negative, huge, missing, duplicated.
- **Every bug you fix**: write a test that fails because of the bug, then fix it. It can never come back silently.
- **Critical journeys** end to end: sign up, log in, checkout.

Skip testing that a framework works (that React renders a div). Do not chase 100% coverage; chase confidence in the parts that matter.

:::tip Test-driven development, lightly
For tricky logic, write the test first. It forces you to decide exactly what the function should do before you get lost in how. Watch it fail, make it pass, then tidy the code with the test as a safety net.
:::

## Quiz

? Which kind of test should you have the most of?
- [x] Unit tests: fast and focused
- [ ] End-to-end tests
- [ ] Manual tests
> Unit tests are cheap and fast. E2E tests are valuable but slow, so keep a few for critical paths.

? You fix a bug where discounts rounded the wrong way. What should you also do?
- [ ] Nothing more, it is fixed
- [x] Add a test that reproduces the bug, so it can never return unnoticed
- [ ] Delete the old tests
> Regression tests lock in every fix.

? Why query elements by role and name in component tests?
- [ ] It is faster
- [x] It tests what users experience and checks accessibility at the same time
- [ ] CSS classes are not allowed in tests
> If a screen reader cannot find the button by role and name, neither can your test.
