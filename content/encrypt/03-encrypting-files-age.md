---
id: enc-files
title: Encrypting files and folders with age
level: beginner
minutes: 35
summary: Encrypt a file before you send or store it, using age (the modern, simple tool) with public keys or a passphrase, plus where GPG, 7-Zip and encrypted drives fit.
---

## When you need file encryption

Full-disk encryption protects files on *your* machine. The moment a file leaves it (attached to an email, uploaded to Google Drive, copied to a USB stick, sent to a teammate) it is on its own. Encrypt it first when it contains:

- contracts, invoices, ID documents or customer data,
- configuration with real secrets (a `.env` for a teammate),
- backups of anything sensitive.

## Meet age

**age** (pronounced like the word, with a hard "g") is a small, modern encryption tool by Filippo Valsorda, a former Go security lead at Google. It does one job well and is hard to misuse. Install it from the [Install everything](#toolkit) page (`brew install age`, `winget install -e --id FiloSottile.age` or `sudo apt install -y age`).

age uses a **key pair**, like a wallet:

- your **identity** (private key), kept in a file only you have, and
- your **recipient** (public key), starting `age1...`, which you can share freely. Anyone can encrypt *to* it; only your identity can decrypt.

```bash
age-keygen -o key.txt
# Public key: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
```

:::exercise Encrypt and decrypt a file with age
@@file Terminal
@@lang bash
@@prompt
Three commands. Make a key pair, encrypt `notes.txt` to a recipient listed in `recipients.txt` (one public key per line), then decrypt it with your identity:

```bash
age-keygen -o key.txt
age -R recipients.txt -o notes.txt.age notes.txt
age -d -i key.txt -o notes.txt notes.txt.age
```
@@solution
age-keygen -o key.txt
age -R recipients.txt -o notes.txt.age notes.txt
age -d -i key.txt -o notes.txt notes.txt.age
@@hint ^\s*age-keygen\s+-o\s+key\.txt\s*$
Line 1: `age-keygen -o key.txt` writes a new identity to `key.txt` and prints its public key.
@@hint ^\s*age\s+-R\s+recipients\.txt\s+-o\s+notes\.txt\.age\s+notes\.txt\s*$
Line 2: `age -R recipients.txt -o notes.txt.age notes.txt` (`-R` = a file of recipients, `-o` = the output file, then the input).
@@hint ^\s*age\s+-d\s+-i\s+key\.txt\s+-o\s+notes\.txt\s+notes\.txt\.age\s*$
Line 3: `age -d -i key.txt -o notes.txt notes.txt.age` (`-d` decrypt, `-i` your identity file).
@@explain
`-r age1...` encrypts to a single public key typed on the command line; `-R file` reads several, so one file can be opened by everyone on your team. age can also encrypt to people's existing SSH public keys (`-R ~/.ssh/id_ed25519.pub`), which is handy for developers.
:::

## Passphrase mode

No key pair? `age -p` asks for a passphrase instead (and offers to generate a strong one):

```bash
age -p -o contract.pdf.age contract.pdf
age -d -o contract.pdf contract.pdf.age
```

The passphrase is turned into a key with **scrypt**, a deliberately slow function, so guessing is expensive. Still, a weak passphrase can be guessed offline forever once the file is out there. Use a long, generated one, and send it through a **different channel** from the file (file by email, passphrase by Signal or your password manager's sharing feature).

## Encrypt a whole folder for backup

age encrypts one stream of data, so pack a folder first with `tar` and pipe it straight into age. The unencrypted archive is never written to disk.

:::exercise Encrypted folder backup in one line
@@file Terminal
@@lang bash
@@prompt
Archive the `project` folder and encrypt it to your recipients in one pipeline:

```bash
tar -czf - project | age -R recipients.txt > project.tar.gz.age
```
@@solution
tar -czf - project | age -R recipients.txt > project.tar.gz.age
@@hint ^\s*tar\s+-czf\s+-\s+project\s*\|
Start with `tar -czf - project |` (`c` create, `z` gzip, `f -` write to standard output instead of a file).
@@hint \|\s*age\s+-R\s+recipients\.txt\s*>\s*project\.tar\.gz\.age\s*$
Then `| age -R recipients.txt > project.tar.gz.age` (the `>` saves age's output to a file).
@@explain
To restore: `age -d -i key.txt project.tar.gz.age | tar -xzf -`. Upload the `.age` file anywhere (cloud storage, a second drive): without your identity file it is just random-looking bytes.
:::

## Other tools you will meet

| Tool | Use it when | Watch out |
|---|---|---|
| **GPG** (GnuPG) | Signing Git commits and software releases, or when someone insists on PGP email | Complicated and easy to misuse; prefer age for plain file encryption |
| **7-Zip** with AES-256 | Sending an encrypted file to a non-technical person | Choose AES-256, not the old "ZipCrypto", which is broken. Tick "Encrypt file names" |
| **VeraCrypt** or an encrypted APFS/BitLocker drive | A whole USB stick or external disk | Unmount it when you are done; it is only protected while locked |
| **Your password manager** | Sharing a single password, API key or recovery code | Use its secure share feature instead of chat or email |

## Habits that matter more than the tool

- **Never put the key next to the file.** An encrypted zip with the password in the same email is not encrypted.
- **Avoid plaintext copies.** Deleted files on SSDs can linger; it is better never to write the plaintext (use pipes, as above) and to rely on full-disk encryption.
- **Back up your identity file**, or nothing you encrypted to it can ever be opened again.
- **Treat encrypted secrets as having a lifetime**: if a `.age` file of API keys might have leaked along with its identity, rotate the keys.

## Quiz

? You share an age public key (age1...) with a colleague. What can they do with it?
- [x] Encrypt files that only you can decrypt
- [ ] Decrypt your files
- [ ] Log in as you
> Public keys encrypt; only the matching private identity decrypts.

? Why pipe tar straight into age instead of creating project.tar.gz first?
- [ ] It is faster to type
- [x] The unencrypted archive is never written to disk, so no plaintext copy is left behind
- [ ] age cannot read files
> Avoiding plaintext copies is easier than trying to securely delete them later.

? You email an encrypted zip and put the password in the same email. How secure is it?
- [ ] Very, the zip is AES-256
- [x] Barely: anyone who gets the email gets both the file and the password
- [ ] Secure as long as the subject line is vague
> Send the secret through a different channel from the file.
