---
id: crypto-standards
title: "Token standards: ERC-20, 721, 1155 and friends"
level: intermediate
minutes: 25
summary: Fungible tokens, NFTs, multi-tokens, vaults and signed approvals, and the risks in each.
---

## Why standards matter

A standard (an **ERC**, Ethereum Request for Comments) is an agreed interface. Because every ERC-20 token has `transfer` and `balanceOf`, any wallet or exchange supports any token without custom code. Use standards, and use OpenZeppelin's implementations of them.

## The ones you will meet

| Standard | What it is | Examples |
|---|---|---|
| **ERC-20** | Fungible tokens: every unit is identical | Stablecoins, governance tokens |
| **ERC-721** | Non-fungible tokens (NFTs): each token ID is unique | Art, tickets, memberships, domain names |
| **ERC-1155** | Many token types in one contract, fungible or not | Game items, editions, event passes |
| **ERC-4626** | Tokenised vaults: deposit an asset, receive shares | Yield vaults, staking wrappers |
| **EIP-2612** | `permit`: approve with a signature instead of a transaction | Gasless approvals |
| **EIP-712** | A standard for signing structured data readably | Orders, permits, off-chain votes |
| **ERC-4337** | Account abstraction: smart contract wallets with sponsored gas, batching and recovery | Modern wallets |

## NFTs (ERC-721) in brief

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StudioPass is ERC721, Ownable {
    uint256 private _nextId = 1;

    constructor(address initialOwner) ERC721("Studio Pass", "PASS") Ownable(initialOwner) {}

    function mint(address to) external onlyOwner returns (uint256 id) {
        id = _nextId++;
        _safeMint(to, id);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://YOUR_METADATA_FOLDER_CID/";
    }
}
```

Each token's `tokenURI` points to **metadata** JSON (name, description, image). The image is usually on IPFS or Arweave, not on-chain, because storage on-chain is very expensive. If metadata lives on a normal web server, the NFT's appearance depends on that server staying up.

:::exercise Mint an NFT
@@file StudioPass.sol
@@prompt
Write the `mint` function: `external onlyOwner`, takes `address to`, `returns (uint256 id)`, sets `id = _nextId++;` and calls `_safeMint(to, id);`.
@@solution
function mint(address to) external onlyOwner returns (uint256 id) {
    id = _nextId++;
    _safeMint(to, id);
}
@@hint function\s+mint\s*\(\s*address\s+to\s*\)
Line 1 starts `function mint(address to)`
@@hint external\s+onlyOwner\s+returns\s*\(\s*uint256\s+id\s*\)\s*\{
then `external onlyOwner returns (uint256 id) {`
@@hint id\s*=\s*_nextId\+\+\s*;
Line 2: `id = _nextId++;` (use the current value, then add one).
@@hint _safeMint\(\s*to\s*,\s*id\s*\)\s*;
Line 3: `_safeMint(to, id);`
:::

## Approvals: powerful and dangerous

ERC-20's `approve` lets a contract spend your tokens. Many apps ask for an **unlimited** approval so you never have to approve again. Convenient, but if that contract is later exploited, or was malicious from the start, it can drain every approved token.

- As a user: approve only what you need, and revoke old approvals regularly (revoke.cash, or your wallet's approval manager).
- As a builder: request exact amounts where practical, and support `permit` signatures.

:::warn Signatures can move money too
"Just sign this message, it is free" can be a `permit` signature that approves a transfer of your tokens. EIP-712 makes signatures readable in wallets: read them. Scam sites rely on people signing without reading.
:::

:::exercise Approve exactly what you need
@@file Approve.sol
@@prompt
Two Solidity lines: approve `address(dex)` to spend `100 ether` of `token`, then read the remaining allowance from `address(this)` to `address(dex)` into a `uint256 left`.
@@solution
token.approve(address(dex), 100 ether);
uint256 left = token.allowance(address(this), address(dex));
@@hint token\.approve\(\s*address\(\s*dex\s*\)\s*,\s*100\s+ether\s*\)\s*;
Line 1: `token.approve(address(dex), 100 ether);`
@@hint uint256\s+left\s*=\s*token\.allowance\(
Line 2 starts `uint256 left = token.allowance(`
@@hint allowance\(\s*address\(\s*this\s*\)\s*,\s*address\(\s*dex\s*\)\s*\)\s*;
Arguments: owner first, then spender: `address(this), address(dex)`
:::

## ERC-4626 vaults

A vault takes deposits of one asset (say USDC) and mints **shares**. As the vault earns yield, each share is worth more of the asset. A standard interface (`deposit`, `withdraw`, `convertToAssets`) means any app can integrate any vault. The classic bug: rounding and "inflation attacks" on nearly empty vaults. OpenZeppelin's implementation includes protections; read its docs before building one.

## Quiz

? Which standard fits 500 identical concert tickets plus 20 unique backstage passes in one contract?
- [ ] ERC-20
- [ ] ERC-721
- [x] ERC-1155
> ERC-1155 handles many token types, fungible and non-fungible, in a single contract.

? Why is an unlimited token approval risky?
- [x] If the approved contract is malicious or hacked, it can take all of that token from your wallet
- [ ] It costs more gas every time
- [ ] It expires after one day
> Approvals persist until revoked. Approve only what you need.

? Where is an NFT's image usually stored?
- [ ] Inside the token contract's storage
- [x] Off-chain (often IPFS or Arweave), referenced by the token's metadata URI
- [ ] In the buyer's wallet app
> On-chain storage is expensive, so contracts store a pointer to metadata.
