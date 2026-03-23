<div align="center">
  <img width="1200" height="475" alt="Financier AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Financier AI

<p align="center">
  <a href="https://img.shields.io/badge/React-19.0-blue">
    <img src="https://img.shields.io/badge/React-19.0-blue" alt="React" />
  </a>
  <a href="https://img.shields.io/badge/TypeScript-5.8-blue">
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue" alt="TypeScript" />
  </a>
  <a href="https://img.shields.io/badge/Tailwind-4.1-green">
    <img src="https://img.shields.io/badge/Tailwind-4.1-green" alt="Tailwind" />
  </a>
  <a href="https://img.shields.io/badge/Firebase-12.11-orange">
    <img src="https://img.shields.io/badge/Firebase-12.11-orange" alt="Firebase" />
  </a>
  <a href="https://img.shields.io/badge/Vite-6.2-purple">
    <img src="https://img.shields.io/badge/Vite-6.2-purple" alt="Vite" />
  </a>
</p>

> O aplicație modernă de management și bugetare cu gamificare și simulări financiare bazate pe AI.

## 📋 Descriere

**Financier AI** este o aplicație web progresivă (PWA) pentru managementul financiar personal. Aceasta oferă utilizatorilor instrumente avansate pentru:

- ✅ Urmărirea cheltuielilor și veniturilor
- 📊 Vizualizări grafice ale datelor financiare
- 🎮 Sistem de gamificare pentru motivație
- 🔮 Simulări și predicții financiare
- 🤖 Insights bazate pe AI (Gemini)

## 🚀 Caracteristici

### Management Financiar
- Adăugare rapidă a cheltuielilor și veniturilor
- Categorizare automată a tranzacțiilor
- Istoric complet al tuturor operațiunilor
- Filtre avansate și căutare

### Dashboard Interactiv
- Graficie realtime cuRecharts
- Statistici și metrici cheie
- Tendințe și analize
- Export date

### Gamificare
- Puncte de experiență (XP)
- Niveluri și ranguri
- Achievement-uri și badge-uri
- Streak-uri zilnice

### Simulator Financiar
- Proiecții bugetare
- Simulări de scenarii
- Calculatoare financiare
- Planificare pe termen lung

### AI Insights
- Recomandări personalizate
- Analiză comportamentală
- Predicții de cheltuieli
- Sugestii de optimizare

## 🛠️ Tehnologii

| Frontend | Backend | Database | AI |
|----------|---------|----------|-----|
| React 19 | Vite 6.2 | Firebase Realtime Database | Google Gemini API |
| TypeScript | Express.js | Firestore | |
| Tailwind CSS 4 | Node.js | | |
| Motion (Animations) | | | |

## 📦 Instalare

### Prerequisites
- Node.js 18+
- npm sau yarn

### Pași de instalare

```bash
# 1. Clonează repository-ul
git clone <repository-url>
cd financier-ai

# 2. Instalează dependențele
npm install

# 3. Configurează variabilele de mediu
cp .env.example .env.local

# 4. Adaugă cheia API pentru Gemini în .env.local
GEMINI_API_KEY=your_gemini_api_key_here

# 5. Pornește serverul de dezvoltare
npm run dev
```

### Comenzi disponibile

| Comandă | Descriere |
|---------|-----------|
| `npm run dev` | Pornește serverul de dezvoltare |
| `npm run build` | Build pentru producție |
| `npm run preview` | Preview build-ul |
| `npm run lint` | Verificare TypeScript |

## 📱 Progressive Web App

Aplicația poate fi instalată pe dispozitive mobile și desktop:

1. Deschide aplicația în browser
2. Pentru iOS: Tap pe "Share" → "Add to Home Screen"
3. Pentru Android: Tap pe meniu → "Install App"

## 🔧 Configurare Firebase

Pentru a configura Firebase, urmează acești pași:

1. Creează un proiect în [Firebase Console](https://console.firebase.google.com/)
2. Activează **Authentication** (Email/Password)
3. Configurează **Realtime Database** sau **Firestore**
4. Copiază configurația în `src/lib/firebase.ts`

## 📄 Licență

MIT License - vezi fișierul [LICENSE](LICENSE) pentru detalii.

---

<p align="center">Made with ❤️ using React + TypeScript + Tailwind</p>
