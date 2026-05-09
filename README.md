<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run your Boursier Data Scraper App

This is a self-contained frontend application that uses the Gemini API to scrape financial data.

View your app in AI Studio: https://ai.studio/apps/drive/1PpqDYxUFZH-rLu14gyPuoc3yvSuMMoUc

## Run Locally (for Development)

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. You will need a Gemini API key. Make sure it is available as an environment variable named `GEMINI_API_KEY`. For local development, you can create a `.env` file in the root of the project and add the line:
   `VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE`
3. Run the development server:
   `npm run dev`

---

## Run as a Desktop App (Recommended for End-Users)

This method packages the application so it can be launched with a simple double-click, without needing to use the command line every time. It uses a reliable custom server to ensure compatibility across different systems.

**Prerequisites (One-time setup):**
1.  **Node.js:** Ensure Node.js is installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

**Launch Steps:**

1.  **Install project dependencies (only needs to be done once):**
    `npm install`
2.  **Build the application (only needs to be done once, or after code changes):**
    `npm run build`
    This will create a `dist` folder containing the optimized app.
3.  **Launch the app:**
    -   **On Windows:** Double-click `lancer_application.bat`.
    -   **On macOS/Linux:** First, make the script executable by running `chmod +x lancer_application.sh` in your terminal. Then, you can double-click `lancer_application.sh` or run it from the terminal with `./lancer_application.sh`.

The script will automatically start a local server and open the application in your default web browser. To stop the application, simply close the terminal window that opens.
