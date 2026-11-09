---
title: Visión General del Cliente de Escritorio
description: Descripción de la billetera oficial y panel de control de Rogue Signal.
---

# Visión General del Cliente de Escritorio

El software **`rogue-desktop-client`** es la interfaz gráfica oficial para gestionar tu billetera, controlar el nodo local y activar el minero por CPU en la red Rogue Signal. Desarrollado con **Tauri v2** y **React**, combina un consumo mínimo de memoria con cifrado local de máxima seguridad.

---

## 🌟 Características Destacadas

* **Rendimiento Nativo Ligero:** Diseñado sobre Rust y Tauri v2, con una fracción del consumo de memoria RAM de las billeteras tradicionales basadas en Electron.
* **Control Integral del Nodo:** Inicia, detén, revisa la sincronización y consulta los registros de la blockchain sin salir de la interfaz.
* **Minero RandomX Integrado:** Mina ROGUE directamente a tu dirección con un solo clic, selector de hilos de CPU y telemetría de hashrate en vivo.
* **Bóveda Cifrada en Disco:** Tus claves privadas y frases mnemotécnicas (BIP-39) se almacenan localmente protegidas mediante cifrado autenticado AES-256-GCM.
* **Múltiples Cuentas:** Crea y administra varias direcciones derivadas a partir de una única semilla HD.

---

## 🖥️ Plataformas Disponibles

Los instaladores oficiales se encuentran en la sección de releases del repositorio:

* **Linux:** Paquete `.deb` e instalador portable `.AppImage`
* **Windows:** Instalador `.msi` y ejecutable portable `.exe`
* **macOS:** Paquete `.dmg` universal (Apple Silicon e Intel)
