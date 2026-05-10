@echo off
TITLE Boursier Scraper v3.3
echo.
echo ==========================================
echo   LANCEMENT DE BOURSIER SCRAPER v3.3
echo ==========================================
echo.

REM Verifier si le dossier node_modules existe
if not exist "node_modules\" (
    echo [ERREUR] Les dependances ne sont pas installees.
    echo Installation en cours...
    npm install
)

REM Verifier si le dossier dist existe
if not exist "dist\" (
    echo [INFO] Premiere compilation en cours...
    npm run build
)

echo.
echo [OK] Serveur en cours de lancement sur http://localhost:3000
echo [CONSEIL] Laissez cette fenetre ouverte tant que vous utilisez l'application.
echo.

REM Lancer le serveur
npm start

pause
