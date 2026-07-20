# Finansal Günlük

Yatırımlarını (altın, kripto, döviz) takip eden, otomatik kâr/zarar hesaplayan ve yatırım kararlarını dönemin ekonomik/siyasi olaylarıyla yapay zekâ ile analiz eden kişisel finans asistanı. Ana Sayfa, Yatırımlar, Harcamalar ve Finans Günlüğüm 📓 (takvim + yatırım günlüğü) olmak üzere ayrı sayfalara bölünmüştür.

## Çözdüğü Problem

İnsanlar paralarının nereye gittiğini ve yatırım kararlarının hangi koşullar altında alındığını düzenli takip edemiyor. Bu uygulama, her yatırım işlemini otomatik kâr/zarar hesabıyla birlikte kaydeder ve kullanıcının "neden bu kararı verdim?" sorusuna, işlemin yapıldığı tarihteki gerçek ekonomik/siyasi bağlamı AI ile göstererek cevap verir.

## Şu An Çalışan Özellikler (MVP)

- **Manuel yatırım girişi**: Altın (Gram/Çeyrek/Cumhuriyet), kripto (BTC/ETH), döviz (USD/EUR), Fon (Likit Fon, Teknoloji Ağırlıklı, BIST 30 Dışı, Hisse Senedi Yoğun vb. + özel kategori girişi), Hisse, Banka, Vadeli Hesap, Mevduat, Nakit. Tarih girişi, tarayıcı/işletim sistemi diline bağlı kalmadan her zaman Gün/Ay/Yıl (Türkçe) sırasında.
- **Otomatik kâr/zarar hesaplama**: Ortalama maliyet, toplam yatırım, güncel değer, işlem bazlı ve toplam kâr/zarar (yüzde dahil). Banka/Vadeli Hesap/Mevduat/Nakit için kâr/zarar hesaplanmaz — bunlar sadece portföydeki bakiye payını gösterir.
- **Canlı fiyatlar**: Kripto (CoinGecko), döviz (Frankfurter) ve gram altın (uluslararası ons altın vadeli işlem fiyatı, Yahoo Finance + USD/TRY kuru ile hesaplanır — kuyumcu satış fiyatından işçilik/prim farkı nedeniyle sapabilir, referans niteliğindedir) otomatik çekilir. Çeyrek/Cumhuriyet altın ve Fon/Hisse için güvenilir ücretsiz canlı API bulunmadığından manuel giriş kullanılır (Fon/Hisse için henüz fiyat girişi arayüzü yok, sadece yatırılan tutara göre dağılım gösterilir).
- **Portföy dağılım grafiği**: Varlık türüne göre yatay çubuk grafik (dataviz iyi pratiklerine uygun — çakışan etiket yok, küsüratsız kısa değerler). Ayrıca Fon kategorileri için yatırılan tutara göre ayrı bir dağılım listesi.
- **AI destekli tarihsel olay analizi**: Her işlem için, o tarihteki önemli ekonomik/siyasi gelişmelerin kısa özeti; istenirse Gemini ile IMRaD formatında + SWOT analizi içeren detaylı rapora genişletilebilir. Model gerçek zamanlı internete erişemediği için yalnızca eğitim verisindeki bilgiye dayanır ve emin olmadığı durumları açıkça belirtir (uydurma kaynak vermez). **Bilinen sınır:** Model kendi eğitim verisi kapsamına çok yakın veya sonraki tarihler için ("bu ay yaptığım işlem gibi") dürüstçe bilgisi olmadığını söyler — bu bir hata değil, kasıtlı bir güvenlik davranışıdır. (Google Arama ile gerçek zamanlı erişim teknik olarak mümkün ama ücretsiz key'lerde kota dışı; faturalandırma açılırsa etkinleştirilebilir.)
- **Harcama Analizi**: Kategori bazlı (Market, Yemek, Ulaşım, Eğlence, Spor, Eğitim, Kira, Faturalar, Sağlık, Diğer) manuel harcama girişi, toplam harcama özeti, kategori dağılım çubuk grafiği.
- **Finans Günlüğüm 📓**: Finansal Takvim ve Yatırım Günlüğü tek sayfada. Takvimde artık **gerçek, otomatik ekonomik olaylar** var: TCMB PPK faiz kararı tarihleri (tcmb.gov.tr resmi takviminden çekilir) + FED/ECB faiz kararları ve ABD/Avrupa önemli veri açıklamaları (ForexFactory herkese açık takviminden, sadece USD/EUR — TRY kapsamı yok). TÜİK TÜFE, OPEC toplantıları ve şirket bilanço/temettü tarihleri için güvenilir ücretsiz otomatik kaynak bulunamadı (TÜİK'in veri servisi dışarıdan erişilebilir değil) — bunlar genel bilgi + kullanıcının manuel ekleyebileceği alan olarak kalıyor, uydurma tarih verilmiyor.
- **Hesap Ekstresi Yükleme**: Kredi kartı/banka ekstresini PDF olarak yükle. Üç aşamalı otomatik algılama: (1) bilinen banka formatı (şu an İş Bankası Maximum) → hızlı/ücretsiz regex, (2) tanınmayan ama metin içeren format → Gemini metni okuyup harcama/gelir ayrımını anlar, (3) metin yoksa (ekran görüntüsü gibi) → Gemini görüntüyü doğrudan okur. Her yolda Gemini kategorilere ayırır; içe aktarmadan önce düzenlenebilir/hariç tutulabilir. Sadece gerçek harcamalar alınır — ödeme/aktarım/iade/gelir satırları hariç tutulur (hesap türüne göre işaret yönü AI tarafından yorumlanır).
- Veriler tarayıcıda (localStorage) saklanır — sunucu tarafı veritabanı yok.

## Kullanılan Teknolojiler ve AI Araçları

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS**
- **Recharts** — portföy dağılım grafiği
- **Google Gemini API** (`@google/genai`, `gemini-flash-latest`) — tarihsel olay analizi ve IMRaD/SWOT raporu
- **CoinGecko API** — kripto fiyatları (ücretsiz, key gerektirmez)
- **Frankfurter API** — döviz kurları (ücretsiz, key gerektirmez)
- **Yahoo Finance (gayriresmi endpoint)** — ons altın vadeli işlem fiyatı (ücretsiz, key gerektirmez)
- **pdf-parse** — PDF ekstre metin çıkarımı
- **TCMB resmi takvim sayfası** — PPK faiz kararı tarihleri (kazıma, ücretsiz)
- **ForexFactory herkese açık takvim JSON'u** — FED/ECB/ABD-Avrupa ekonomik veri tarihleri (ücretsiz, key gerektirmez, sadece "bu hafta" ufku)
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

- Fon/Hisse için canlı veya manuel güncel fiyat girişi (yıllık getiri, risk seviyesi)
- Hedef bazlı bütçe (kategori başına aylık hedef ve geçen aya göre karşılaştırma)
- CSV/Excel formatında ekstre desteği (şu an sadece PDF)
- TÜİK TÜFE, OPEC ve şirket bilanço/temettü tarihlerinin otomatikleştirilmesi (güvenilir ücretsiz kaynak henüz bulunamadı)
- Hisse senedi temettü tarihlerinin takvime otomatik yansıması (Yahoo Finance artık yetkilendirme istiyor, alternatif kaynak araştırılmalı)
- Finansal kimlik anketi (yaş, meslek, gelir, risk seviyesi) ve kişiselleştirilmiş AI profili
- Aylık AI raporu (PDF/metin dışa aktarım, kullanıcının kendi AI hesabına yükleyebilmesi)
- İşlem hariç tutma + AI'nin tekrarlayan işlemleri öğrenip otomatik filtreleme önerisi
- Web arayüzü içi sınırlı görevli AI asistanı (rapor ve tarihsel olay anlatımı + arayüz etkileşimi)
