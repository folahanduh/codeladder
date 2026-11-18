---
id: crypto-dapp
title: Talking to the chain from JavaScript
level: intermediate
minutes: 35
summary: Read contract data with viem, connect wallets with wagmi and RainbowKit, send transactions and handle every state.
---

## How a dApp is wired

```text
Your React app  --reads-->   RPC provider (Alchemy, Infura, public node)  -->  blockchain
       |
       +--writes--> user's wallet (MetaMask, Rabby...) --signs and sends-->  blockchain
```

- **Reading** (balances, prices, contract state) is free and needs no wallet. You call an RPC endpoint.
- **Writing** (transfers, mints, swaps) changes state, costs gas, and must be signed by the user's wallet. Your app never sees their private key.

## Reading with viem

```ts
// npm install viem
import { createPublicClient, http, erc20Abi, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({ chain: sepolia, transport: http(import.meta.env.VITE_SEPOLIA_RPC_URL) });

const token = '0xYourTokenAddress';
const holder = '0xSomeHolderAddress';

const [symbol, decimals, raw] = await Promise.all([
  client.readContract({ address: token, abi: erc20Abi, functionName: 'symbol' }),
  client.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' }),
  client.readContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: [holder] }),
]);

console.log(`${formatUnits(raw, decimals)} ${symbol}`);   // e.g. "50 LDR"
console.log('Latest block:', await client.getBlockNumber());
```

- An **ABI** (Application Binary Interface) is the JSON description of a contract's functions. Foundry writes it to `out/YourContract.sol/YourContract.json`. viem ships `erc20Abi` for standard tokens.
- Balances come back as `bigint`. Use `formatUnits` to display and `parseUnits('2.5', 18)` to convert user input. Never use floating-point numbers for token amounts.

:::tip RPC URLs in front-end code
An RPC key in front-end code is visible to everyone. Providers expect this: restrict the key to your domain in their dashboard. Never put a **private key** anywhere near front-end code.
:::

:::exercise Read a token balance with viem
@@file balance.ts
@@prompt
Using `client`, `token`, `holder`, `erc20Abi` and `formatUnits` from the example above, read `balanceOf(holder)` and print it with 18 decimals. Write it over several lines, one property per line, exactly like this shape:

```ts
const balance = await client.readContract({
  address: token,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [holder],
});
console.log(formatUnits(balance, 18));
```
@@solution
const balance = await client.readContract({
  address: token,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [holder],
});
console.log(formatUnits(balance, 18));
@@hint const\s+balance\s*=\s*await\s+client\.readContract\(\s*\{
Line 1: `const balance = await client.readContract({`
@@hint address\s*:\s*token\s*,
`address: token,`
@@hint abi\s*:\s*erc20Abi\s*,
`abi: erc20Abi,`
@@hint functionName\s*:\s*['"]balanceOf['"]\s*,
`functionName: 'balanceOf',`
@@hint args\s*:\s*\[\s*holder\s*\]\s*,
`args: [holder],` (arguments always go in an array).
@@hint formatUnits\(\s*balance\s*,\s*18\s*\)
Last line: `console.log(formatUnits(balance, 18));`
:::

## Connecting wallets with wagmi and RainbowKit

wagmi gives React hooks for accounts, reads and writes; RainbowKit adds a polished "Connect wallet" button and modal.

```bash
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```tsx
// main.tsx
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'Ladder dApp',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',   // free from WalletConnect / Reown dashboard
  chains: [sepolia],
});
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Reading and writing with hooks

```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi, formatUnits, parseUnits } from 'viem';

const TOKEN = '0xYourTokenAddress' as const;

export function TokenPanel() {
  const { address, isConnected } = useAccount();

  const { data: balance, refetch } = useReadContract({
    address: TOKEN, abi: erc20Abi, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const send = () =>
    writeContract({ address: TOKEN, abi: erc20Abi, functionName: 'transfer', args: ['0xFriendAddress', parseUnits('1', 18)] });

  return (
    <section>
      <ConnectButton />
      {isConnected && <p>Balance: {balance !== undefined ? formatUnits(balance, 18) : '...'} LDR</p>}
      <button onClick={send} disabled={!isConnected || isPending || confirming}>
        {isPending ? 'Confirm in your wallet...' : confirming ? 'Waiting for the block...' : 'Send 1 LDR'}
      </button>
      {hash && <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">View transaction</a>}
      {isSuccess && <p>Sent. <button onClick={() => refetch()}>Refresh balance</button></p>}
      {error && <p role="alert">{error.message.split('\n')[0]}</p>}
    </section>
  );
}
```

:::exercise Send a transfer from React
@@file TokenPanel.tsx
@@lang ts
@@prompt
Write the single `writeContract` call that transfers 1 token (18 decimals) to `to`: address `TOKEN`, abi `erc20Abi`, functionName `'transfer'`, args `[to, parseUnits('1', 18)]`. All on one line.
@@solution
writeContract({ address: TOKEN, abi: erc20Abi, functionName: 'transfer', args: [to, parseUnits('1', 18)] });
@@hint ^\s*writeContract\(\s*\{
Start `writeContract({`
@@hint address\s*:\s*TOKEN\s*,\s*abi\s*:\s*erc20Abi\s*,
then `address: TOKEN, abi: erc20Abi,`
@@hint functionName\s*:\s*['"]transfer['"]\s*,
then `functionName: 'transfer',`
@@hint args\s*:\s*\[\s*to\s*,\s*parseUnits\(\s*['"]1['"]\s*,\s*18\s*\)\s*\]
then `args: [to, parseUnits('1', 18)]`
@@hint \}\s*\)\s*;?\s*$
Close with `});`
:::

## Every state a transaction goes through

| State | What the user should see |
|---|---|
| Not connected | A clear Connect button |
| Wrong network | "Switch to Sepolia" button |
| Waiting for signature | "Confirm in your wallet" |
| Rejected by user | A calm message, not a scary error |
| Pending (in mempool) | Progress, plus a link to the explorer |
| Confirmed | Success, and refreshed balances |
| Reverted | The reason, in plain English |

Good dApps feel trustworthy because they handle all seven. Most bad ones only handle "confirmed".

:::pro Simulate before you send
viem's `simulateContract` (and wagmi's `useSimulateContract`) runs the transaction against current state without sending it. If it would revert, you can show the reason before the user pays gas.
:::

## Quiz

? Which operation needs the user's wallet to sign?
- [ ] Reading a token balance
- [ ] Getting the latest block number
- [x] Transferring tokens
> Reads are free calls to an RPC node. State changes must be signed and paid for.

? A balance comes back as 2500000000000000000n with 18 decimals. How do you display it?
- [x] formatUnits(balance, 18), giving "2.5"
- [ ] Number(balance) / 18
- [ ] balance.toString()
> formatUnits divides by 10^decimals safely using bigint maths.

? What is an ABI?
- [ ] The contract's source code
- [x] A JSON description of a contract's functions and events, so code knows how to call it
- [ ] An API key
> Front ends and scripts need the ABI to encode calls and decode results.

? Why simulate a transaction before sending it?
- [ ] It makes it cheaper
- [x] To catch reverts and show the reason before the user pays gas
- [ ] Wallets require it
> Failed transactions still cost gas. Simulating saves users money and confusion.
