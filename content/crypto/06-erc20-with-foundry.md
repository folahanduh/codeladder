---
id: crypto-erc20
title: Build and deploy an ERC-20 token
level: intermediate
minutes: 45
summary: Create a token with OpenZeppelin, test it with Foundry, deploy it to Sepolia with an encrypted key and verify it on Etherscan.
---

## The ERC-20 standard

ERC-20 is the interface every fungible token on Ethereum implements, so wallets, exchanges and other contracts can work with any token the same way:

| Function | Does |
|---|---|
| `totalSupply()` | Total tokens in existence |
| `balanceOf(account)` | Tokens held by an account |
| `transfer(to, amount)` | Send your tokens |
| `approve(spender, amount)` | Allow another address (like a DEX) to spend up to `amount` of yours |
| `allowance(owner, spender)` | How much a spender may still spend |
| `transferFrom(from, to, amount)` | A spender moves tokens it was approved for |

Plus `Transfer` and `Approval` events, and `name`, `symbol` and `decimals` (almost always 18).

**Decimals** work like pence: balances are whole numbers. With 18 decimals, "1 token" is stored as `1 * 10**18`. Displaying it as 1.0 is the front end's job.

## Create the project

```bash
forge init ladder-token
cd ladder-token
forge install OpenZeppelin/openzeppelin-contracts
echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' > remappings.txt
```

:::exercise Create the project
@@file Terminal
@@lang bash
@@prompt
Three commands: create a Foundry project called `ladder-token`, move into it, and install the OpenZeppelin contracts library.
@@solution
forge init ladder-token
cd ladder-token
forge install OpenZeppelin/openzeppelin-contracts
@@hint ^\s*forge\s+init\s+ladder-token\s*$
Line 1: `forge init ladder-token`
@@hint ^\s*cd\s+ladder-token\s*$
Line 2: `cd ladder-token`
@@hint ^\s*forge\s+install\s+OpenZeppelin/openzeppelin-contracts\s*$
Line 3: `forge install OpenZeppelin/openzeppelin-contracts` (GitHub owner/repo).
:::

## The contract

Never write ERC-20 logic from scratch for real use. Inherit OpenZeppelin's audited implementation and add only your rules:

```solidity
// src/LadderToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LadderToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;   // 1 billion tokens (ether = 10**18)

    error MaxSupplyExceeded();

    constructor(address initialOwner) ERC20("Ladder", "LDR") Ownable(initialOwner) {
        _mint(initialOwner, 100_000_000 ether);   // 10% minted at launch
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();
        _mint(to, amount);
    }
}
```

