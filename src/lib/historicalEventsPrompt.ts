interface PromptInput {
  date: string;
  assetLabel: string;
  quantity: number;
  note?: string;
}

const REALTIME_DISCLAIMER =
  "ÖNEMLİ: Gerçek zamanlı internet erişimin yok. Var olmayan bir makale, site adı veya URL uydurma. " +
  "Sadece geniş çapta bilinen, doğrulanabilir tarihsel olgulara (merkez bankası kararları, enflasyon verileri, " +
  "jeopolitik gelişmeler, seçimler vb.) dayan. Emin olmadığın konuda net şekilde 'bu konuda emin değilim' de.";

export function buildShortPrompt({ date, assetLabel, quantity, note }: PromptInput): string {
  return `Sen deneyimli bir finansal analistsin. ${date} tarihinde yapılan ${quantity} birim ${assetLabel} yatırımı için, o dönemde dünya ve Türkiye gündeminde öne çıkan ekonomik veya siyasi gelişmeleri 2-3 cümleyle özetle.
Kullanıcının notu: "${note ?? "-"}"
${REALTIME_DISCLAIMER}
Yanıtı Türkçe ver, sadece özeti yaz, başlık kullanma.`;
}

export function buildDetailedPrompt({ date, assetLabel, quantity, note }: PromptInput): string {
  return `Sen deneyimli bir finansal analistsin. Aşağıdaki yatırım işlemini, işlemin yapıldığı tarihteki dünya ve Türkiye ekonomik/siyasi gündemi bağlamında analiz et.

İşlem bilgileri:
- Tarih: ${date}
- Varlık: ${assetLabel}
- Miktar: ${quantity}
- Kullanıcının notu: "${note ?? "-"}"

${REALTIME_DISCLAIMER}
Birden fazla bağımsız açıdan (ör. merkez bankası politikası, küresel piyasa trendi, jeopolitik gelişme) çapraz değerlendirme yap; bu açılar birbiriyle tutarlıysa güvenle sun, tutarsızsa bunu belirt.

Yanıtı IMRaD formatında, başlıkları Türkçe kullanarak sun:
- Giriş: İşlemin bağlamı
- Yöntem: Hangi bilgi kategorilerini değerlendirdiğin
- Bulgular: Döneme dair önemli gelişmeler
- Tartışma: Bu gelişmelerin yatırım kararıyla ilişkisi + SWOT analizi (Güçlü Yönler, Zayıf Yönler, Fırsatlar, Tehditler)

Toplam yanıtı 500 kelimeyi geçmeyecek şekilde tut.`;
}
