---
id: sec-linux
title: Linux and the command line for security
level: beginner
minutes: 30
summary: Users, permissions, processes, logs and SSH keys. The Linux skills every security engineer, server admin and node operator relies on.
---

## Why Linux

Most servers, blockchain nodes, cloud machines and security tools run on Linux. Security work means reading logs, checking permissions and locking machines down from a terminal. If you are on Windows, use WSL2 (see [Install everything](#toolkit)).

## Users and root

Every process runs as a **user**. The **root** user can do anything, which is exactly why you should rarely be it.

```bash
whoami              # which user am I?
id                  # my user id and groups
sudo apt update     # run ONE command as root, after typing your password
```

Least privilege applies here: run services (your web app, your node) as their own unprivileged users, so a hacked service cannot take over the whole machine.

## File permissions

```text
-rw-r--r--  1 ada staff  1204 Nov 20 10:12 notes.txt
 |  |  |
 |  |  +-- others: read
 |  +----- group:  read
 +-------- owner:  read and write
```

Each set is three bits: **r**ead = 4, **w**rite = 2, e**x**ecute = 1. Add them up:

| Number | Letters | Means |
|---|---|---|
| 7 | rwx | read, write, execute |
| 6 | rw- | read and write |
| 4 | r-- | read only |
| 0 | --- | nothing |

So `chmod 600 file` means owner read and write, nobody else anything. **SSH private keys must be 600**, or SSH refuses to use them. A `.env` file with secrets should be 600 too.

:::exercise Lock down a private key
@@file Terminal
@@lang bash
@@prompt
Three commands: list the files in `~/.ssh` in long format (to see permissions), set your private key `~/.ssh/id_ed25519` to owner read and write only, then print which user you are.
@@solution
ls -l ~/.ssh
chmod 600 ~/.ssh/id_ed25519
whoami
@@hint ^\s*ls\s+-l\s+~/\.ssh\s*$
Line 1: `ls -l ~/.ssh` (long format shows permissions).
@@hint ^\s*chmod\s+600\s+~/\.ssh/id_ed25519\s*$
Line 2: `chmod 600 ~/.ssh/id_ed25519` (6 = read + write for the owner, 0 for everyone else).
@@hint ^\s*whoami\s*$
Line 3: `whoami`
@@explain
After `chmod 600`, `ls -l` shows `-rw-------` for the key: only you can read it. Wrong permissions on keys are a real and common finding in security reviews.
:::

## Processes and network connections

```bash
ps aux                 # every running process
top                    # live view (press q to quit)
ss -tulpn              # which programs are listening on which ports (Linux)
kill 12345             # stop process 12345
```

An unexpected process listening on a port is one of the first signs of a compromised machine.

## Logs: the security camera footage

```bash
sudo tail -f /var/log/auth.log           # logins and sudo use, live (Debian/Ubuntu)
journalctl -u ssh --since "1 hour ago"   # one service's recent logs (systemd)
grep "Failed password" /var/log/auth.log | wc -l   # count failed SSH logins
```

Run the last one on any server with SSH open to the internet and you will see thousands of automated password guesses. That is why you use key-only SSH login.

## Hardening a server in five moves

1. Keep it patched: `sudo apt update && sudo apt upgrade`.
2. SSH with keys only: set `PasswordAuthentication no` and `PermitRootLogin no` in `/etc/ssh/sshd_config`.
3. Firewall everything you do not need: `sudo ufw default deny incoming`, `sudo ufw allow 22`, `sudo ufw enable`.
4. Run each service as its own unprivileged user.
5. Ship logs somewhere the attacker cannot delete them, and alert on anything unusual.

:::tip Practise legally
**OverTheWire: Bandit** is a free game that teaches Linux and security by making you SSH into practice servers and find passwords level by level. It is the best next step after this lesson.
:::

## Quiz

? What does chmod 600 give the owner, group and others?
- [x] Owner read and write; group and others nothing
- [ ] Everyone read and write
- [ ] Owner execute only
> 6 = 4 (read) + 2 (write) for the owner; 0 for the others.

? Why should a web app run as its own unprivileged user instead of root?
- [ ] It runs faster
- [x] If the app is hacked, the attacker only gets that limited user's powers, not the whole machine
- [ ] Root cannot run web apps
> Least privilege contains the damage.

? Thousands of "Failed password" lines appear in your server's auth log. What is the best response?
- [ ] Ignore them
- [x] Switch SSH to key-only login, disable root login, and consider restricting SSH by IP
- [ ] Change the password to something longer
> Automated guessing never stops; remove passwords from the equation entirely.
