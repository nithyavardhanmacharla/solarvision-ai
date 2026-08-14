'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'te' | 'zh' | 'ja' | 'ar' | 'pt';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation
    'nav.overview': 'Overview',
    'nav.dashboard': 'Dashboard',
    'nav.mapExplorer': 'Map Explorer',
    'nav.forecast': 'AI Forecast & ML',
    'nav.financial': 'Financial & ROI',
    'nav.compare': 'Compare Sites',
    'nav.recommendations': 'AI Recommendations',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.savedSites': 'Saved Sites',
    'nav.aiEngineer': 'Solar AI Engineer',
    'nav.liveApi': 'Live API: Connected',
    'nav.computing': 'Computing...',
    'nav.selectLanguage': 'Select Language',

    // Settings Modal
    'settings.title': 'Application Settings',
    'settings.subtitle': 'Configure global preferences, language & measurement units',
    'settings.languageLabel': 'Select Application Language',
    'settings.unitLabel': 'Measurement Unit System',
    'settings.metric': 'Metric System (°C, m², m)',
    'settings.imperial': 'Imperial System (°F, sq ft, ft)',
    'settings.examplesTitle': 'Live Conversion Examples',
    'settings.persistedNote': 'Global preferences persisted across all views',
    'settings.applyClose': 'Apply & Close',

    // Common UI
    'common.location': 'Location',
    'common.capacity': 'Installed Capacity',
    'common.tilt': 'Panel Tilt Angle',
    'common.azimuth': 'Azimuth Direction',
    'common.panelType': 'Panel Cell Type',
    'common.dailyOutput': 'Daily Energy Output',
    'common.annualYield': 'Annual Production',
    'common.netSavings': '25-Yr Net Savings',
    'common.co2Offset': 'CO₂ Carbon Offset',
    'common.paybackPeriod': 'Payback Period',
    'common.roi': 'Return on Investment',
    'common.efficiency': 'System Efficiency',
    'common.exportReport': 'Export Full PDF Report',
    'common.instantForecast': 'Instant AI Forecast',
    'common.monocrystalline': 'Monocrystalline (High Efficiency)',
    'common.polycrystalline': 'Polycrystalline (Standard)',
    'common.thinFilm': 'Thin Film (Flexible)',
    'common.bifacial': 'Bifacial (Dual-Sided Glass)',

    // Direct string fallbacks
    'System Configuration': 'System Configuration',
    'PV Array & Physics Parameters': 'PV Array & Physics Parameters',
    'Auto Tilt': 'Auto Tilt',
    'Real-Time 3D Panel Simulation': 'Real-Time 3D Panel Simulation',
    'Installed System Capacity': 'Installed System Capacity',
    'Panel Technology': 'Panel Technology',
    'Tilt Angle': 'Tilt Angle',
    'Azimuth Angle': 'Azimuth Angle',
    'Solar Tracking Mode': 'Solar Tracking Mode',
    'Inverter Eff.': 'Inverter Eff.',
    'Soiling Loss': 'Soiling Loss',
    'Battery Storage (BESS)': 'Battery Storage (BESS)',
    'Current Power': 'Current Power',
    "Today's Yield": "Today's Yield",
    'Annual Production': 'Annual Production',
    '25-Yr Net Savings': '25-Yr Net Savings',
    'CO₂ Offset': 'CO₂ Offset',
    'System Efficiency': 'System Efficiency',
    'Sunrise': 'Sunrise',
    'Sunset': 'Sunset',
    'Day Length': 'Day Length',
    'Peak Solar Hours': 'Peak Solar Hours',
    'Ambient Temp': 'Ambient Temp',
    'Wind Speed': 'Wind Speed',
    'Launch Live Workstation': 'Launch Live Workstation',
    'Explore Interactive GIS Map': 'Explore Interactive GIS Map',
  },
  es: {
    // Navigation
    'nav.overview': 'Resumen',
    'nav.dashboard': 'Panel Principal',
    'nav.mapExplorer': 'Explorador de Mapas',
    'nav.forecast': 'Pronóstico IA y ML',
    'nav.financial': 'Finanzas y ROI',
    'nav.compare': 'Comparar Sitios',
    'nav.recommendations': 'Recomendaciones IA',
    'nav.reports': 'Informes',
    'nav.settings': 'Ajustes',
    'nav.savedSites': 'Sitios Guardados',
    'nav.aiEngineer': 'Ingeniero IA Solar',
    'nav.liveApi': 'API en Vivo: Conectado',
    'nav.computing': 'Calculando...',
    'nav.selectLanguage': 'Seleccionar Idioma',

    // Settings Modal
    'settings.title': 'Ajustes de la Aplicación',
    'settings.subtitle': 'Configura preferencias globales, idioma y unidades de medida',
    'settings.languageLabel': 'Seleccionar Idioma de la Aplicación',
    'settings.unitLabel': 'Sistema de Unidades de Medida',
    'settings.metric': 'Sistema Métrico (°C, m², m)',
    'settings.imperial': 'Sistema Imperial (°F, sq ft, ft)',
    'settings.examplesTitle': 'Ejemplos de Conversión en Vivo',
    'settings.persistedNote': 'Preferencias globales guardadas en todas las vistas',
    'settings.applyClose': 'Aplicar y Cerrar',

    // Common UI
    'common.location': 'Ubicación',
    'common.capacity': 'Capacidad Instalada',
    'common.tilt': 'Ángulo de Inclinación',
    'common.azimuth': 'Dirección de Azimut',
    'common.panelType': 'Tipo de Célula de Panel',
    'common.dailyOutput': 'Producción Diaria',
    'common.annualYield': 'Producción Anual',
    'common.netSavings': 'Ahorro Neto a 25 Años',
    'common.co2Offset': 'Reducción de CO₂',
    'common.paybackPeriod': 'Periodo de Amortización',
    'common.roi': 'Retorno de Inversión',
    'common.efficiency': 'Eficiencia del Sistema',
    'common.exportReport': 'Exportar Informe PDF',
    'common.instantForecast': 'Pronóstico IA Instantáneo',
    'common.monocrystalline': 'Monocristalino (Alta Eficiencia)',
    'common.polycrystalline': 'Policristalino (Estándar)',
    'common.thinFilm': 'Película Delgada (Flexible)',
    'common.bifacial': 'Bifacial (Doble Cristal)',

    // Direct string fallbacks
    'System Configuration': 'Configuración del Sistema',
    'PV Array & Physics Parameters': 'Parámetros Físicos y Arreglo Fotovoltaico',
    'Auto Tilt': 'Inclinación Auto',
    'Real-Time 3D Panel Simulation': 'Simulación 3D de Panel en Tiempo Real',
    'Installed System Capacity': 'Capacidad Instalada del Sistema',
    'Panel Technology': 'Tecnología de Paneles',
    'Tilt Angle': 'Ángulo de Inclinación',
    'Azimuth Angle': 'Ángulo de Azimut',
    'Solar Tracking Mode': 'Modo de Seguimiento Solar',
    'Inverter Eff.': 'Eficiencia del Inversor',
    'Soiling Loss': 'Pérdida por Suciedad',
    'Battery Storage (BESS)': 'Almacenamiento en Batería (BESS)',
    'Current Power': 'Potencia Actual',
    "Today's Yield": 'Rendimiento de Hoy',
    'Annual Production': 'Producción Anual',
    '25-Yr Net Savings': 'Ahorro Neto a 25 Años',
    'CO₂ Offset': 'Reducción de CO₂',
    'System Efficiency': 'Eficiencia del Sistema',
    'Sunrise': 'Amanecer',
    'Sunset': 'Atardecer',
    'Day Length': 'Duración del Día',
    'Peak Solar Hours': 'Horas Solares Pico',
    'Ambient Temp': 'Temp. Ambiente',
    'Wind Speed': 'Velocidad del Viento',
    'Launch Live Workstation': 'Iniciar Estación en Vivo',
    'Explore Interactive GIS Map': 'Explorar Mapa GIS Interactivo',
  },
  fr: {
    // Navigation
    'nav.overview': 'Aperçu',
    'nav.dashboard': 'Tableau de Bord',
    'nav.mapExplorer': 'Explorateur de Carte',
    'nav.forecast': 'Prévision IA & ML',
    'nav.financial': 'Finances & ROI',
    'nav.compare': 'Comparer les Sites',
    'nav.recommendations': 'Recommandations IA',
    'nav.reports': 'Rapports',
    'nav.settings': 'Paramètres',
    'nav.savedSites': 'Sites Sauvegardés',
    'nav.aiEngineer': 'Ingénieur IA Solaire',
    'nav.liveApi': 'API en Direct: Connecté',
    'nav.computing': 'Calcul en cours...',
    'nav.selectLanguage': 'Choisir la Langue',

    // Settings Modal
    'settings.title': 'Paramètres de l\'Application',
    'settings.subtitle': 'Configurez les préférences globales, la langue et les unités',
    'settings.languageLabel': 'Sélectionner la Langue de l\'Application',
    'settings.unitLabel': 'Système d\'Unités de Mesure',
    'settings.metric': 'Système Métrique (°C, m², m)',
    'settings.imperial': 'Système Impérial (°F, sq ft, ft)',
    'settings.examplesTitle': 'Exemples de Conversion en Direct',
    'settings.persistedNote': 'Préférences globales enregistrées dans toutes les vues',
    'settings.applyClose': 'Appliquer et Fermer',

    // Common UI
    'common.location': 'Emplacement',
    'common.capacity': 'Puissance Installée',
    'common.tilt': 'Angle d\'Inclinaison',
    'common.azimuth': 'Direction d\'Azimut',
    'common.panelType': 'Type de Cellule Solaire',
    'common.dailyOutput': 'Production Quotidienne',
    'common.annualYield': 'Production Annuelle',
    'common.netSavings': 'Économies Nettes sur 25 ans',
    'common.co2Offset': 'Compensations de CO₂',
    'common.paybackPeriod': 'Période de Retour',
    'common.roi': 'Retour sur Investissement',
    'common.efficiency': 'Efficacité du Système',
    'common.exportReport': 'Exporter le Rapport PDF',
    'common.instantForecast': 'Prévision IA Instantanée',
    'common.monocrystalline': 'Monocristallin (Haute Efficacité)',
    'common.polycrystalline': 'Polycristallin (Standard)',
    'common.thinFilm': 'Couche Mince (Flexible)',
    'common.bifacial': 'Bifacial (Double Verre)',

    // Direct string fallbacks
    'System Configuration': 'Configuration du Système',
    'PV Array & Physics Parameters': 'Champ Photovoltaïque & Paramètres Physiques',
    'Auto Tilt': 'Inclinaison Auto',
    'Real-Time 3D Panel Simulation': 'Simulation 3D du Panneau en Temps Réel',
    'Installed System Capacity': 'Capacité Système Installée',
    'Panel Technology': 'Technologie des Panneaux',
    'Tilt Angle': 'Angle d\'Inclinaison',
    'Azimuth Angle': 'Angle d\'Azimut',
    'Solar Tracking Mode': 'Mode de Suivi Solaire',
    'Inverter Eff.': 'Rendement de l\'Onduleur',
    'Soiling Loss': 'Pertes par Salissure',
    'Battery Storage (BESS)': 'Stockage par Batterie (BESS)',
    'Current Power': 'Puissance Actuelle',
    "Today's Yield": 'Production du Jour',
    'Annual Production': 'Production Annuelle',
    '25-Yr Net Savings': 'Économies Nettes 25 ans',
    'CO₂ Offset': 'Offset CO₂',
    'System Efficiency': 'Efficacité du Système',
    'Sunrise': 'Lever du Soleil',
    'Sunset': 'Coucher du Soleil',
    'Day Length': 'Durée du Jour',
    'Peak Solar Hours': 'Heures de Pointe Solaire',
    'Ambient Temp': 'Température Ambiante',
    'Wind Speed': 'Vitesse du Vent',
    'Launch Live Workstation': 'Lancer le Simulateur',
    'Explore Interactive GIS Map': 'Explorer la Carte SIG',
  },
  de: {
    // Navigation
    'nav.overview': 'Übersicht',
    'nav.dashboard': 'Dashboard',
    'nav.mapExplorer': 'Karten-Explorer',
    'nav.forecast': 'KI-Prognose & ML',
    'nav.financial': 'Finanzen & ROI',
    'nav.compare': 'Standorte Vergleichen',
    'nav.recommendations': 'KI-Empfehlungen',
    'nav.reports': 'Berichte',
    'nav.settings': 'Einstellungen',
    'nav.savedSites': 'Gespeicherte Orte',
    'nav.aiEngineer': 'Solar KI-Ingenieur',
    'nav.liveApi': 'Live-API: Verbunden',
    'nav.computing': 'Berechnung läuft...',
    'nav.selectLanguage': 'Sprache Auswählen',

    // Settings Modal
    'settings.title': 'Anwendungseinstellungen',
    'settings.subtitle': 'Globale Einstellungen, Sprache und Maßeinheiten konfigurieren',
    'settings.languageLabel': 'Anwendungssprache Auswählen',
    'settings.unitLabel': 'Maßeinheitensystem',
    'settings.metric': 'Metrisches System (°C, m², m)',
    'settings.imperial': 'Imperiales System (°F, sq ft, ft)',
    'settings.examplesTitle': 'Beispiele für Live-Konvertierung',
    'settings.persistedNote': 'Globale Einstellungen in allen Ansichten gespeichert',
    'settings.applyClose': 'Anwenden & Schließen',

    // Common UI
    'common.location': 'Standort',
    'common.capacity': 'Installierte Leistung',
    'common.tilt': 'Neigungswinkel',
    'common.azimuth': 'Azimut-Ausrichtung',
    'common.panelType': 'Modulzelltyp',
    'common.dailyOutput': 'Tagesertrag',
    'common.annualYield': 'Jahresertrag',
    'common.netSavings': '25-Jahre Nettoeinsparung',
    'common.co2Offset': 'CO₂-Einsparung',
    'common.paybackPeriod': 'Amortisationszeit',
    'common.roi': 'Kapitalrendite (ROI)',
    'common.efficiency': 'Systemwirkungsgrad',
    'common.exportReport': 'Vollständigen PDF-Bericht Exportieren',
    'common.instantForecast': 'Sofortige KI-Prognose',
    'common.monocrystalline': 'Monokristallin (Hohe Effizienz)',
    'common.polycrystalline': 'Polykristallin (Standard)',
    'common.thinFilm': 'Dünnschicht (Flexibel)',
    'common.bifacial': 'Bifazial (Doppelglas)',

    // Direct string fallbacks
    'System Configuration': 'Systemkonfiguration',
    'PV Array & Physics Parameters': 'Photovoltaik-Array & Physikalische Parameter',
    'Auto Tilt': 'Auto-Neigung',
    'Real-Time 3D Panel Simulation': 'Echtzeit-3D-Modulsimulation',
    'Installed System Capacity': 'Installierte Systemkapazität',
    'Panel Technology': 'Modultechnologie',
    'Tilt Angle': 'Neigungswinkel',
    'Azimuth Angle': 'Azimutwinkel',
    'Solar Tracking Mode': 'Sonnenverfolgungsmodus',
    'Inverter Eff.': 'Wechselrichterwirkungsgrad',
    'Soiling Loss': 'Verschmutzungsverlust',
    'Battery Storage (BESS)': 'Batteriespeicher (BESS)',
    'Current Power': 'Aktuelle Leistung',
    "Today's Yield": 'Tagesertrag',
    'Annual Production': 'Jahresertrag',
    '25-Yr Net Savings': '25-Jahre Nettoeinsparung',
    'CO₂ Offset': 'CO₂-Einsparung',
    'System Efficiency': 'Systemwirkungsgrad',
    'Sunrise': 'Sonnenaufgang',
    'Sunset': 'Sonnenuntergang',
    'Day Length': 'Tageslänge',
    'Peak Solar Hours': 'Spitzensonnenstunden',
    'Ambient Temp': 'Umgebungstemperatur',
    'Wind Speed': 'Windgeschwindigkeit',
    'Launch Live Workstation': 'Live-Simulator Starten',
    'Explore Interactive GIS Map': 'Interaktive GIS-Karte Erkunden',
  },
  hi: {
    // Navigation
    'nav.overview': 'अवलोकन',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.mapExplorer': 'मानचित्र एक्सप्लोरर',
    'nav.forecast': 'एआई पूर्वानुमान और एमएल',
    'nav.financial': 'वित्तीय और आरओआई',
    'nav.compare': 'साइटों की तुलना करें',
    'nav.recommendations': 'एआई सिफारिशें',
    'nav.reports': 'रिपोर्ट्स',
    'nav.settings': 'सेटिंग्स',
    'nav.savedSites': 'सहेजी गई साइटें',
    'nav.aiEngineer': 'सोलर एआई इंजीनियर',
    'nav.liveApi': 'लाइव एपीआई: कनेक्टेड',
    'nav.computing': 'गणना जारी है...',
    'nav.selectLanguage': 'भाषा चुनें',

    // Settings Modal
    'settings.title': 'एप्लिकेशन सेटिंग्स',
    'settings.subtitle': 'वैश्विक प्राथमिकताएं, भाषा और माप इकाइयां कॉन्फ़िगर करें',
    'settings.languageLabel': 'एप्लिकेशन भाषा चुनें',
    'settings.unitLabel': 'माप इकाई प्रणाली',
    'settings.metric': 'मीट्रिक प्रणाली (°C, m², m)',
    'settings.imperial': 'इंपीरियल प्रणाली (°F, sq ft, ft)',
    'settings.examplesTitle': 'लाइव रूपांतरण उदाहरण',
    'settings.persistedNote': 'वैश्विक प्राथमिकताएं सभी दृश्यों में सहेजी गईं',
    'settings.applyClose': 'लागू करें और बंद करें',

    // Common UI
    'common.location': 'स्थान',
    'common.capacity': 'स्थापित क्षमता',
    'common.tilt': 'पैनल झुकाव कोण',
    'common.azimuth': 'दिगंश दिशा (अज़ीमुथ)',
    'common.panelType': 'पैनल सेल प्रकार',
    'common.dailyOutput': 'दैनिक ऊर्जा उत्पादन',
    'common.annualYield': 'वार्षिक उत्पादन',
    'common.netSavings': '25-वर्षीय शुद्ध बचत',
    'common.co2Offset': 'CO₂ कार्बन ऑफसेट',
    'common.paybackPeriod': 'भुगतान अवधि',
    'common.roi': 'निवेश पर लाभ (ROI)',
    'common.efficiency': 'सिस्टम दक्षता',
    'common.exportReport': 'पूर्ण पीडीएफ रिपोर्ट निर्यात करें',
    'common.instantForecast': 'त्वरित एआई पूर्वानुमान',
    'common.monocrystalline': 'मोनोक्रिस्टलाइन (उच्च दक्षता)',
    'common.polycrystalline': 'पॉलीक्रिस्टलाइन (मानक)',
    'common.thinFilm': 'पतली फिल्म (लचीला)',
    'common.bifacial': 'बायफेशियल (दोहरा कांच)',

    // Direct string fallbacks
    'System Configuration': 'सिस्टम कॉन्फ़िगरेशन',
    'PV Array & Physics Parameters': 'पीवी एरे और भौतिक पैरामीटर',
    'Auto Tilt': 'स्वचालित झुकाव',
    'Real-Time 3D Panel Simulation': 'रियल-टाइम 3D पैनल सिमुलेशन',
    'Installed System Capacity': 'स्थापित सिस्टम क्षमता',
    'Panel Technology': 'पैनल तकनीक',
    'Tilt Angle': 'झुकाव कोण',
    'Azimuth Angle': 'अज़ीमुथ कोण',
    'Solar Tracking Mode': 'सोलर ट्रैकिंग मोड',
    'Inverter Eff.': 'इन्वर्टर दक्षता',
    'Soiling Loss': 'धूल/गंदगी हानि',
    'Battery Storage (BESS)': 'बैटरी स्टोरेज (BESS)',
    'Current Power': 'वर्तमान शक्ति',
    "Today's Yield": 'आज का उत्पादन',
    'Annual Production': 'वार्षिक उत्पादन',
    '25-Yr Net Savings': '25-वर्षीय शुद्ध बचत',
    'CO₂ Offset': 'CO₂ ऑफसेट',
    'System Efficiency': 'सिस्टम दक्षता',
    'Sunrise': 'सूर्योदय',
    'Sunset': 'सूर्यास्त',
    'Day Length': 'दिन की अवधि',
    'Peak Solar Hours': 'पीक सोलर घंटे',
    'Ambient Temp': 'पर्यावरण तापमान',
    'Wind Speed': 'हवा की गति',
    'Launch Live Workstation': 'लाइव वर्कस्टेशन शुरू करें',
    'Explore Interactive GIS Map': 'इंटरएक्टिव जीआईएस मैप देखें',
  },
  te: {
    // Navigation
    'nav.overview': 'అవలోకనం',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.mapExplorer': 'మ్యాప్ ఎక్స్‌ప్లోరర్',
    'nav.forecast': 'AI అంచనా & ML',
    'nav.financial': 'ఆర్థిక & ROI',
    'nav.compare': 'సైట్‌లను పోల్చండి',
    'nav.recommendations': 'AI సిఫార్సులు',
    'nav.reports': 'నివేదికలు',
    'nav.settings': 'సెట్టింగ్‌లు',
    'nav.savedSites': 'సేవ్ చేసిన సైట్లు',
    'nav.aiEngineer': 'సోలార్ AI ఇంజనీర్',
    'nav.liveApi': 'లైవ్ API: కనెక్ట్ చేయబడింది',
    'nav.computing': 'లెక్కిస్తోంది...',
    'nav.selectLanguage': 'భాషను ఎంచుకోండి',

    // Settings Modal
    'settings.title': 'అప్లికేషన్ సెట్టింగ్‌లు',
    'settings.subtitle': 'భాష మరియు కొలత యూనిట్‌లను కాన్ఫిగర్ చేయండి',
    'settings.languageLabel': 'అప్లికేషన్ భాషను ఎంచుకోండి',
    'settings.unitLabel': 'కొలత యూనిట్ వ్యవస్థ',
    'settings.metric': 'మెట్రిక్ వ్యవస్థ (°C, m², m)',
    'settings.imperial': 'ఇంపీరియల్ వ్యవస్థ (°F, sq ft, ft)',
    'settings.examplesTitle': 'లైవ్ మార్పిడి ఉదాహరణలు',
    'settings.persistedNote': 'గ్లోబల్ ప్రాధాన్యతలు సేవ్ చేయబడ్డాయి',
    'settings.applyClose': 'వర్తింపజేసి ముగించు',

    // Common UI
    'common.location': 'ప్రాంతం',
    'common.capacity': 'స్థాపిత సామర్థ్యం',
    'common.tilt': 'ప్యానెల్ వంపు కోణం',
    'common.azimuth': 'అజిముత్ దిశ',
    'common.panelType': 'ప్యానెల్ రకం',
    'common.dailyOutput': 'రోజువారీ శక్తి ఉత్పత్తి',
    'common.annualYield': 'సంవత్సరపు మొత్తం ఉత్పత్తి',
    'common.netSavings': '25 సంవత్సరాల నికర పొదుపు',
    'common.co2Offset': 'CO₂ తగ్గింపు',
    'common.paybackPeriod': 'తిరిగి చెల్లించే వ్యవధి',
    'common.roi': 'పెట్టుబడిపై లాభం (ROI)',
    'common.efficiency': 'సిస్టమ్ సమర్థత',
    'common.exportReport': 'పూర్తి PDF నివేదికను డౌన్‌లోడ్ చేయండి',
    'common.instantForecast': 'తక్షణ AI అంచనా',
    'common.monocrystalline': 'మోనోక్రిస్టలైన్ (అధిక సమర్థత)',
    'common.polycrystalline': 'పాలికిస్టలైన్ (సాధారణ)',
    'common.thinFilm': 'సన్నని ఫిల్మ్ (ఫ్లెక్సిబుల్)',
    'common.bifacial': 'బైఫేషియల్ (ద్విముఖ గ్లాస్)',

    // Direct string fallbacks
    'System Configuration': 'సిస్టమ్ కాన్ఫిగరేషన్',
    'PV Array & Physics Parameters': 'పివి శ్రేణి మరియు భౌతిక పారామితులు',
    'Auto Tilt': 'ఆటో వంపు కోణం',
    'Real-Time 3D Panel Simulation': 'రియల్-టైమ్ 3D ప్యానెల్ సిమ్యులేషన్',
    'Installed System Capacity': 'స్థాపిత సిస్టమ్ సామర్థ్యం',
    'Panel Technology': 'ప్యానెల్ సాంకేతికత',
    'Tilt Angle': 'వంపు కోణం (Tilt)',
    'Azimuth Angle': 'అజిముత్ కోణం',
    'Solar Tracking Mode': 'సోలార్ ట్రాకింగ్ మోడ్',
    'Inverter Eff.': 'ఇన్వర్టర్ సమర్థత',
    'Soiling Loss': 'దుమ్ము నష్టం',
    'Battery Storage (BESS)': 'బ్యాటరీ నిల్వ (BESS)',
    'Current Power': 'ప్రస్తుత విద్యుత్',
    "Today's Yield": 'ఈరోజు ఉత్పత్తి',
    'Annual Production': 'సంవత్సరపు ఉత్పత్తి',
    '25-Yr Net Savings': '25 ఏళ్ల నికర పొదుపు',
    'CO₂ Offset': 'CO₂ తగ్గింపు',
    'System Efficiency': 'సిస్టమ్ సమర్థత',
    'Sunrise': 'సూర్యోదయం',
    'Sunset': 'సూర్యాస్తమయం',
    'Day Length': 'పగటి సమయం',
    'Peak Solar Hours': 'అత్యధిక సూర్యకాంతి గంటలు',
    'Ambient Temp': 'పరిసర ఉష్ణోగ్రత',
    'Wind Speed': 'గాలి వేగం',
    'Launch Live Workstation': 'లైవ్ సిమ్యులేటర్‌ను ప్రారంభించండి',
    'Explore Interactive GIS Map': 'ఇంటరాక్టివ్ GIS మ్యాప్‌ను చూడండి',
  },
  zh: {
    // Navigation
    'nav.overview': '总览',
    'nav.dashboard': '仪表板',
    'nav.mapExplorer': '地图探索',
    'nav.forecast': 'AI 预测与 ML',
    'nav.financial': '财务与 ROI',
    'nav.compare': '对比站点',
    'nav.recommendations': 'AI 推荐',
    'nav.reports': '报告生成',
    'nav.settings': '设置',
    'nav.savedSites': '已存站点',
    'nav.aiEngineer': '光伏 AI 工程师',
    'nav.liveApi': '实时 API: 已连接',
    'nav.computing': '计算中...',
    'nav.selectLanguage': '选择语言',

    // Settings Modal
    'settings.title': '应用设置',
    'settings.subtitle': '配置全局偏好、语言和测量单位',
    'settings.languageLabel': '选择应用程序语言',
    'settings.unitLabel': '测量单位系统',
    'settings.metric': '公制单位 (°C, m², m)',
    'settings.imperial': '英制单位 (°F, sq ft, ft)',
    'settings.examplesTitle': '实时转换示例',
    'settings.persistedNote': '全局偏好已在所有视图中自动保存',
    'settings.applyClose': '应用并关闭',

    // Common UI
    'common.location': '位置',
    'common.capacity': '装机容量',
    'common.tilt': '组件倾角',
    'common.azimuth': '方位角',
    'common.panelType': '电池板类型',
    'common.dailyOutput': '日均发电量',
    'common.annualYield': '年总发电量',
    'common.netSavings': '25年净节省',
    'common.co2Offset': 'CO₂ 减排量',
    'common.paybackPeriod': '回收期',
    'common.roi': '投资回报率',
    'common.efficiency': '系统效率',
    'common.exportReport': '导出完整 PDF 报告',
    'common.instantForecast': '即时 AI 预测',
    'common.monocrystalline': '单晶硅 (高效型)',
    'common.polycrystalline': '多晶硅 (标准型)',
    'common.thinFilm': '薄膜 (柔性型)',
    'common.bifacial': '双面发电 (双玻型)',

    // Direct string fallbacks
    'System Configuration': '系统参数配置',
    'PV Array & Physics Parameters': '光伏阵列与物理参数',
    'Auto Tilt': '自动倾角',
    'Real-Time 3D Panel Simulation': '实时 3D 组件仿真',
    'Installed System Capacity': '系统装机容量',
    'Panel Technology': '组件技术规格',
    'Tilt Angle': '安装倾角',
    'Azimuth Angle': '方位角',
    'Solar Tracking Mode': '太阳跟踪模式',
    'Inverter Eff.': '逆变器效率',
    'Soiling Loss': '灰尘遮挡损失',
    'Battery Storage (BESS)': '储能电池系统 (BESS)',
    'Current Power': '当前功率',
    "Today's Yield": '今日发电量',
    'Annual Production': '年发电总量',
    '25-Yr Net Savings': '25年累计净收益',
    'CO₂ Offset': 'CO₂ 减排量',
    'System Efficiency': '系统总效率',
    'Sunrise': '日出时间',
    'Sunset': '日落时间',
    'Day Length': '日照时长',
    'Peak Solar Hours': '峰值日照时数',
    'Ambient Temp': '环境温度',
    'Wind Speed': '风速',
    'Launch Live Workstation': '启动实时工作站',
    'Explore Interactive GIS Map': '探索交互式 GIS 地图',
  },
  ja: {
    // Navigation
    'nav.overview': '概要',
    'nav.dashboard': 'ダッシュボード',
    'nav.mapExplorer': 'マップ探索',
    'nav.forecast': 'AI 予測 & ML',
    'nav.financial': '収支 & ROI',
    'nav.compare': 'サイト比較',
    'nav.recommendations': 'AI 推奨事項',
    'nav.reports': 'レポート',
    'nav.settings': '設定',
    'nav.savedSites': '保存したサイト',
    'nav.aiEngineer': '太陽光 AI エンジニア',
    'nav.liveApi': 'ライブ API: 接続済み',
    'nav.computing': '計算中...',
    'nav.selectLanguage': '言語を選択',

    // Settings Modal
    'settings.title': 'アプリケーション設定',
    'settings.subtitle': '全体設定、言語、単位系のカスタマイズ',
    'settings.languageLabel': '表示言語を選択',
    'settings.unitLabel': '測定単位系',
    'settings.metric': 'メートル法 (°C, m², m)',
    'settings.imperial': 'ヤード・ポンド法 (°F, sq ft, ft)',
    'settings.examplesTitle': 'リアルタイム変換例',
    'settings.persistedNote': '設定はすべての画面で自動保存されます',
    'settings.applyClose': '適用して閉じる',

    // Common UI
    'common.location': '設置場所',
    'common.capacity': '設置容量',
    'common.tilt': 'パネル傾斜角',
    'common.azimuth': '方位角',
    'common.panelType': 'セルタイプ',
    'common.dailyOutput': '1日あたりの発電量',
    'common.annualYield': '年間発電量',
    'common.netSavings': '25年間の純削減額',
    'common.co2Offset': 'CO₂ 削減量',
    'common.paybackPeriod': '回収期間',
    'common.roi': '投資回収率 (ROI)',
    'common.efficiency': 'システム効率',
    'common.exportReport': 'PDF レポートを出力',
    'common.instantForecast': '即时 AI 発電予測',
    'common.monocrystalline': '単結晶 (高効率)',
    'common.polycrystalline': '多結晶 (標準)',
    'common.thinFilm': '薄膜 (フレキシブル)',
    'common.bifacial': '両面発電 (ダブルガラス)',

    // Direct string fallbacks
    'System Configuration': 'システム設定',
    'PV Array & Physics Parameters': 'PV アレイ & 物理パラメータ',
    'Auto Tilt': '自動傾斜設定',
    'Real-Time 3D Panel Simulation': 'リアルタイム 3D パネルシミュレーション',
    'Installed System Capacity': 'システム設置容量',
    'Panel Technology': 'パネルセル技術',
    'Tilt Angle': 'パネル傾斜角',
    'Azimuth Angle': '方位角',
    'Solar Tracking Mode': '追尾架台モード',
    'Inverter Eff.': 'パワコン効率',
    'Soiling Loss': '汚れ・減衰損失',
    'Battery Storage (BESS)': '蓄電池システム (BESS)',
    'Current Power': '現在の発電電力',
    "Today's Yield": '本日の発電量',
    'Annual Production': '年間発電量',
    '25-Yr Net Savings': '25年間の純削減額',
    'CO₂ Offset': 'CO₂ 削減量',
    'System Efficiency': 'システム効率',
    'Sunrise': '日の出',
    'Sunset': '日の入り',
    'Day Length': '昼の長さ',
    'Peak Solar Hours': 'ピーク日照時間',
    'Ambient Temp': '外気温度',
    'Wind Speed': '風速',
    'Launch Live Workstation': 'ライブシミュレーターを開始',
    'Explore Interactive GIS Map': 'GIS マップを開く',
  },
  ar: {
    // Navigation
    'nav.overview': 'نظرة عامة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.mapExplorer': 'مستكشف الخريطة',
    'nav.forecast': 'توقعات الذكاء الاصطناعي',
    'nav.financial': 'التحليل المالي والعائد',
    'nav.compare': 'مقارنة المواقع',
    'nav.recommendations': 'توصيات الذكاء الاصطناعي',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',
    'nav.savedSites': 'المواقع المحفوظة',
    'nav.aiEngineer': 'مهندس الطاقة الشمسية',
    'nav.liveApi': 'المباشر: متصل',
    'nav.computing': 'جاري الحساب...',
    'nav.selectLanguage': 'اختر اللغة',

    // Settings Modal
    'settings.title': 'إعدادات التطبيق',
    'settings.subtitle': 'تخصيص التفضيلات العامة، اللغة ووحدات القياس',
    'settings.languageLabel': 'اختر لغة التطبيق',
    'settings.unitLabel': 'نظام وحدات القياس',
    'settings.metric': 'النظام المترية (°C, m², m)',
    'settings.imperial': 'النظام الإمبراطوري (°F, sq ft, ft)',
    'settings.examplesTitle': 'أمثلة التحويل المباشر',
    'settings.persistedNote': 'تم حفظ التفضيلات في جميع الشاشات',
    'settings.applyClose': 'تطبيق وإغلاق',

    // Common UI
    'common.location': 'الموقع',
    'common.capacity': 'القدرة المركبة',
    'common.tilt': 'زاوية الميل',
    'common.azimuth': 'اتجاه السمت',
    'common.panelType': 'نوع الخلايا الشمسية',
    'common.dailyOutput': 'الإنتاج اليومي للطاقة',
    'common.annualYield': 'الإنتاج السنوي',
    'common.netSavings': 'صافي التوفير لـ 25 سنة',
    'common.co2Offset': 'خفض انبعاثات الكربون',
    'common.paybackPeriod': 'فترة استرداد رأس المال',
    'common.roi': 'عائد الاستثمار',
    'common.efficiency': 'كفاءة النظام',
    'common.exportReport': 'تصدير تقرير PDF كامل',
    'common.instantForecast': 'توقعات فورية بالذكاء الاصطناعي',
    'common.monocrystalline': 'أحادية البلورة (كفاءة عالية)',
    'common.polycrystalline': 'متعددة البلورات (قياسي)',
    'common.thinFilm': 'الفيلم الدقيق (مرن)',
    'common.bifacial': 'مزدوج الوجه (زجاج مزدوج)',

    // Direct string fallbacks
    'System Configuration': 'تكوين النظام',
    'PV Array & Physics Parameters': 'مصفوفة الألواح والمعايير الفيزيائية',
    'Auto Tilt': 'الإمالة التلقائية',
    'Real-Time 3D Panel Simulation': 'محاكاة الألواح ثلاثية الأبعاد المباشرة',
    'Installed System Capacity': 'قدرة النظام المركبة',
    'Panel Technology': 'تقنية الألواح',
    'Tilt Angle': 'زاوية الميل',
    'Azimuth Angle': 'زاوية السمت',
    'Solar Tracking Mode': 'وضع تتبع الشمس',
    'Inverter Eff.': 'كفاءة المحول',
    'Soiling Loss': 'خسائر الغبار واللاتساخ',
    'Battery Storage (BESS)': 'تخزين البطارية (BESS)',
    'Current Power': 'الطاقة الحالية',
    "Today's Yield": 'إنتاج اليوم',
    'Annual Production': 'الإنتاج السنوي',
    '25-Yr Net Savings': 'صافي التوفير لـ 25 سنة',
    'CO₂ Offset': 'خفض الكربون',
    'System Efficiency': 'كفاءة النظام',
    'Sunrise': 'الشروق',
    'Sunset': 'الغروب',
    'Day Length': 'طول النهار',
    'Peak Solar Hours': 'ساعات الذروة الشمسية',
    'Ambient Temp': 'درجة الحرارة المحيطة',
    'Wind Speed': 'سرعة الرياح',
    'Launch Live Workstation': 'تشغيل محاكي النظام المباشر',
    'Explore Interactive GIS Map': 'استكشف خريطة نظم المعلومات الجغرافية',
  },
  pt: {
    // Navigation
    'nav.overview': 'Visão Geral',
    'nav.dashboard': 'Painel',
    'nav.mapExplorer': 'Explorador de Mapa',
    'nav.forecast': 'Previsão IA & ML',
    'nav.financial': 'Financeiro & ROI',
    'nav.compare': 'Comparar Locais',
    'nav.recommendations': 'Recomendações IA',
    'nav.reports': 'Relatórios',
    'nav.settings': 'Configurações',
    'nav.savedSites': 'Locais Salvos',
    'nav.aiEngineer': 'Engenheiro Solar IA',
    'nav.liveApi': 'API em Tempo Real: Conectado',
    'nav.computing': 'Calculando...',
    'nav.selectLanguage': 'Selecionar Idioma',

    // Settings Modal
    'settings.title': 'Configurações do Aplicativo',
    'settings.subtitle': 'Configure preferências globais, idioma e unidades de medida',
    'settings.languageLabel': 'Selecionar Idioma do Aplicativo',
    'settings.unitLabel': 'Sistema de Unidades de Medida',
    'settings.metric': 'Sistema Métrico (°C, m², m)',
    'settings.imperial': 'Sistema Imperial (°F, sq ft, ft)',
    'settings.examplesTitle': 'Exemplos de Conversão ao Vivo',
    'settings.persistedNote': 'Preferências globais salvas em todas as telas',
    'settings.applyClose': 'Aplicar e Fechar',

    // Common UI
    'common.location': 'Localização',
    'common.capacity': 'Capacidade Instalada',
    'common.tilt': 'Ângulo de Inclinação',
    'common.azimuth': 'Direção de Azimute',
    'common.panelType': 'Tipo de Célula de Painel',
    'common.dailyOutput': 'Geração Diária de Energia',
    'common.annualYield': 'Produção Anual',
    'common.netSavings': 'Economia Líquida em 25 Anos',
    'common.co2Offset': 'Redução de CO₂',
    'common.paybackPeriod': 'Prazo de Retorno',
    'common.roi': 'Retorno sobre o Investimento',
    'common.efficiency': 'Eficiência do Sistema',
    'common.exportReport': 'Exportar Relatório PDF Completo',
    'common.instantForecast': 'Previsão IA Instantânea',
    'common.monocrystalline': 'Monocristalino (Alta Eficiência)',
    'common.polycrystalline': 'Policristalino (Padrão)',
    'common.thinFilm': 'Filme Fino (Flexível)',
    'common.bifacial': 'Bifacial (Vidro Duplo)',

    // Direct string fallbacks
    'System Configuration': 'Configuração do Sistema',
    'PV Array & Physics Parameters': 'Parâmetros Físicos e do Arranjo Fotovoltaico',
    'Auto Tilt': 'Inclinação Auto',
    'Real-Time 3D Panel Simulation': 'Simulação 3D do Painel em Tempo Real',
    'Installed System Capacity': 'Capacidade Instalada do Sistema',
    'Panel Technology': 'Tecnologia de Painéis',
    'Tilt Angle': 'Ângulo de Inclinação',
    'Azimuth Angle': 'Ângulo de Azimute',
    'Solar Tracking Mode': 'Modo de Rastreamento Solar',
    'Inverter Eff.': 'Eficiência do Inversor',
    'Soiling Loss': 'Perda por Sujeira',
    'Battery Storage (BESS)': 'Armazenamento em Bateria (BESS)',
    'Current Power': 'Potência Atual',
    "Today's Yield": 'Geração de Hoje',
    'Annual Production': 'Produção Anual',
    '25-Yr Net Savings': 'Economia Líquida em 25 Anos',
    'CO₂ Offset': 'Redução de CO₂',
    'System Efficiency': 'Eficiência do Sistema',
    'Sunrise': 'Nascer do Sol',
    'Sunset': 'Pôr do Sol',
    'Day Length': 'Duração do Dia',
    'Peak Solar Hours': 'Horas de Sol Pico',
    'Ambient Temp': 'Temperatura Ambiente',
    'Wind Speed': 'Velocidade do Vento',
    'Launch Live Workstation': 'Iniciar Estação ao Vivo',
    'Explore Interactive GIS Map': 'Explorar Mapa GIS Interativo',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguageInfo: LanguageInfo;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'solarvision_language';

function subscribeLanguage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('solarvision_lang_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('solarvision_lang_change', callback);
  };
}

function getLanguageSnapshot(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as LanguageCode;
    if (saved && TRANSLATIONS[saved]) {
      return saved;
    }
  } catch (e) {}
  return 'en';
}

function getServerLanguageSnapshot(): LanguageCode {
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot
  );

  const setLanguage = (lang: LanguageCode) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('solarvision_lang_change'));
      }
    } catch (e) {}
  };

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Helper translation lookup function
  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict) {
      if (langDict[key]) return langDict[key];
      if (fallback && langDict[fallback]) return langDict[fallback];
    }
    // Fallback to English
    if (TRANSLATIONS['en']) {
      if (TRANSLATIONS['en'][key]) return TRANSLATIONS['en'][key];
      if (fallback && TRANSLATIONS['en'][fallback]) return TRANSLATIONS['en'][fallback];
    }
    return fallback || key;
  };

  // Sync document html dir attribute for RTL support (Arabic)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = currentLanguageInfo.dir === 'rtl' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, currentLanguageInfo]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguageInfo, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
