export interface EconomicEvent {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm, yaklaşık
  title: string;
  source: string;
}

const TR_MONTHS: Record<string, string> = {
  Ocak: "01", Şubat: "02", Mart: "03", Nisan: "04", Mayıs: "05", Haziran: "06",
  Temmuz: "07", Ağustos: "08", Eylül: "09", Ekim: "10", Kasım: "11", Aralık: "12",
};

function parseTrDate(raw: string): string | null {
  const match = raw.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = TR_MONTHS[monthName];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, "0")}`;
}

// TCMB, PPK toplantı takvimini resmi sitesinde basit bir HTML tablosu olarak yayınlıyor
// (gerçek sayfayla test edildi). Sayfa yapısı değişirse bu sessizce boş dizi döner.
export async function fetchTcmbPpkDates(): Promise<EconomicEvent[]> {
  try {
    const res = await fetch(
      "https://www.tcmb.gov.tr/wps/wcm/connect/tr/tcmb+tr/main+menu/duyurular/takvim",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await res.text();
    const tableMatch = html.match(/<table[^>]*id="midTable"[^>]*>([\s\S]*?)<\/table>/);
    if (!tableMatch) return [];
    const bodyMatch = tableMatch[1].match(/<tbody>([\s\S]*?)<\/tbody>/);
    if (!bodyMatch) return [];

    const rows = bodyMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) ?? [];
    const events: EconomicEvent[] = [];
    for (const row of rows) {
      const firstCell = row.match(/<td[^>]*>([\s\S]*?)<\/td>/);
      if (!firstCell) continue;
      const iso = parseTrDate(firstCell[1].replace(/&nbsp;/g, "").trim());
      if (!iso) continue;
      events.push({ date: iso, time: "14:00", title: "TCMB PPK Faiz Kararı", source: "TCMB" });
    }
    return events;
  } catch {
    return [];
  }
}

// ForexFactory'nin herkese açık takvim widget'ı — sadece "bu hafta" ufku, sadece
// USD/EUR/GBP/JPY/AUD/CAD/CNY/NZD kapsıyor (TRY yok). FED/ECB/ABD verileri (CPI, PCE, NFP)
// için kullanılıyor; TCMB/TÜİK için kullanılamaz.
export async function fetchForexFactoryEvents(): Promise<EconomicEvent[]> {
  try {
    const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json");
    const data: { title: string; country: string; date: string; impact: string }[] = await res.json();
    return data
      .filter((e) => (e.country === "USD" || e.country === "EUR") && (e.impact === "High" || e.impact === "Medium"))
      .map((e) => {
        const d = new Date(e.date);
        return {
          date: d.toISOString().slice(0, 10),
          time: d.toISOString().slice(11, 16),
          title: `${e.country} ${e.title}`,
          source: "FED/ECB",
        };
      });
  } catch {
    return [];
  }
}

export async function fetchEconomicEvents(): Promise<EconomicEvent[]> {
  const [tcmb, forex] = await Promise.all([fetchTcmbPpkDates(), fetchForexFactoryEvents()]);
  return [...tcmb, ...forex].sort((a, b) => a.date.localeCompare(b.date));
}
