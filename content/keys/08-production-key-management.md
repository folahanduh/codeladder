---
id: keys-kms-mpc
title: "Keys in production: KMS, HSM, MPC and remote signers"
level: advanced
minutes: 40
summary: How serious teams run keys that must sign automatically, using cloud KMS, hardware security modules, MPC wallets, policy engines and remote signers, with no raw private key ever in a server's memory.
---

## Some keys must be hot

Relayers that submit transactions, whitelist signers, oracle updaters, market makers, validators and exchange hot wallets all need to sign **automatically**, often thousands of times a day. A hardware wallet in a drawer will not do. The dangerous shortcut is a raw private key in an environment variable on a server: one server compromise, one leaked log, and it is gone.

## The options

| Approach | How it works | Strengths | Watch out for |
|---|---|---|---|
| **Cloud KMS** (for example AWS KMS with secp256k1 keys) | The key is generated and stored inside the provider's hardware; your server asks it to sign | The key can never be exported; IAM controls who can sign; every signature is logged | Cloud account security becomes key security; signatures need re-encoding for Ethereum (libraries handle this) |
| **HSM** (hardware security module) | Dedicated tamper-resistant hardware you control or rent | Strongest isolation; regulatory standard | Cost, operations, availability planning |
| **MPC wallets** | The key is split into shares held by different parties or machines; they compute a signature together without ever assembling the key | No single place holds the key; built-in approval policies | Vendor trust and availability; understand the recovery model |
| **Smart contract wallets / multisig** | On-chain rules decide what a key can do | Spending limits and multiple approvers enforced by the chain | Gas, complexity, contract risk |
| **Remote signers** (for example Web3Signer for validators) | Validator clients ask a separate signing service | Keys off the validator machine; slashing protection database | Must be highly available and locked down |

## Create a signing key that can never be exported

:::exercise Create a secp256k1 key in AWS KMS
@@file Terminal
@@lang bash
@@prompt
Using the AWS CLI, create a KMS key suitable for Ethereum signing. One command (key spec `ECC_SECG_P256K1`, usage `SIGN_VERIFY`, description `launch-whitelist-signer`):

```bash
aws kms create-key --key-spec ECC_SECG_P256K1 --key-usage SIGN_VERIFY --description "launch-whitelist-signer"
```
@@solution
aws kms create-key --key-spec ECC_SECG_P256K1 --key-usage SIGN_VERIFY --description "launch-whitelist-signer"
@@hint ^\s*aws\s+kms\s+create-key
Start with `aws kms create-key`
@@hint --key-spec\s+ECC_SECG_P256K1
`--key-spec ECC_SECG_P256K1` is the secp256k1 curve Ethereum uses.
@@hint --key-usage\s+SIGN_VERIFY
`--key-usage SIGN_VERIFY` (this key signs; it does not encrypt).
@@hint --description\s+["']launch-whitelist-signer["']
`--description "launch-whitelist-signer"`
@@explain
The private key is created inside AWS's hardware and cannot be downloaded by anyone, including you. Your signing service gets an IAM role allowed to call `kms:Sign` on this one key and nothing else. Every signature is logged in CloudTrail, so you can audit exactly what was signed and when.
:::

## Policy: decide what a key may sign

Isolation stops the key being stolen. **Policy** stops it being misused by whoever controls the service:

- Allow-lists of destination addresses and contract functions.
- Amount limits per transaction and per day.
- Rate limits and time windows.
- Multiple approvers above a threshold (built into most MPC platforms and multisigs).
- Automatic alerts, and an automatic pause, when a limit is hit.

## Separation of duties

- The engineers who deploy the signing service cannot change its policies alone.
- The people who can change policies cannot sign transactions alone.
- Production access requires hardware keys and is logged and reviewed.
- Break-glass access exists, is tested, and sets off alarms when used.

## Rotation as a routine

Design every system so a key can be replaced on a normal Tuesday, not only in a crisis: contracts allow the signer address to be rotated through the multisig, services read the active key ID from configuration, and you rehearse the rotation. A key you cannot rotate is a key you will keep using after it leaks.

## Quiz

? What is the main advantage of a cloud KMS key over a private key in an environment variable?
- [x] The key cannot be exported; services can only ask it to sign, under IAM control and with every use logged
- [ ] It is faster
- [ ] It is free
> A server compromise then lets an attacker sign only while they hold access, within policy, and visibly; it cannot walk away with the key.

? How does an MPC wallet avoid a single point of failure?
- [ ] It stores the key in several places
- [x] The key exists only as shares held by different parties, who compute signatures together without assembling it
- [ ] It uses a longer key
> No single machine or person ever holds the whole key.

? Why design for routine key rotation?
- [ ] Auditors like it
- [x] So that replacing a leaked or suspect key is fast and practised, not an untested emergency
- [ ] Keys wear out
> If rotation is hard, teams delay it, and leaked keys stay in use.
