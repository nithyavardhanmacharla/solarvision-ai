# ☀️ SolarVision AI | Photovoltaic Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-orange?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)

An advanced AI-powered Solar Photovoltaic (PV) engineering and feasibility intelligence platform. Features real-time 3D raytracing physics, interactive GIS polygon mapping, dual-axis solar tracking simulations, battery storage dispatch models, and an autonomous **Solar AI Engineer** powered by Google Gemini.

---

## 🚀 Key Features

- **🌐 Interactive GIS Rooftop Mapper**: High-precision Leaflet map with multi-point polygon tracing, area (m²) calculation, and automatic PV capacity estimation.
- **⚡ Real-Time 3D Photovoltaic Simulation**: Three.js WebGL viewport with live sun azimuth/zenith raytracing, obstruction modeling, and tilt efficiency analytics.
- **🤖 Solar AI Engineer**: Interactive AI assistant powered by Gemini 2.0 Flash for system sizing, financial modeling, degradation rates, and technical solar guidance.
- **🔋 Energy Storage & Grid Dispatch**: Battery bank optimization, self-consumption vs grid export simulations, and peak load shaving analytics.
- **📊 Professional Solar Feasibility Reports**: Instant PDF/print-ready bankable feasibility reports complete with ROI, LCOE, payback periods, and CO₂ offset metrics.
- **📱 Touch & Mobile Optimized**: Complete mobile touch isolation, gesture locking, and responsive layout across all smartphones, tablets, and desktop displays.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [GSAP](https://greensock.com/gsap/)
- **3D Graphics & Physics**: [Three.js](https://threejs.org/)
- **Maps & Geolocation**: [Leaflet](https://leafletjs.com/), [React Leaflet](https://react-leaflet.js.org/)
- **AI Engine**: [Google Gen AI SDK (@google/genai)](https://www.npmjs.com/package/@google/genai)
- **Charts & Visuals**: [Recharts](https://recharts.org/), [Lucide React](https://lucide.dev/)

---

## 🏃 Getting Started

### Prerequisites

- Node.js 18.18+ or 20+
- npm, yarn, or bun
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nithyavardhanmacharla/solarvision-ai.git
   cd solarvision-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
