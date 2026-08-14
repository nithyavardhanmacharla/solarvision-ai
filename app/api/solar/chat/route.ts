import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getGeminiClient, isGeminiKeyConfigured, GEMINI_MODEL_FAST } from '@/lib/gemini';

function generateSolarEngineerFallbackResponse(message: string, siteContext?: any): string {
  const query = message.toLowerCase().trim();
  const locationName = siteContext?.location?.city
    ? `${siteContext.location.city}, ${siteContext.location.country || ''}`
    : 'your site';
  const lat = siteContext?.location?.lat || 17.385;
  const capKw = siteContext?.systemConfig?.capacityKw || 10;
  const annualMwh = siteContext?.solarResult?.annualEnergyMwh || (capKw * 1.5).toFixed(1);
  const pr = siteContext?.solarResult?.performanceRatioPercent || 81.5;

  // 1. GREETINGS & INTRODUCTIONS
  if (/^(hi+|hello|hey+|greetings|good\s*(morning|afternoon|evening)|hola|howdy|sup)(\s+|$)/i.test(query) || query.includes('who are you') || query.includes('help')) {
    return `⚡ Quick Summary:
Hello! I am your Solar AI Engineer Assistant for **${locationName}**.

📊 Your System Context:
• Array Size: **${capKw} kWp**
• Annual Generation: **${annualMwh} MWh/yr**
• Performance Ratio: **${pr}%**

💡 How I Can Help You Today:
• Ask about payback period & monthly electric bill savings
• Ask for optimal panel tilt & compass azimuth direction
• Ask about battery backup sizing for power outages
• Ask about panel technology (TOPCon vs Mono-PERC vs Bifacial)`;
  }

  // 2. TILT, AZIMUTH, ORIENTATION, ANGLE
  if (query.includes('tilt') || query.includes('angle') || query.includes('azimuth') || query.includes('direction') || query.includes('facing') || query.includes('orient')) {
    const optTilt = Math.max(10, Math.min(60, Math.round(Math.abs(lat))));
    const optAzimuth = lat >= 0 ? 'True South (180°)' : 'True North (0°)';
    return `⚡ Quick Summary:
For ${locationName} (Latitude ${lat.toFixed(2)}°), your solar panels produce maximum power when tilted at **${optTilt}°** facing **${optAzimuth}**.

📐 Solar Geometry Details:
• Optimal Roof Tilt: **${optTilt}°** from horizontal.
• Optimal Orientation: **${optAzimuth}** to capture all-day sunlight.
• Seasonal Yield Tip: A flatter tilt (+0° to +15°) boosts summer generation, while a steeper tilt (+25° to +35°) boosts winter yield.
• Tracking Gain: Single-axis trackers increase annual energy production by **+20% to +25%**.`;
  }

  // 3. PANEL TECHNOLOGY & MODULE EFFICIENCY
  if (query.includes('panel') || query.includes('perc') || query.includes('topcon') || query.includes('bifacial') || query.includes('tech') || query.includes('module') || query.includes('efficiency')) {
    return `⚡ Quick Summary:
For your **${capKw} kWp** installation in ${locationName}, **TOPCon** or **Mono-PERC** panels deliver the ideal balance of efficiency and ROI.

☀️ Panel Options Comparison:
• TOPCon (Recommended): ~22.5% efficiency with low heat loss (-0.30%/°C).
• Monocrystalline PERC: ~20.5% efficiency. Tried-and-tested standard for residential roofs.
• Bifacial Panels: Double-sided glass captures reflected ground light (+10% extra power on bright roofs).
• Thin-Film: Flexible panels suitable for delicate roofs, but require ~40% more roof space.`;
  }

  // 4. POWER LOSSES, HEAT, SOILING, DUST
  if (query.includes('loss') || query.includes('heat') || query.includes('temp') || query.includes('clean') || query.includes('dust') || query.includes('wash') || query.includes('dirty') || query.includes('shade')) {
    return `⚡ Quick Summary:
System losses average ~12% to 18%. High temperatures and dust accumulation are the main factors reducing daily power output.

🔍 Power Loss Breakdown for ${locationName}:
• Heat Derating (-4% to -8%): Cell output drops slightly when temperatures exceed 25°C.
• Dust & Soiling (-3% to -6%): Cleaning panels twice a year recovers up to +6% lost energy.
• Inverter Efficiency (-2%): Converts DC solar power to AC household electricity at 98% efficiency.
• Cable Resistance (-1.5%): Using 6mm² solar DC cables minimizes line loss.`;
  }

  // 5. FINANCIALS, COST, SAVINGS, PAYBACK, ROI, BILLS
  if (query.includes('cost') || query.includes('price') || query.includes('sav') || query.includes('roi') || query.includes('payback') || query.includes('money') || query.includes('inr') || query.includes('bill') || query.includes('rupee')) {
    const estSavingsYr = Math.round(annualMwh * 1000 * 8); // ₹8 per kWh
    return `⚡ Quick Summary:
Your **${capKw} kWp** solar system will pay for itself in **3.5 to 4.8 years**, generating ~**₹${estSavingsYr.toLocaleString('en-IN')}** in electric bill savings every year!

💰 Financial Performance Summary:
• Annual Generation: **${annualMwh} MWh** (~${Math.round(annualMwh * 1000 / 12)} kWh/month).
• Estimated Annual Savings: **~₹${estSavingsYr.toLocaleString('en-IN')} / year**.
• Payback Period: **3.5 to 4.8 Years**.
• 25-Year Lifetime Net Savings: **₹15,00,000+** net financial return over the panel warranty period.`;
  }

  // 6. BATTERY, STORAGE, BACKUP, BESS, OUTAGE
  if (query.includes('battery') || query.includes('storage') || query.includes('backup') || query.includes('bess') || query.includes('kwh') || query.includes('night') || query.includes('outage') || query.includes('powercut')) {
    const recBattery = Math.round(capKw * 1.5);
    return `⚡ Quick Summary:
We recommend pairing your **${capKw} kWp** solar array with a **${recBattery} kWh Lithium (LFP)** battery storage bank.

🔋 Battery & Storage Strategy:
• Recommended Battery Size: **${recBattery} kWh** LFP battery.
• Self-Consumption Boost: Increases your solar self-consumption ratio from 45% up to **85%+**.
• Outage Resilience: Powers critical household loads (lights, fans, refrigerator, WiFi) overnight during grid outages.
• Peak Shaving: Charges from solar during daytime and powers your home during evening peak tariff hours.`;
  }

  // 7. ROOFTOP AREA, SPACE, LAND
  if (query.includes('roof') || query.includes('space') || query.includes('area') || query.includes('sqft') || query.includes('sqm') || query.includes('land') || query.includes('house')) {
    const reqAreaSqm = Math.round(capKw * 6.5);
    const reqAreaSqft = Math.round(reqAreaSqm * 10.764);
    return `⚡ Quick Summary:
A **${capKw} kWp** solar system requires approximately **${reqAreaSqm} m²** (~**${reqAreaSqft} sq.ft**) of unshaded rooftop area.

🏠 Roof Space Sizing Guide:
• Area Required: **~80 sq.ft per 1 kWp** of installed solar panels.
• Panel Count: Approximately **${Math.ceil(capKw * 1000 / 540)} panels** (540W modules).
• Shading Distance: Leave 1.5 to 2 meters space between panel rows to avoid self-shading during low winter sun angles.`;
  }

  // 8. MAINTENANCE, LIFESPAN, WARRANTY
  if (query.includes('maintain') || query.includes('life') || query.includes('warranty') || query.includes('durab') || query.includes('clean')) {
    return `⚡ Quick Summary:
Solar PV systems are extremely low-maintenance with a **25 to 30 year** operational lifespan!

🛡️ Warranty & Durability Profile:
• Panel Performance Warranty: **25 Years** (guaranteed 84%+ power output at Year 25).
• Inverter Warranty: **10 Years** (standard hybrid/string inverter replacement lifespan).
• Maintenance Routine: Hose down panels with clean water 2 to 4 times a year to remove dust. No moving parts means minimal mechanical wear.`;
  }

  // 9. DYNAMIC GENERAL RESPONSE FOR ANY QUERY
  const estSavingsYr = Math.round(annualMwh * 1000 * 8);
  const optTilt = Math.max(10, Math.min(60, Math.round(Math.abs(lat))));
  return `⚡ Quick Summary:
Here is the engineering analysis for your **${capKw} kWp** solar installation in **${locationName}**:

☀️ System Technical Highlights:
• Annual Generation: **${annualMwh} MWh/year** (~${Math.round(annualMwh * 1000 / 12)} kWh/mo)
• Optimal Module Tilt: **${optTilt}°**
• Estimated Annual Savings: **~₹${estSavingsYr.toLocaleString('en-IN')} / year**
• Payback Period: **3.5 - 4.8 Years**

💡 *Tip: You can ask about optimal tilt, panel technology, battery sizing, or payback period! Add a GEMINI_API_KEY to .env.local for free-form AI chat.*`;
}

