---
title: Vault Security & Keys
description: Security model, seed phrases, and encryption architecture of Rogue Wallet.
---

# Vault Security & Keys

The security of your funds on Rogue Signal depends on the secrecy and integrity of your private keys. The desktop client implements a self-custodial vault architecture where you retain 100% control over your assets.

---

## 🔐 Cryptographic Vault Architecture

1. **BIP-39 Mnemonic Passphrase:**
   * When creating a new wallet, a 12 or 24-word recovery phrase is generated using a cryptographically secure pseudorandom number generator (CSPRNG).
   * Standard derivation path: `m/44'/60'/0'/0/0` (standard EVM derivation).

2. **AES-256-GCM Vault Encryption:**
   * Keys are stored on disk in `.rogue-wallet.vault`.
   * Passwords are authenticated and keys derived using **Argon2id** (memory-hard key derivation) before encrypting secrets with AES-256-GCM.

---

## ⚠️ Safe Backup Best Practices

> [!CAUTION]
> Never store your 12-word seed phrase unencrypted in email, cloud drives, screenshots, or chat applications. Anyone who obtains your seed phrase has immediate, irreversible access to all your funds.

* **Write it down on paper or metal backup plates** and store it in a secure, fireproof location.
* **Test recovery:** Ensure you have noted every word correctly and in the exact sequence before transferring large balances.
* **Master password:** Choose a strong passphrase for your desktop vault to prevent local extraction if your computer is compromised.
