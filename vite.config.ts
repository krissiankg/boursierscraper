import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // FIX: Replaced `process.cwd()` with `''` to fix "Property 'cwd' does not exist on type 'Process'" error.
  const env = loadEnv(mode, '', '');
  return {
    plugins: [react()],
    define: {
      // The app uses process.env.API_KEY, so we map the value from VITE_GEMINI_API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    }
  }
})