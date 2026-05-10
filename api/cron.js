const { scrapeStockDataAPI } = require('../lib/scraper');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');

module.exports = async function (req, res) {
  // Optionnel: Vercel envoie un header spécial d'authentification pour les crons
  // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  console.log("=== Début du Cron Job d'extraction ===");

  // Vérification de l'heure de Paris pour s'assurer qu'on est bien à 18h (gestion Heure d'été/hiver)
  const parisTimeStr = new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" });
  const parisDate = new Date(parisTimeStr);
  const parisHour = parisDate.getHours();

  // Si on déclenche le cron un peu avant 18h, on laisse passer (ex: 18h00, 18h01)
  if (parisHour !== 18) {
    console.log(`Ignoré : Il est ${parisHour}h à Paris. L'extraction se lance à 18h.`);
    return res.status(200).json({ message: `Il est ${parisHour}h à Paris, annulation.` });
  }

  try {
    // 1. Lire la liste des ISINs
    const isinsPath = path.join(process.cwd(), 'data', 'isins.json');
    let isinsToProcess = [];
    if (fs.existsSync(isinsPath)) {
      isinsToProcess = JSON.parse(fs.readFileSync(isinsPath, 'utf8'));
    } else {
      return res.status(400).json({ error: 'Fichier isins.json introuvable' });
    }

    console.log(`Traitement de ${isinsToProcess.length} ISINs...`);

    // 2. Extraire les données
    const results = [];
    for (const isin of isinsToProcess) {
      const data = await scrapeStockDataAPI(isin);
      results.push({
        ISIN: data.isin,
        Entreprise: data.companyName,
        'Haut 1A': data.high1y,
        'Date Haut': data.high1yDate,
        'Bas 1A': data.low1y,
        'Date Bas': data.low1yDate,
        Statut: data.high1y !== 'N/A' ? 'Succès' : 'Échec'
      });
      // Petite pause pour ne pas spammer l'API Yahoo
      await new Promise(r => setTimeout(r, 500));
    }

    // 3. Créer le fichier Excel en mémoire
    const worksheet = xlsx.utils.json_to_sheet(results);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Resultats');

    // Générer le buffer binaire du fichier Excel
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 4. Configurer Nodemailer pour envoyer l'email
    // Utilise les variables d'environnement Vercel (EMAIL_USER, EMAIL_PASS, EMAIL_TO)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const dateStr = new Date().toLocaleDateString('fr-FR');

    const mailOptions = {
      from: `"Boursier Scraper" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `Rapport d'Extraction Boursière - ${dateStr}`,
      text: `Bonjour,\n\nVeuillez trouver en pièce jointe le rapport d'extraction boursière du ${dateStr} pour ${results.length} actions.\n\nCordialement,\nLe Bot Scraper`,
      attachments: [
        {
          filename: `Extraction_${dateStr.replace(/\//g, '-')}.xlsx`,
          content: excelBuffer
        }
      ]
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log("Envoi de l'email en cours...");
      await transporter.sendMail(mailOptions);
      console.log("Email envoyé avec succès !");
    } else {
      console.log("Attention: EMAIL_USER ou EMAIL_PASS manquant. L'email n'a pas pu être envoyé.");
    }

    res.status(200).json({ success: true, message: 'Extraction et email terminés.' });

  } catch (error) {
    console.error("Erreur générale du Cron:", error);
    res.status(500).json({ error: error.message });
  }
};