:::exercise Write the token contract
@@file LadderToken.sol
@@prompt
Write the core of the token (imports and pragma omitted): a contract `LadderToken` that inherits `ERC20` and `Ownable`, with a constructor taking `address initialOwner` that sets the name `"Ladder"`, symbol `"LDR"`, owner `initialOwner`, and mints `100_000_000 ether` to `initialOwner`.
@@solution
contract LadderToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Ladder", "LDR") Ownable(initialOwner) {
        _mint(initialOwner, 100_000_000 ether);
    }
}
@@hint ^\s*contract\s+LadderToken\s+is\s+ERC20\s*,\s*Ownable\s*\{
Line 1: `contract LadderToken is ERC20, Ownable {`
@@hint constructor\(\s*address\s+initialOwner\s*\)
Line 2 starts `constructor(address initialOwner)`
@@hint ERC20\(\s*["']Ladder["']\s*,\s*["']LDR["']\s*\)\s*Ownable\(\s*initialOwner\s*\)\s*\{
then call both parent constructors: `ERC20("Ladder", "LDR") Ownable(initialOwner) {`
@@hint _mint\(\s*initialOwner\s*,\s*100_000_000\s+ether\s*\)\s*;
Line 3: `_mint(initialOwner, 100_000_000 ether);`
@@hint \}\s*\n\s*\}\s*$
Close the constructor and the contract: two `}`.
:::

## Test it

```solidity
// test/LadderToken.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LadderToken} from "../src/LadderToken.sol";

contract LadderTokenTest is Test {
    LadderToken token;
    address owner = makeAddr("owner");
    address alice = makeAddr("alice");

    function setUp() public {
        token = new LadderToken(owner);
    }

    function test_InitialSupplyGoesToOwner() public view {
        assertEq(token.balanceOf(owner), 100_000_000 ether);
        assertEq(token.decimals(), 18);
    }

    function test_Transfer() public {
        vm.prank(owner);
        token.transfer(alice, 50 ether);
        assertEq(token.balanceOf(alice), 50 ether);
    }

    function test_RevertWhen_StrangerMints() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        token.mint(alice, 1 ether);
    }

    function test_RevertWhen_MintingPastMax() public {
        vm.prank(owner);
        vm.expectRevert(LadderToken.MaxSupplyExceeded.selector);
        token.mint(owner, 900_000_000 ether + 1);
    }

    function testFuzz_TransferNeverCreatesTokens(uint256 amount) public {
        amount = bound(amount, 0, token.balanceOf(owner));
        uint256 supplyBefore = token.totalSupply();
        vm.prank(owner);
        token.transfer(alice, amount);
        assertEq(token.totalSupply(), supplyBefore);
        assertEq(token.balanceOf(owner) + token.balanceOf(alice), supplyBefore);
    }
}
```

```bash
forge test -vv
forge test --gas-report
```

The last test is a **fuzz test**: Foundry runs it with hundreds of random amounts.

## Deploy to Sepolia

1. Create a **development wallet** and store it encrypted (you choose a password):

```bash
cast wallet new                       # prints a new address and private key (testnet use only)
cast wallet import dev --interactive  # paste that private key; it is saved encrypted as "dev"
cast wallet address --account dev
```

2. Get free Sepolia ETH from a faucet (search "Sepolia faucet"; Alchemy and Google Cloud run reliable ones).
3. Get an RPC URL (free Alchemy or Infura account) and an Etherscan API key. Put them in `.env` (and make sure `.env` is in `.gitignore`):

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-key
ETHERSCAN_API_KEY=your-etherscan-key
TOKEN_OWNER=0xYourDevAddress
```

4. Write a deploy script:

```solidity
// script/DeployLadder.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {LadderToken} from "../src/LadderToken.sol";

contract DeployLadder is Script {
    function run() external returns (LadderToken token) {
        address owner = vm.envAddress("TOKEN_OWNER");
        vm.startBroadcast();
        token = new LadderToken(owner);
        vm.stopBroadcast();
    }
}
```

5. Deploy and verify:

```bash
source .env
forge script script/DeployLadder.s.sol --rpc-url $SEPOLIA_RPC_URL --account dev --broadcast --verify
```

Find the contract address in the output, open it on sepolia.etherscan.io, and import the token into your wallet. You made a token.

:::warn Testnet first, real money much later
Deploying to mainnet costs real money and is permanent. Many tokens also raise legal questions (see the Tokenomics track's launch lesson). Use testnets until you have written tests, run Slither, and understand every line.
:::

:::exercise Deploy and verify
@@file Terminal
@@lang bash
@@prompt
Write the single command that runs `script/DeployLadder.s.sol` against `$SEPOLIA_RPC_URL`, signs with the keystore account `dev`, broadcasts the transaction, and verifies the contract. Flags in this order: `--rpc-url`, `--account`, `--broadcast`, `--verify`.
@@solution
forge script script/DeployLadder.s.sol --rpc-url $SEPOLIA_RPC_URL --account dev --broadcast --verify
@@hint ^\s*forge\s+script\s+script/DeployLadder\.s\.sol
Start with `forge script script/DeployLadder.s.sol`
@@hint --rpc-url\s+\$SEPOLIA_RPC_URL
then `--rpc-url $SEPOLIA_RPC_URL`
@@hint --account\s+dev
then `--account dev`
@@hint --broadcast\s+--verify\s*$
finish with `--broadcast --verify`
:::

## Quiz

? A token has 18 decimals. How is a balance of 2.5 tokens stored on-chain?
- [ ] 2.5
- [x] 2500000000000000000 (2.5 x 10^18)
- [ ] 25
> On-chain amounts are integers. The front end divides by 10^decimals for display.

? Why does a DEX ask you to approve before swapping your tokens?
- [x] So it can call transferFrom to move your tokens on your behalf, up to the approved amount
- [ ] To check your identity
- [ ] To pay gas for you
> approve plus transferFrom lets contracts pull tokens you authorised.

? Why inherit from OpenZeppelin's ERC20 instead of writing your own?
- [ ] It is required by Ethereum
- [x] It is audited and battle-tested, so subtle bugs are far less likely
- [ ] It uses less storage
> Reusing audited code is the single biggest security win in Solidity.

? What does `cast wallet import dev --interactive` do?
- [ ] Uploads your key to Etherscan
- [x] Stores a private key encrypted on your machine under the name "dev"
- [ ] Creates a new testnet
> Keystores avoid having raw private keys in .env files or shell history.
