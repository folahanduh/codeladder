---
id: enc-devices
title: Encrypt your devices, backups and messages
level: beginner
minutes: 30
summary: Turn on full-disk encryption on every computer and phone, encrypt your backups, choose messaging apps that are really end-to-end encrypted, and protect your traffic on public Wi-Fi.
---

## Start with your own machine

Your laptop holds everything an attacker wants: saved browser sessions, password manager caches, SSH keys, `.env` files, wallet files and seed phrase screenshots you forgot about. If it is stolen and the disk is not encrypted, the thief can remove the drive and read all of it without knowing your password.

**Full-disk encryption** (FDE) fixes that. With it on, the disk is unreadable until you log in.

| System | Built-in encryption | Where to turn it on | Check from the terminal |
|---|---|---|---|
| macOS | **FileVault** | System Settings > Privacy & Security > FileVault | `fdesetup status` |
| Windows | **BitLocker** (Pro) or **Device encryption** (Home, on supported PCs) | Settings > Privacy & security > Device encryption | `manage-bde -status` (in an admin terminal) |
| Linux | **LUKS** | Usually chosen when installing ("Encrypt the new installation") | `lsblk -f` (look for `crypto_LUKS`) |

When you turn it on you get a **recovery key**. Store it in your password manager or on paper somewhere safe, never only on the same laptop.

:::exercise Check that FileVault is on
@@file Terminal
@@lang bash
@@prompt
On a Mac, ask the system whether full-disk encryption is on:

```bash
fdesetup status
```

You want to see `FileVault is On.` (On Windows run `manage-bde -status` as administrator; on Linux run `lsblk -f`.)
@@solution
fdesetup status
@@hint ^\s*fdesetup\s+status\s*$
Type `fdesetup status` (the FileVault setup tool, with the `status` command).
@@explain
If it says `FileVault is Off.`, turn it on today. Encryption runs in the background and you can keep working. It is the single biggest protection for a lost or stolen laptop.
:::

## Phones

Modern iPhones and Android phones encrypt their storage automatically, **but the encryption is only as strong as your passcode**. A 4-digit PIN has 10,000 options.

- Use at least a **6-digit passcode**, or better, an alphanumeric one, plus Face ID or a fingerprint for convenience.
- Turn on **Find My** (iPhone) or **Find My Device** (Android) so you can wipe a lost phone remotely.
- Keep the phone updated: most phone break-in tools rely on old, unpatched bugs.

## Backups

Backups are often the weakest copy of your data: old, forgotten and unencrypted.

- **Time Machine** (Mac): tick "Encrypt backup" when you choose the disk.
- **iPhone backups to a computer**: tick "Encrypt local backup".
- **iCloud**: turn on **Advanced Data Protection** so most of your iCloud data (backups, photos, notes) is end-to-end encrypted, meaning even Apple cannot read it.
- **External drives and USB sticks**: format them encrypted (macOS Disk Utility "APFS (Encrypted)", BitLocker To Go on Windows, or VeraCrypt on any system).
- **Never** keep seed phrases, private keys or recovery codes in cloud photos, notes or email, encrypted or not. Those go offline (see the wallet lessons).

:::warn Lose the key, lose the backup
An encrypted backup you cannot decrypt is worthless. Store the backup password in your password manager, and test a restore once.
:::

## Messages: who can read them?

**End-to-end encryption** (E2EE) means only the people in the conversation can read messages, not the company running the service.

| App | End-to-end encrypted? |
|---|---|
| **Signal** | Yes, for everything, by default. The best choice for sensitive conversations. |
| **WhatsApp**, **iMessage** | Yes, for messages (check backups: turn on encrypted backups) |
| **Telegram** | **No**, not by default. Normal chats and all groups are readable by Telegram's servers; only one-to-one "secret chats" are E2EE |
| **Discord**, **Slack**, email | **No**, for messages. The provider (and anyone who breaches it) can read them |

Crypto teams often coordinate on Telegram and Discord. Never share keys, seed phrases, passwords or internal security details there.

## Your traffic on public Wi-Fi

- **HTTPS** protects the content of each connection. Look for it, and never click through a certificate warning on public Wi-Fi: that warning is exactly what an interception attack looks like.
- **Encrypted DNS** (DNS over HTTPS, in your browser's security settings) hides which sites you look up from the local network.
- A **VPN** encrypts everything between you and the VPN provider. It is useful on untrusted Wi-Fi, but it moves your trust to the VPN company rather than removing the need for trust. Use a reputable paid one, or your phone's hotspot instead.

:::exercise Check a page is using HTTPS
@@file https-check.js
@@prompt
Your web app should refuse to run sensitive features over plain HTTP. Write the check:

```js
if (location.protocol !== 'https:') {
  console.log('Not secure: switch to HTTPS before signing in.');
}
```

(When you press **Run it** here it prints the warning, because the preview is not served over HTTPS.)
@@solution
if (location.protocol !== 'https:') {
  console.log('Not secure: switch to HTTPS before signing in.');
}
@@hint ^\s*if\s*\(\s*location\.protocol\s*!==\s*['"]https:['"]\s*\)\s*\{\s*$
Line 1: `if (location.protocol !== 'https:') {` (note the colon inside `'https:'`).
@@hint console\.log\(\s*['"]Not secure: switch to HTTPS before signing in\.['"]\s*\)
Line 2: `console.log('Not secure: switch to HTTPS before signing in.');`
@@hint ^\s*\}\s*$
Line 3: close the block with `}`.
@@explain
In real apps you do this on the server instead: redirect every HTTP request to HTTPS and send the HSTS header so browsers never try HTTP again. That is the next level's HTTPS lesson.
:::

## Your 20-minute encryption checklist

1. Full-disk encryption on every laptop and desktop, recovery key in your password manager.
2. A 6+ digit passcode on your phone, with remote wipe turned on.
3. Encrypted backups (and one test restore).
4. Signal for sensitive conversations; nothing secret in Telegram, Discord or email.
5. Encrypted DNS in your browser, and your phone's hotspot or a VPN on public Wi-Fi.

## Quiz

? Your laptop has FileVault turned off and is stolen. What can the thief read?
- [ ] Nothing without your password
- [x] Almost everything, by removing or booting the drive, including saved sessions and files
- [ ] Only your photos
> Without full-disk encryption, your login password does not protect the data on the disk.

? Which messaging setup is end-to-end encrypted by default?
- [x] Signal
- [ ] A Telegram group
- [ ] A Discord server
> Telegram groups and Discord messages can be read by the provider's servers.

? Where should your disk encryption recovery key be stored?
- [ ] In a text file on the same laptop
- [x] In your password manager or written down somewhere safe, away from the laptop
- [ ] Posted in your team chat so others can help
> A recovery key stored on the encrypted device is useless when you need it, and dangerous anywhere public.
