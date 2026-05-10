#!/bin/bash

echo "=========================================="
echo "  LANCEMENT DE BOURSIER SCRAPER v3.3"
echo "=========================================="
echo ""

# Verifier si le dossier node_modules existe
if [ ! -d "node_modules" ]; then
    echo "[ERREUR] Les dépendances ne sont pas installées."
    echo "Installation en cours..."
    npm install
fi

# Verifier si le dossier dist existe
if [ ! -d "dist" ]; then
    echo "[INFO] Première compilation en cours..."
    npm run build
fi

echo ""
echo "[OK] Serveur en cours de lancement sur http://localhost:3000"
echo "[CONSEIL] Laissez ce terminal ouvert tant que vous utilisez l'application."
echo ""

# Lancer le serveur
npm start
