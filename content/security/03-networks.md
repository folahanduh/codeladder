---
id: sec-networks
title: How networks are attacked and defended
level: beginner
minutes: 30
summary: IP addresses, ports, protocols and TLS from an attacker's point of view, and why DNS hijacking has emptied DeFi users' wallets.
---

## The map attackers start with

Every attack over the internet starts with **reconnaissance**: what machines exist, what doors are open, and what is running behind each door.

- An **IP address** identifies a machine (`93.184.215.14`).
- A **port** is a numbered door on that machine (0 to 65535). Each service listens on one.
- A **protocol** is the language spoken through the door.

| Port | Service | Security note |
|---|---|---|
| 22 | SSH (remote login) | Use keys, not passwords; never expose to everyone if you can avoid it |
| 53 | DNS | Turns names into addresses; a favourite target for hijacking |
| 80 | HTTP | Unencrypted: anyone on the path can read and modify it |
| 443 | HTTPS | Encrypted with TLS |
| 5432 | PostgreSQL | Should almost never be reachable from the internet |
| 8545 | Ethereum JSON-RPC | An exposed node with unlocked accounts has been drained many times |

**Defenders** close every port that is not needed (a **firewall**), keep the rest patched, and log who knocks.

## TCP, UDP and TLS in one minute

- **TCP** is a reliable, ordered conversation (web, SSH, databases).
- **UDP** is fire-and-forget packets (DNS lookups, video calls, games).
- **TLS** wraps a TCP connection in encryption and proves the server's identity with a **certificate** signed by a trusted authority. The padlock in your browser means TLS succeeded for that exact domain.

TLS protects data **in transit**. It does not make a site trustworthy: phishing sites have valid certificates too.

## Man-in-the-middle attacks

If an attacker sits between you and the server (a malicious Wi-Fi hotspot, a compromised router), they can read and change anything **not** protected by TLS. Defences: HTTPS everywhere with HSTS, never ignoring certificate warnings, and a trusted VPN on networks you do not control.

## DNS: the weak link in front of every dApp

Your smart contracts can be perfect and your users can still lose everything if the **website** in front of them is replaced. Attackers have repeatedly hijacked DeFi projects' domains, for example through the domain registrar or DNS provider (Curve Finance's front end was hijacked this way in 2022), and served a copy of the real site that asked users to sign malicious approvals.

Defences for builders:

- Registrar account with a hardware security key and **registrar lock** turned on.
- **DNSSEC** where your provider supports it.
- Monitoring that alerts you if your DNS records or served JavaScript change unexpectedly.
- Content Security Policy and Subresource Integrity for scripts you load.
- Encourage power users to verify contract addresses and to use transaction simulation in their wallet.

## Scanning (your own machines only)

`nmap` is the classic tool for finding open ports. Run it **only against machines you own or are authorised to test**; scanning other people's systems can be illegal.

:::exercise Scan yourself and inspect a server
@@file Terminal
@@lang bash
@@prompt
Two commands: scan your own machine (`127.0.0.1`) with `nmap`, using `-sV` to detect service versions; then fetch just the HTTP response headers of `https://example.com` with `curl -I`.
@@solution
nmap -sV 127.0.0.1
curl -I https://example.com
@@hint ^\s*nmap\s+-sV\s+127\.0\.0\.1\s*$
Line 1: `nmap -sV 127.0.0.1` (127.0.0.1 always means "this machine").
@@hint ^\s*curl\s+-I\s+https://example\.com\s*$
Line 2: `curl -I https://example.com` (capital I = headers only).
@@explain
The scan lists every port your computer has open and what is listening; you may be surprised. The headers show the server's status code and security headers such as `strict-transport-security`. Attackers run exactly these commands as their first step, so run them on your own systems first.
:::

## Quiz

? Which port does HTTPS normally use?
- [ ] 22
- [ ] 80
- [x] 443
> 80 is plain HTTP; 443 is HTTP over TLS.

? A site shows a valid padlock. What does that prove?
- [ ] The site is safe and trustworthy
- [x] Your connection to that exact domain is encrypted and the server holds a valid certificate for it
- [ ] The site has been audited
> Phishing sites get certificates too. Always check the domain itself.

? Why are DNS hijacks so dangerous for dApps?
- [ ] They break the smart contracts
- [x] Users visiting the real domain are served a fake front end that asks them to sign malicious transactions
- [ ] They slow down the blockchain
> The contracts are untouched; the attack happens in front of them.

? An Ethereum node's RPC port (8545) is open to the internet. Why is that a problem?
- [x] Anyone can send it commands, and if accounts on it are unlocked they can be drained
- [ ] It makes gas more expensive
- [ ] It is not a problem
> Exposed RPC endpoints with unlocked accounts were a classic, repeated source of theft.
