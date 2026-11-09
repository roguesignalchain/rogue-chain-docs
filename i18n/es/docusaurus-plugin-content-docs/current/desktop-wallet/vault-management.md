---
title: Seguridad de la Bóveda y Claves
description: Modelo de custodia, frases de recuperación y arquitectura de seguridad.
---

# Seguridad de la Bóveda y Claves

La seguridad de tus fondos en Rogue Signal depende exclusivamente de la confidencialidad de tus claves privadas. La aplicación funciona bajo un modelo 100% no-custodial: tú eres el único dueño de tus activos.

---

## 🔐 Arquitectura de Seguridad

1. **Frase de Recuperación BIP-39:**
   * Al crear una billetera nueva, se genera una frase mnemotécnica de 12 o 24 palabras mediante un generador criptográficamente seguro (CSPRNG).
   * Ruta de derivación estándar: `m/44'/60'/0'/0/0` (estándar EVM).

2. **Cifrado de la Bóveda con AES-256-GCM:**
   * Las claves se guardan en el archivo local `.rogue-wallet.vault`.
   * Tu contraseña maestra se procesa con la función de derivación de claves de alta memoria **Argon2id** antes de cifrar los datos con AES-256-GCM.

---

## ⚠️ Buenas Prácticas de Respaldo

> [!CAUTION]
> Nunca guardes tus 12 palabras en correos electrónicos, servicios en la nube, capturas de pantalla ni apps de mensajería. Quien tenga acceso a estas palabras podrá disponer de tus fondos de manera inmediata e irreversible.

* **Escribe la frase a mano en papel o placas metálicas** y guárdala en un lugar seguro y protegido contra fuego y agua.
* **Verifica el respaldo:** Confirma que anotaste cada palabra en el orden exacto antes de transferir balances importantes.
* **Contraseña robusta:** Usa una clave segura para la aplicación para evitar accesos indebidos si tu ordenador sufre un ataque local.
