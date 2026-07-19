interface PromptInput {
  date: string;
  assetLabel: string;
  quantity: number;
  note?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const SEARCH_DISCLAIMER =
  "ÖNEMLİ: Gerçek zamanlı internet erişimin yok, sadece eğitim verindeki bilgiye dayanabilirsin. " +
  "Eğer işlem tarihi, eğitim verinin kapsadığı döneme çok yakın veya sonrasındaysa (yani o tarih hakkında " +
  "kesin bilgin yoksa), bunu tahmin etmeye çalışma; net şekilde 'bu tarih hakkında güvenilir bilgim yok' de. " +
  "Var olmayan bir makale, site adı veya URL uydurma.";

export function buildShortPrompt({ date, assetLabel, quantity, note }: PromptInput): string {
  return `Sen deneyimli bir finansal analistsin. Bugünün tarihi ${today()}. ${date} tarihinde yapılan ${quantity} birim ${assetLabel} yatırımı için, o dönemde dünya ve Türkiye gündeminde öne çıkan ekonomik veya siyasi gelişmeleri 2-3 cümleyle özetle.
Kullanıcının notu: "${note ?? "-"}"
${SEARCH_DISCLAIMER}
Yanıtı Türkçe ver, sadece özeti yaz, başlık kullanma.`;
}

export function buildDetailedPrompt({ date, assetLabel, quantity, note }: PromptInput): string {
  return `Sen deneyimli bir finansal analistsin. Bugünün tarihi ${today()}. Aşağıdaki yatırım işlemini, işlemin yapıldığı tarihteki dünya ve Türkiye ekonomik/siyasi gündemi bağlamında analiz et.

İşlem bilgileri:
- Tarih: ${date}
- Varlık: ${assetLabel}
- Miktar: ${quantity}
- Kullanıcının notu: "${note ?? "-"}"

${SEARCH_DISCLAIMER}
Birden fazla bağımsız açıdan (ör. merkez bankası politikası, küresel piyasa trendi, jeopolitik gelişme) çapraz değerlendirme yap; bu açılar birbiriyle tutarlıysa güvenle sun, tutarsızsa bunu belirt.

Yanıtı IMRaD formatında, başlıkları Türkçe kullanarak sun:
- Giriş: İşlemin bağlamı
- Yöntem: Hangi bilgi kategorilerini değerlendirdiğin
- Bulgular: Döneme dair önemli gelişmeler
- Tartışma: Bu gelişmelerin yatırım kararıyla ilişkisi + SWOT analizi (Güçlü Yönler, Zayıf Yönler, Fırsatlar, Tehditler)

Toplam yanıtı 500 kelimeyi geçmeyecek şekilde tut.`;
}
