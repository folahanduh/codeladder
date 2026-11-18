---
id: crypto-solidity
title: Solidity basics
level: intermediate
minutes: 35
summary: Write, compile and test your first smart contract with Foundry. Types, functions, errors, events and modifiers.
---

## What a smart contract is

A smart contract is a program deployed to a blockchain. Once deployed, its code cannot be changed, it runs exactly as written for anyone who calls it, and its data (state) is public. Every write costs gas, so contracts are small and careful.

**Solidity** is the main language for Ethereum and every EVM chain (Arbitrum, Base, Polygon and many more).

## Set up a Foundry project

```bash
forge init tip-jar
cd tip-jar
forge build
forge test
```

You get `src/` (contracts), `test/` (tests, also written in Solidity), `script/` (deployment scripts) and `foundry.toml` (config). For quick experiments with no install, remix.ethereum.org runs in the browser.

## Your first contract: a tip jar

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title A tip jar that only its owner can empty
contract TipJar {
    // ---- state (stored on-chain, costs gas to write) ----
    address public immutable owner;      // set once in the constructor
    uint256 public totalTips;
    mapping(address => uint256) public tipsFrom;

    // ---- events (cheap logs that apps can listen to) ----
    event Tipped(address indexed from, uint256 amount, string message);
    event Withdrawn(uint256 amount);

    // ---- custom errors (cheaper and clearer than strings) ----
    error NotOwner();
    error NoTipSent();
    error TransferFailed();

    constructor() {
        owner = msg.sender;              // whoever deploys is the owner
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;                               // run the rest of the function here
    }

    function tip(string calldata message) external payable {
        if (msg.value == 0) revert NoTipSent();
        tipsFrom[msg.sender] += msg.value;
        totalTips += msg.value;
        emit Tipped(msg.sender, msg.value, message);
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        emit Withdrawn(amount);
        (bool ok, ) = owner.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
```

:::exercise Write the tip function
@@file TipJar.sol
@@prompt
From memory if you can, write the `tip` function: it is `external payable`, takes `string calldata message`, reverts with `NoTipSent()` if no ETH was sent, adds `msg.value` to `tipsFrom[msg.sender]`, and emits `Tipped(msg.sender, msg.value, message)`.
@@solution
function tip(string calldata message) external payable {
    if (msg.value == 0) revert NoTipSent();
    tipsFrom[msg.sender] += msg.value;
    emit Tipped(msg.sender, msg.value, message);
}
@@hint function\s+tip\s*\(\s*string\s+calldata\s+message\s*\)
Line 1 starts `function tip(string calldata message)`
@@hint \)\s*external\s+payable\s*\{
then `external payable {`. Without `payable` the function cannot receive ETH.
@@hint if\s*\(\s*msg\.value\s*==\s*0\s*\)\s*revert\s+NoTipSent\(\s*\)\s*;
Line 2: `if (msg.value == 0) revert NoTipSent();`
@@hint tipsFrom\[\s*msg\.sender\s*\]\s*\+=\s*msg\.value\s*;
Line 3: `tipsFrom[msg.sender] += msg.value;`
@@hint emit\s+Tipped\(\s*msg\.sender\s*,\s*msg\.value\s*,\s*message\s*\)\s*;
Line 4: `emit Tipped(msg.sender, msg.value, message);`
:::

## The pieces, explained

- `pragma solidity ^0.8.24;` pins the compiler version. Since 0.8, arithmetic overflow reverts automatically.
- **Types**: `uint256` (whole numbers from 0 to 2^256 - 1; there are no decimals), `int256`, `address`, `bool`, `bytes32`, `string`, arrays and `struct`s.
- `mapping(address => uint256)` is a key-value lookup table. Every possible key exists and defaults to 0; you cannot loop over a mapping.
- **Visibility**: `public` (anyone, and auto-creates a getter for variables), `external` (only from outside), `internal` (this contract and children), `private` (this contract only). Note: private data is still **readable by anyone** on-chain. Nothing on a public chain is secret.
- **State mutability**: `view` reads state, `pure` reads nothing, `payable` can receive ETH. View and pure calls are free when called from outside.
- **Globals**: `msg.sender` (who called), `msg.value` (ETH sent, in wei), `block.timestamp` (current block time).
- **Errors**: `revert` undoes everything the transaction did. `require(condition, "message")` also works; custom errors are cheaper.
- **Events**: logs that front ends and indexers read. Indexed parameters can be filtered.
- **Data locations**: `storage` (permanent, expensive), `memory` (temporary), `calldata` (read-only input, cheapest).

:::exercise Write a modifier
@@file TipJar.sol
@@prompt
Write the `onlyOwner` modifier: if `msg.sender` is not `owner`, revert with `NotOwner()`; otherwise continue with `_;`.
@@solution
modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
}
@@hint ^\s*modifier\s+onlyOwner\s*\(\s*\)\s*\{
Line 1: `modifier onlyOwner() {`
@@hint if\s*\(\s*msg\.sender\s*!=\s*owner\s*\)\s*revert\s+NotOwner\(\s*\)\s*;
Line 2: `if (msg.sender != owner) revert NotOwner();`
@@hint ^\s*_\s*;\s*$
Line 3 is just an underscore and a semicolon: `_;` It means "now run the function".
:::

## Test it

```solidity
// test/TipJar.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TipJar} from "../src/TipJar.sol";

contract TipJarTest is Test {
    TipJar jar;
    address alice = makeAddr("alice");

    function setUp() public {
        jar = new TipJar();               // this test contract is the owner
        vm.deal(alice, 10 ether);         // give alice some test ETH
    }

    receive() external payable {}         // let this test contract receive ETH on withdraw

    function test_TipIsRecorded() public {
        vm.prank(alice);                  // next call comes from alice
        jar.tip{value: 1 ether}("great work");
        assertEq(jar.totalTips(), 1 ether);
        assertEq(jar.tipsFrom(alice), 1 ether);
    }

    function test_RevertWhen_TipIsZero() public {
        vm.expectRevert(TipJar.NoTipSent.selector);
        jar.tip("free");
    }

    function test_RevertWhen_NonOwnerWithdraws() public {
        vm.prank(alice);
        vm.expectRevert(TipJar.NotOwner.selector);
        jar.withdraw();
    }

    function test_OwnerCanWithdraw() public {
        vm.prank(alice);
        jar.tip{value: 2 ether}("");
        uint256 before = address(this).balance;
        jar.withdraw();
        assertEq(address(this).balance, before + 2 ether);
    }
}
```

```bash
forge test -vv
```

`vm.prank`, `vm.deal` and `vm.expectRevert` are Foundry **cheatcodes** that let tests act as any address, set balances and assert failures.

:::tip Make the compiler your teacher
Run `forge build` often and read the warnings, not just the errors. Install the Solidity extension in VS Code for inline errors. When something confuses you, `chisel` (installed with Foundry) is a Solidity REPL where you can try expressions instantly.
:::

:::exercise Write a Foundry test
@@file TipJar.t.sol
@@prompt
Write `test_TipIsRecorded`: as `alice` (`vm.prank`), tip 1 ether with the message `"great work"`, then assert `jar.totalTips()` equals `1 ether`.
@@solution
function test_TipIsRecorded() public {
    vm.prank(alice);
    jar.tip{value: 1 ether}("great work");
    assertEq(jar.totalTips(), 1 ether);
}
@@hint function\s+test_TipIsRecorded\s*\(\s*\)\s*public\s*\{
Line 1: `function test_TipIsRecorded() public {`
@@hint vm\.prank\(\s*alice\s*\)\s*;
Line 2: `vm.prank(alice);`
@@hint jar\.tip\{\s*value\s*:\s*1\s+ether\s*\}\(\s*["']great work["']\s*\)\s*;
Line 3 sends ETH with curly braces before the arguments: `jar.tip{value: 1 ether}("great work");`
@@hint assertEq\(\s*jar\.totalTips\(\s*\)\s*,\s*1\s+ether\s*\)\s*;
Line 4: `assertEq(jar.totalTips(), 1 ether);`
:::

## Quiz

? Your contract stores a password in a private variable. Who can read it?
- [ ] Only the contract owner
- [ ] Nobody
- [x] Anyone, by reading the contract's storage on-chain
> private only stops other contracts reading it through code. All on-chain data is public.

? What does msg.value hold?
- [x] The amount of ETH (in wei) sent with the call
- [ ] The caller's balance
- [ ] The gas price
> msg.value is only non-zero for payable functions that were sent ETH.

? What happens when a function hits revert?
- [ ] Only the rest of that function is skipped
- [x] Every state change in the whole transaction is undone
- [ ] The contract is deleted
> Reverts are all-or-nothing, though the sender still pays for gas used.

? What does vm.prank(alice) do in a Foundry test?
- [ ] Gives alice ETH
- [x] Makes the next call appear to come from alice
- [ ] Deploys a contract as alice
> Cheatcodes let tests impersonate any address. vm.deal sets balances.
