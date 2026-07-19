# Finansal Günlük

Yatırımlarını (altın, kripto, döviz) tek ekranda takip eden, otomatik kâr/zarar hesaplayan ve yatırım kararlarını dönemin ekonomik/siyasi olaylarıyla yapay zekâ ile analiz eden kişisel finans asistanı.

## Çözdüğü Problem

İnsanlar paralarının nereye gittiğini ve yatırım kararlarının hangi koşullar altında alındığını düzenli takip edemiyor. Bu uygulama, her yatırım işlemini otomatik kâr/zarar hesabıyla birlikte kaydeder ve kullanıcının "neden bu kararı verdim?" sorusuna, işlemin yapıldığı tarihteki gerçek ekonomik/siyasi bağlamı AI ile göstererek cevap verir.

## Şu An Çalışan Özellikler (MVP)

- **Manuel yatırım girişi**: Altın (Gram/Çeyrek/Cumhuriyet), kripto (BTC/ETH), döviz (USD/EUR), Fon (kategori bazlı, özel kategori girişi dahil), Hisse, Banka, Vadeli Hesap, Mevduat, Nakit.
- **Otomatik kâr/zarar hesaplama**: Ortalama maliyet, toplam yatırım, güncel değer, işlem bazlı ve toplam kâr/zarar (yüzde dahil). Banka/Vadeli Hesap/Mevduat/Nakit için kâr/zarar hesaplanmaz — bunlar sadece portföydeki bakiye payını gösterir.
- **Canlı fiyatlar**: Kripto (CoinGecko), döviz (Frankfurter) ve gram altın (uluslararası ons altın vadeli işlem fiyatı, Yahoo Finance + USD/TRY kuru ile hesaplanır — kuyumcu satış fiyatından işçilik/prim farkı nedeniyle sapabilir, referans niteliğindedir) otomatik çekilir. Çeyrek/Cumhuriyet altın ve Fon/Hisse için güvenilir ücretsiz canlı API bulunmadığından manuel giriş kullanılır (Fon/Hisse için henüz fiyat girişi arayüzü yok, sadece yatırılan tutara göre dağılım gösterilir).
- **Portföy dağılım grafiği**: Varlık türüne göre pasta grafik. Ayrıca Fon kategorileri için yatırılan tutara göre ayrı bir dağılım listesi.
- **AI destekli tarihsel olay analizi**: Her işlem için, o tarihteki önemli ekonomik/siyasi gelişmelerin kısa özeti; istenirse Gemini ile IMRaD formatında + SWOT analizi içeren detaylı rapora genişletilebilir. Model gerçek zamanlı internete erişemediği için yalnızca eğitim verisindeki bilgiye dayanır ve emin olmadığı durumları açıkça belirtir (uydurma kaynak vermez). **Bilinen sınır:** Model kendi eğitim verisi kapsamına çok yakın veya sonraki tarihler için ("bu ay yaptığım işlem gibi") dürüstçe bilgisi olmadığını söyler — bu bir hata değil, kasıtlı bir güvenlik davranışıdır. (Google Arama ile gerçek zamanlı erişim teknik olarak mümkün ama ücretsiz key'lerde kota dışı; faturalandırma açılırsa etkinleştirilebilir.)
- **Harcama Analizi**: Kategori bazlı (Market, Yemek, Ulaşım, Eğlence, Spor, Eğitim, Kira, Faturalar, Sağlık, Diğer) manuel harcama girişi, toplam harcama özeti, kategori dağılım pasta grafiği.
- **Finans Günlüğü**: Yatırım işlemlerine eklenen notların ayrı bir ajanda/zaman akışı görünümü — kararların gerekçesini geriye dönük okumak için.
- **Finansal Takvim**: Spesifik (muhtemelen yanlış) tarih uydurmak yerine, düzenli tekrar eden ekonomik olaylar hakkında genel bilgi + kullanıcının kendi bildiği resmi/ilan edilmiş tarihleri manuel ekleyebileceği bir alan.
- Veriler tarayıcıda (localStorage) saklanır — sunucu tarafı veritabanı yok.

## Kullanılan Teknolojiler ve AI Araçları

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS**
- **Recharts** — portföy dağılım grafiği
- **Google Gemini API** (`@google/genai`, `gemini-flash-latest`) — tarihsel olay analizi ve IMRaD/SWOT raporu
- **CoinGecko API** — kripto fiyatları (ücretsiz, key gerektirmez)
- **Frankfurter API** — döviz kurları (ücretsiz, key gerektirmez)
- **Yahoo Finance (gayriresmi endpoint)** — ons altın vadeli işlem fiyatı (ücretsiz, key gerektirmez)
- **Claude Code** — geliştirme sürecinde AI destekli kodlama asistanı

## Kurulum

```bash
npm install
```

`.env.local` dosyası oluşturun:
```
GEMINI_API_KEY=your_key_here
```
Ücretsiz key: https://aistudio.google.com/apikey

```bash
npm run dev
```

http://localhost:3000 adresinden açın.

## Vizyon / Yol Haritası (Henüz Yapılmadı)

Bu bölümdeki özellikler projenin uzun vadeli hedefidir, MVP kapsamında değildir:

- Fon/Hisse için canlı veya manuel güncel fiyat girişi (TEFAS kodu, yıllık getiri, risk seviyesi)
- Hedef bazlı bütçe (kategori başına aylık hedef ve geçen aya göre karşılaştırma), banka ekstresi (PDF/CSV/Excel) yükleme ve AI ile otomatik kategorizasyon, çoklu banka desteği
- Finansal kimlik anketi (yaş, meslek, gelir, risk seviyesi) ve kişiselleştirilmiş AI profili
- Aylık AI raporu (PDF/metin dışa aktarım, kullanıcının kendi AI hesabına yükleyebilmesi)
- İşlem hariç tutma + AI'nin tekrarlayan işlemleri öğrenip otomatik filtreleme önerisi
- Web arayüzü içi sınırlı görevli AI asistanı (rapor ve tarihsel olay anlatımı + arayüz etkileşimi)
