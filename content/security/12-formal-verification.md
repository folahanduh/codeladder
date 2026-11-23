---
id: sec-formal-methods
title: Formal verification and advanced fuzzing
level: expert
minutes: 45
summary: Move from "tested" to "proven". Write properties, run symbolic execution with Halmos, and understand where formal methods, Echidna and Medusa fit in a serious security programme.
---

## Beyond example-based testing

A unit test checks one input. A fuzz test checks thousands of random inputs. **Formal verification** goes further: it checks a property for **every possible input**, by reasoning about the code mathematically. When it says a property holds, it holds, within the model and assumptions you gave it. When it fails, it hands you a concrete counterexample.

| Technique | Explores | Finds | Cost |
|---|---|---|---|
| Unit tests | Inputs you chose | Bugs you imagined | Low |
| Fuzzing (Foundry, Echidna, Medusa) | Many random inputs and call sequences | Edge cases you did not imagine | Low to medium |
| Symbolic execution (Halmos, hevm, Kontrol) | All inputs, up to a bound | Counterexamples, or proof within the bound | Medium |
| Formal verification (Certora Prover and others) | All inputs and states, via specifications | Proofs of rules, or violations | High; needs specialist skill |

## Properties are everything

Every one of these tools needs you to state **what must be true**. Good properties come in a few shapes:

- **Valid states**: `totalSupply == sum of all balances`; `debt <= collateral * maxLTV`.
- **State transitions**: only the owner can change `fee`; `paused` can only become false through `unpause`.
- **Variable relationships**: shares and assets in a vault move in the same direction.
- **High-level**: no user can withdraw more than they deposited plus earned interest.
- **No unexpected reverts**: a user with enough balance can always withdraw.

Writing these is the real skill. It forces you to know exactly what the protocol promises, and it is where many bugs are found before any tool even runs.

## Symbolic testing with Halmos

**Halmos** (install with `uv tool install halmos`) runs your existing Foundry test setup, but treats the inputs of `check_` functions as **symbolic**: it explores every possible value at once.

```solidity
// test/Token.symbolic.t.sol
function check_transferPreservesSupply(address to, uint256 amount) public {
    uint256 supplyBefore = token.totalSupply();
    vm.prank(owner);
    token.transfer(to, amount);           // reverting paths are simply not counted
    assert(token.totalSupply() == supplyBefore);
}
```

Run it with:

```bash
halmos
```

If any `to` and `amount` could break the assertion, Halmos prints the exact values. If not, the property holds for every input within its bounds (for example, loop bounds you configure).

:::exercise Write a symbolic property
@@file Token.symbolic.t.sol
@@prompt
Write a Halmos property that no user's balance can ever exceed the total supply. Three lines:

1. `function check_balanceNeverExceedsSupply(address user) public view {`
2. `assert(token.balanceOf(user) <= token.totalSupply());`
3. `}`
@@solution
function check_balanceNeverExceedsSupply(address user) public view {
    assert(token.balanceOf(user) <= token.totalSupply());
}
@@hint function\s+check_balanceNeverExceedsSupply\s*\(\s*address\s+user\s*\)
Line 1 starts `function check_balanceNeverExceedsSupply(address user)`. Halmos runs functions whose names start with `check_`.
@@hint \)\s*public\s+view\s*\{
then `public view {` (it only reads state).
@@hint assert\(\s*token\.balanceOf\(\s*user\s*\)\s*<=\s*token\.totalSupply\(\s*\)\s*\)\s*;
Line 2: `assert(token.balanceOf(user) <= token.totalSupply());` (use `assert`, not `assertEq`).
@@explain
Because `user` is symbolic, this one function checks every possible address at once. Properties like this are cheap to write and catch whole classes of accounting bugs.
:::

## Stateful fuzzing: Echidna and Medusa

Foundry's invariant testing (from the [auditing lesson](#lesson-crypto-testing)) has two specialist relatives:

- **Echidna** (Trail of Bits): mature, property-based fuzzer for Solidity, with powerful corpus and coverage features.
- **Medusa**: a newer, parallel fuzzer in the same family, built for speed on multi-core machines.

Expert teams often run the same properties through several engines, because each explores differently.

## Know the limits

- Proofs only cover the properties you wrote. A perfectly proven wrong specification proves nothing useful.
- Tools model the EVM; they may not model other contracts, oracles or economic behaviour.
- Bounds matter: "no counterexample up to 3 loop iterations" is not the same as "never".
- Formal work complements audits, fuzzing and monitoring; it does not replace them.

## Quiz

? What does a symbolic execution tool like Halmos do with function inputs?
- [ ] Picks random values
- [x] Treats them as symbols representing every possible value, and searches for any that break the property
- [ ] Uses only zero
> That is why it can return a counterexample or show none exists within its bounds.

? Formal verification proves a property. What can still go wrong?
- [x] The property itself may be incomplete or wrong, or the model may miss real-world behaviour
- [ ] Nothing; proven code is perfectly safe
- [ ] The proof might change after deployment
> A proof is only as good as the specification and assumptions.

? Which is a valid-state invariant?
- [ ] Only the owner can call setFee
- [x] totalSupply equals the sum of all balances
- [ ] The contract compiles
> Valid-state properties must hold in every reachable state.
