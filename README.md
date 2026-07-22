# Finansal Günlük

Yatırımlarını (altın, kripto, döviz) takip eden, otomatik kâr/zarar hesaplayan ve yatırım kararlarını dönemin ekonomik/siyasi olaylarıyla yapay zekâ ile analiz eden kişisel finans asistanı. Ana Sayfa, Yatırımlar, Harcamalar ve Finans Günlüğüm 📓 (takvim + yatırım günlüğü) olmak üzere ayrı sayfalara bölünmüştür.

## Çözdüğü Problem

İnsanlar paralarının nereye gittiğini ve yatırım kararlarının hangi koşullar altında alındığını düzenli takip edemiyor. Bu uygulama, her yatırım işlemini otomatik kâr/zarar hesabıyla birlikte kaydeder ve kullanıcının "neden bu kararı verdim?" sorusuna, işlemin yapıldığı tarihteki gerçek ekonomik/siyasi bağlamı AI ile göstererek cevap verir.

## Şu An Çalışan Özellikler (MVP)

- **Ana Sayfa dashboard**: Sol menülü (Sidebar), sıcak/terrakota temalı yeni tasarım (Manrope + Newsreader fontları, oklch renk paleti — Claude Design'da hazırlanan mockup'a göre uygulandı). Güncel Değer/Toplam Yatırım/Toplam Harcama/Toplam Kâr-Zarar özet kartları, varlık türüne göre portföy dağılım donut grafiği, portföy değeri trend grafiği (geçmiş veri yoktu — bugünden itibaren gerçek günlük değer kaydedilip zamanla birikir), hızlı erişim kartları ve **AI Analiz bandı**: bu dönem harcamalarını en son kapatılan dönemle kategori bazında karşılaştıran, gerçek verilere dayalı (AI API çağrısı yapmayan) basit bir kıyaslama.
- **Manuel yatırım girişi**: Altın (Gram/Çeyrek/Cumhuriyet), kripto (BTC/ETH), döviz (USD/EUR), Fon (Likit Fon, Teknoloji Ağırlıklı, BIST 30 Dışı, Hisse Senedi Yoğun vb. + özel kategori girişi), Hisse, Banka, Vadeli Hesap, Mevduat, Nakit. Tarih girişi, tarayıcı/işletim sistemi diline bağlı kalmadan her zaman Gün/Ay/Yıl (Türkçe) sırasında.
- **Otomatik kâr/zarar hesaplama**: Ortalama maliyet, toplam yatırım, güncel değer, işlem bazlı ve toplam kâr/zarar (yüzde dahil). Banka/Vadeli Hesap/Mevduat/Nakit için kâr/zarar hesaplanmaz — bunlar sadece portföydeki bakiye payını gösterir.
- **Canlı fiyatlar**: Kripto (CoinGecko), döviz (Frankfurter) ve gram altın (uluslararası ons altın vadeli işlem fiyatı, Yahoo Finance + USD/TRY kuru ile hesaplanır — kuyumcu satış fiyatından işçilik/prim farkı nedeniyle sapabilir, referans niteliğindedir) otomatik çekilir. Çeyrek/Cumhuriyet altın ve **Fon (TEFAS kodu bazında)** için manuel güncel fiyat girişi var — TEFAS otomatik veri çekmeye karşı ciddi bot koruması (F5/Shape Security) kullandığı için canlı entegrasyon denenmedi; kullanıcı TEFAS linkine tıklayıp gerçek fiyatı görüp elle girer, gerçek kâr/zarar hesabı bu şekilde çalışır. Hisse için henüz fiyat girişi yok.
- **Portföy dağılım grafiği**: Varlık türüne göre yatay çubuk grafik (dataviz iyi pratiklerine uygun — çakışan etiket yok, küsüratsız kısa değerler). Ayrıca Fon kategorileri için yatırılan tutara göre ayrı bir dağılım listesi.
- **Fon yıllık getiri/risk seviyesi**: TEFAS bu veriyi de otomatik çekmeye karşı korumalı olduğu için, güncel fiyat girişiyle aynı desende — fon kodu bazında yıllık getiri (%) ve risk seviyesi (1-7, TEFAS/SPK ölçeği) elle girilip Yatırımlar sayfasında rozetle gösterilir.
- **AI destekli tarihsel olay analizi**: Her işlem için, o tarihteki önemli ekonomik/siyasi gelişmelerin kısa özeti; istenirse Gemini ile IMRaD formatında + SWOT analizi içeren detaylı rapora genişletilebilir. Model gerçek zamanlı internete erişemediği için yalnızca eğitim verisindeki bilgiye dayanır ve emin olmadığı durumları açıkça belirtir (uydurma kaynak vermez). **Bilinen sınır:** Model kendi eğitim verisi kapsamına çok yakın veya sonraki tarihler için ("bu ay yaptığım işlem gibi") dürüstçe bilgisi olmadığını söyler — bu bir hata değil, kasıtlı bir güvenlik davranışıdır. (Google Arama ile gerçek zamanlı erişim teknik olarak mümkün ama ücretsiz key'lerde kota dışı; faturalandırma açılırsa etkinleştirilebilir.)
- **Harcama Analizi**: Kategori bazlı (Market, Yemek, Ulaşım, Eğlence, Spor, Eğitim, Kira, Faturalar, Sağlık, Diğer) manuel harcama girişi, toplam harcama özeti, kategori dağılım çubuk grafiği.
- **Dönemi Kapat / Klasörle**: İstediğin an mevcut harcamaları silmeden arşivler, ana ekranı yeni dönem için temizler. Arşivlenen her dönem tarih aralığıyla listelenir; açınca kategori dağılımı, en büyük/tekrarlayan/beklenmeyen harcamalar (basit yaklaşımlarla), tüm harcama kayıtları ve o tarih aralığındaki yatırım işlemlerini gösterir. **AI Analiz Paketi**: Uygulama kendisi hiçbir AI API'sine bağlı değildir — "Prompt Oluştur" kısa bir sihirbazla (analiz türü, AI rolü, detay seviyesi, serbest odak metni) kişiye özel bir analiz promptu üretir; "Word (.docx) Oluştur" aynı döneme ait tüm veriyi + oluşturulan promptun bir kopyasını içeren bir Word dosyası indirir. Kullanıcı ikisini de istediği yapay zekâya (ChatGPT, Claude, Gemini vb.) kendisi yükler. Not: Bu pakette sadece harcama ve yatırım verisi analiz edilir — gelir/tasarruf takibi henüz yok.
- **Harcama Yoğunluk Takvimi**: Harcamalar sayfasında, Finansal Takvim'den tamamen bağımsız ayrı bir mini takvim. Sadece geçmişe bakar — o dönemin her gününü, o günkü toplam harcama tutarına göre (en yüksek harcama günü en koyu, azaldıkça pastelleşen) 5 kademeli bir renk skalasıyla gösterir. Bir güne tıklayınca o günün harcama dökümü altta açılır.
- **Finans Günlüğüm 📓**: Finansal Takvim ve Yatırım Günlüğü tek sayfada. Takvimde artık **gerçek, otomatik ekonomik olaylar** var: TCMB PPK faiz kararı tarihleri (tcmb.gov.tr resmi takviminden çekilir) + FED/ECB faiz kararları ve ABD/Avrupa önemli veri açıklamaları (ForexFactory herkese açık takviminden, sadece USD/EUR — TRY kapsamı yok). TÜİK TÜFE, OPEC toplantıları ve şirket bilanço/temettü tarihleri için güvenilir ücretsiz otomatik kaynak bulunamadı (TÜİK'in veri servisi dışarıdan erişilebilir değil) — bunlar genel bilgi + kullanıcının manuel ekleyebileceği alan olarak kalıyor, uydurma tarih verilmiyor.
- **Hesap Ekstresi Yükleme**: Kredi kartı/banka ekstresini PDF olarak yükle. Üç aşamalı otomatik algılama: (1) bilinen banka formatı (şu an İş Bankası Maximum) → hızlı/ücretsiz regex, (2) tanınmayan ama metin içeren format → Gemini metni okuyup harcama/gelir ayrımını anlar, (3) metin yoksa (ekran görüntüsü gibi) → Gemini görüntüyü doğrudan okur. Her yolda Gemini kategorilere ayırır; içe aktarmadan önce düzenlenebilir/hariç tutulabilir. Sadece gerçek harcamalar alınır — ödeme/aktarım/iade/gelir satırları hariç tutulur (hesap türüne göre işaret yönü AI tarafından yorumlanır).
- Veriler tarayıcıda (localStorage) saklanır — sunucu tarafı veritabanı yok.

## Kullanılan Teknolojiler ve AI Araçları

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS**
- **Recharts** — portföy dağılım grafiği
- **docx** — dönem raporu Word (.docx) dışa aktarımı (tamamen tarayıcıda, sunucu/API gerektirmez)
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

## Son Yapılan Değişiklikler

- **Ana Sayfa yeniden tasarlandı**: Claude Design'da hazırlanan bir mockup'a göre — sol menü (Sidebar), sıcak/terrakota oklch renk paleti, Manrope + Newsreader fontları. Güncel Değer/Toplam Yatırım/Toplam Harcama/Toplam Kâr-Zarar kartları, portföy dağılım donut grafiği, portföy değeri trend grafiği (bugünden itibaren gerçek günlük kayıt) ve gerçek verilere dayalı AI Analiz bandı eklendi.
- **Harcamalar sayfasına Harcama Yoğunluk Takvimi eklendi**: Finansal Takvim'den tamamen bağımsız, sadece geçmiş harcama günlerini tutar yoğunluğuna göre (koyu = yüksek, pastel = düşük) renklendiren ayrı bir mini takvim.
- **Site geneli yazı tipi Manrope'a çevrildi** (globals.css'te unutulmuş bir Arial kuralı bazı sayfalarda eskiyi eziyordu, düzeltildi).
- **Profil avatarı eklendi**: Sol menüde, tarih kutusunun hemen üstünde.
- **Site ikonu (favicon) eklendi/düzeltildi**.
- **Fon yıllık getiri/risk seviyesi gösterimi**: Fon kodu bazında elle girilen yıllık getiri (%) ve risk seviyesi (1-7), Yatırımlar sayfasında rozet olarak gösteriliyor.

## Vizyon / Yol Haritası (Henüz Yapılmadı)

Bu bölümdeki özellikler projenin uzun vadeli hedefidir, MVP kapsamında değildir:

- Hisse için manuel güncel fiyat girişi
- Hedef bazlı bütçe (kategori başına aylık hedef ve geçen aya göre karşılaştırma)
- CSV/Excel formatında ekstre desteği (şu an sadece PDF)
- TÜİK TÜFE, OPEC ve şirket bilanço/temettü tarihlerinin otomatikleştirilmesi (güvenilir ücretsiz kaynak henüz bulunamadı)
- Hisse senedi temettü tarihlerinin takvime otomatik yansıması (Yahoo Finance artık yetkilendirme istiyor, alternatif kaynak araştırılmalı)
- Finansal kimlik anketi (yaş, meslek, gelir, risk seviyesi) ve kişiselleştirilmiş AI profili
- İşlem hariç tutma + AI'nin tekrarlayan işlemleri öğrenip otomatik filtreleme önerisi
- Web arayüzü içi sınırlı görevli AI asistanı (rapor ve tarihsel olay anlatımı + arayüz etkileşimi)
