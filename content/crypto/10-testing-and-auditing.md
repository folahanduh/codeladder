---
id: crypto-testing
title: Fuzzing, invariants and auditing tools
level: advanced
minutes: 40
summary: Go beyond unit tests with fuzz, invariant and fork tests in Foundry, then use Slither and an audit mindset.
---

## The testing ladder for contracts

| Level | Question it answers | Foundry feature |
|---|---|---|
| Unit | Does this function do what I intended for these inputs? | `test_...` functions |
| Fuzz | Does it hold for thousands of random inputs? | Test functions with parameters |
| Invariant | Do core truths hold after any sequence of calls? | `invariant_...` functions |
| Fork | Does it work against real deployed protocols? | `--fork-url` |
| Static analysis | Are there known bug patterns? | Slither, Aderyn |
| Formal verification | Can we prove it for all inputs? | Halmos, Certora, Kontrol |

## Fuzz testing

Any test function with parameters is fuzzed: Foundry calls it with many random values, and shrinks any failure to a minimal example.

```solidity
function testFuzz_WithdrawNeverExceedsDeposit(uint96 deposit, uint96 withdrawAmount) public {
    vm.assume(deposit > 0);                       // skip inputs you do not care about
    withdrawAmount = uint96(bound(withdrawAmount, 0, deposit)); // keep values in a valid range
    vm.deal(alice, deposit);

    vm.startPrank(alice);
    vault.deposit{value: deposit}();
    vault.withdraw(withdrawAmount);
    vm.stopPrank();

    assertEq(vault.balanceOf(alice), deposit - withdrawAmount);
    assertEq(address(vault).balance, deposit - withdrawAmount);
}
```

Prefer `bound` over `vm.assume` when possible: `assume` throws inputs away, `bound` maps them into range.

## Invariant testing

An **invariant** is something that must always be true, whatever anyone does. For example:

- The sum of all user balances equals the contract's ETH balance.
- Total token supply never exceeds the cap.
- A vault's share price never decreases (absent losses).

Foundry calls random sequences of functions on a **handler** contract, then checks your invariants after each call.

```solidity
// test/invariant/VaultInvariants.t.sol
contract Handler is Test {
    Vault vault;
    address[] public actors;
    uint256 public ghostDeposited;      // "ghost variables" track what the totals should be
    uint256 public ghostWithdrawn;

    constructor(Vault _vault) {
        vault = _vault;
        actors.push(makeAddr("a"));
        actors.push(makeAddr("b"));
    }

    function deposit(uint256 actorSeed, uint96 amount) external {
        address actor = actors[actorSeed % actors.length];
        amount = uint96(bound(amount, 1, 100 ether));
        vm.deal(actor, amount);
        vm.prank(actor);
        vault.deposit{value: amount}();
        ghostDeposited += amount;
    }

    function withdraw(uint256 actorSeed, uint96 amount) external {
        address actor = actors[actorSeed % actors.length];
        amount = uint96(bound(amount, 0, vault.balanceOf(actor)));
        vm.prank(actor);
        vault.withdraw(amount);
        ghostWithdrawn += amount;
    }
}

contract VaultInvariants is Test {
    Vault vault;
    Handler handler;

    function setUp() public {
        vault = new Vault();
        handler = new Handler(vault);
        targetContract(address(handler));    // only call the handler's functions
    }

    function invariant_SolventAtAllTimes() public view {
        assertEq(address(vault).balance, handler.ghostDeposited() - handler.ghostWithdrawn());
    }
}
```

Invariant tests find the bugs nobody thought to write a unit test for: strange orderings, repeated calls, rounding drift.

## Fork testing

Test against real mainnet state (real USDC, real Uniswap pools) on a local copy:

```bash
forge test --fork-url $MAINNET_RPC_URL --match-contract ForkTest -vvv
```

## Coverage and gas

```bash
forge coverage            # which lines and branches your tests hit
forge test --gas-report   # gas per function
forge snapshot            # save gas usage; compare after optimising
```

## Static analysis

```bash
uv tool install slither-analyzer
slither .
```

Slither flags reentrancy, unprotected functions, shadowing, dangerous calls and dozens more patterns in seconds. Treat each finding as a question: fix it, or write down why it is safe. Aderyn is another fast analyser worth running.

## How auditors think

1. **Understand intent first.** Read the docs and specs. What must never happen?
2. **List the actors and their powers.** Users, admins, keepers, oracles, other contracts.
3. **Follow the money.** Every path where value enters or leaves.
4. **Question every assumption.** What if this token charges fees? What if the oracle is stale? What if this is called twice, in the same block, with zero, with the maximum?
5. **Write a proof-of-concept test** for every suspected bug. If you cannot exploit it in a test, keep digging or move on.

:::tip Your security learning path
Ethernaut, then Damn Vulnerable DeFi, then read real audit reports, then join a competitive audit as a learner. Cyfrin Updraft's free security course covers this whole path.
:::

## Quiz

? What is the advantage of bound() over vm.assume() in fuzz tests?
- [x] bound maps inputs into range instead of discarding them, so fewer runs are wasted
- [ ] bound makes tests deterministic
- [ ] assume does not work with uint256
> Too many assume rejections can make a fuzz run fail to find enough valid inputs.

? Which is a good invariant for a simple ETH vault?
- [ ] Every deposit is exactly 1 ETH
- [x] The contract's ETH balance equals total deposits minus total withdrawals
- [ ] Users can only withdraw once
> Invariants are truths that must hold after any sequence of actions.

? What does a fork test let you do?
- [ ] Deploy to mainnet for free
- [x] Run tests against a local copy of real chain state, including real deployed protocols
- [ ] Split a contract into two
> Forks let you integrate with real tokens and pools safely.

? Slither reports a possible reentrancy. What is the professional response?
- [ ] Ignore it: static tools have false positives
- [x] Investigate; fix it or document exactly why it is safe, ideally with a test
- [ ] Delete the function
> Every finding gets an explicit decision.