export async function POST(req: NextRequest) {
  let lastUserMessage = "Hello";
  let siteContext: any = null;

  try {
    const body = await req.json();
    const { messages, siteContext: ctx } = body;
    siteContext = ctx;

    if (messages && messages.length > 0) {
      lastUserMessage = messages[messages.length - 1].content || "Hello";
    }

    // Check if Gemini API key is configured
    if (isGeminiKeyConfigured()) {
      const ai = getGeminiClient();

      const systemInstruction = `You are "SolarVision AI Assistant", a friendly, expert Solar Engineer and Renewable Energy Advisor for ${siteContext?.location?.city || 'the site'}.

IMPORTANT INSTRUCTIONS FOR ALL RESPONSES:
1. Answer the user's specific question clearly in simple, easy-to-understand English.
2. ALWAYS start your answer with a "⚡ Quick Summary" section (1-2 clear bullet points).
3. Use bullet points (•), bold highlights (**text**), line breaks, and clear emojis (☀️, 🔋, 💰, 📐).
4. Keep answers distinct, informative, and tailored specifically to the user's prompt.

Site Context: Location: ${siteContext?.location?.city || 'Selected Site'}, ${siteContext?.location?.country || ''}. System Capacity: ${siteContext?.systemConfig?.capacityKw || 10} kWp. Annual Energy: ${siteContext?.solarResult?.annualEnergyMwh || 15} MWh.`;

      // Build conversation contents array cleanly starting with USER turn
      const contentsArray: any[] = [];
      if (messages && messages.length > 0) {
        // Find first 'user' message index so contentsArray never starts with 'model'
        const firstUserIdx = messages.findIndex((m: any) => m.role === 'user');
        const validMessages = firstUserIdx !== -1 ? messages.slice(firstUserIdx) : messages;

        validMessages.forEach((m: any) => {
          if (m.role === 'user' || m.role === 'model') {
            contentsArray.push({
              role: m.role === 'model' ? 'model' : 'user',
              parts: [{ text: m.content }]
            });
          }
        });
      }

      if (contentsArray.length === 0) {
        contentsArray.push({
          role: 'user',
          parts: [{ text: lastUserMessage }]
        });
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_FAST,
        contents: contentsArray,
        config: {
          systemInstruction
        }
      });

      if (response && response.text) {
        return NextResponse.json({
          success: true,
          text: response.text
        });
      }
    }

    // Deterministic fallback response if Gemini API key is missing or quota limited
    const fallbackText = generateSolarEngineerFallbackResponse(lastUserMessage, siteContext);
    return NextResponse.json({
      success: true,
      text: fallbackText
    });
  } catch (err: any) {
    console.log("Solar Chatbot API fallback applied:", err.message);
    
    if (err.message && (err.message.includes('503') || err.message.toLowerCase().includes('high demand') || err.message.toLowerCase().includes('unavailable'))) {
       return NextResponse.json({
         success: true,
         text: `⚠️ **Google AI Servers Overloaded**\nThe Gemini AI models are currently experiencing a temporary surge in demand (503 Service Unavailable). Please try asking your question again in a few moments!\n\n*(Your API key is perfectly valid, the Google servers are just busy!)*`
       });
    }

    if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
      return NextResponse.json({
        success: true,
        text: `⚠️ **API Quota Exceeded**\nYour Gemini API Key (\`...${(process.env.GEMINI_API_KEY || '').slice(-4)}\`) has hit its free tier quota limit (15 requests per minute or daily maximum).\n\nPlease wait a minute before sending another message, or upgrade your Google AI Studio plan to increase your limits.`
      });
    }

    const fallbackText = generateSolarEngineerFallbackResponse(lastUserMessage, siteContext);
    return NextResponse.json({
      success: true,
      text: fallbackText
    });
  }
}
