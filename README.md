<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Boursier Data Scraper v3.3

**Boursier Data Scraper** est une solution ultra-robuste pour l'extraction automatisée de données boursières (Plus Haut / Plus Bas sur 1 an avec dates exactes). Conçue pour la précision et la rapidité, l'application utilise une architecture hybride combinant des appels API directs et un moteur de scraping furtif.

## 🚀 Fonctionnalités Clés

- **Moteur Dual-Source** : 
    - **Priorité API** : Utilise l'API Yahoo Finance pour des résultats instantanés et des dates historiques précises.
    - **Fallback Puppeteer** : En cas d'échec, un moteur Puppeteer Stealth prend le relais sur Google Finance.
- **Export Intelligent** : Exportation directe des résultats vers un fichier Excel (.xlsx) formaté.
- **Interface Moderne** : Dashboard React avec thème sombre, graphiques de progression et gestion des erreurs en temps réel.
- **Furtivité Avancée** : Intégration de `puppeteer-extra-plugin-stealth` pour contourner les protections anti-bot.

## 🛠️ Installation

**Prérequis** : [Node.js](https://nodejs.org/) (version 16+)

1. Clonez le dépôt et installez les dépendances :
   ```bash
   npm install
   ```

2. Compilez l'application frontend :
   ```bash
   npm run build
   ```

## 💻 Utilisation

### Mode Serveur (Recommandé)
Pour lancer l'application complète (Backend + Frontend), exécutez :
```bash
npm start
```
L'interface sera alors accessible à l'adresse : **http://localhost:3000**

### Mode Développement
Pour travailler sur le frontend uniquement avec rechargement à chaud :
```bash
npm run dev
```
*Note: Le serveur backend (`npm start`) doit également être lancé pour que le scraping fonctionne.*

## 📂 Structure du Projet

- `App.tsx` : Interface utilisateur principale et logique de gestion de file d'attente.
- `server.js` : Serveur Node.js gérant l'API de scraping et servant les fichiers statiques.
- `services/scrapingService.ts` : Pont entre le frontend et l'API locale.
- `lancer_application.bat` : Script de lancement rapide pour Windows.

---

**Développé par Aniquestore**  
📧 Contact : [aniquestoreinfo@gmail.com](mailto:aniquestoreinfo@gmail.com)

