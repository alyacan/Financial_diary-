# Finansal Günlük

Yatırımlarını (altın, kripto, döviz) tek ekranda takip eden, otomatik kâr/zarar hesaplayan ve yatırım kararlarını dönemin ekonomik/siyasi olaylarıyla yapay zekâ ile analiz eden kişisel finans asistanı.

## Çözdüğü Problem

İnsanlar paralarının nereye gittiğini ve yatırım kararlarının hangi koşullar altında alındığını düzenli takip edemiyor. Bu uygulama, her yatırım işlemini otomatik kâr/zarar hesabıyla birlikte kaydeder ve kullanıcının "neden bu kararı verdim?" sorusuna, işlemin yapıldığı tarihteki gerçek ekonomik/siyasi bağlamı AI ile göstererek cevap verir.

## Şu An Çalışan Özellikler (MVP)

- **Manuel yatırım girişi**: Altın, kripto (BTC/ETH), döviz (USD/EUR) için tarih, saat, miktar, alış fiyatı, opsiyonel komisyon ve not.
- **Otomatik kâr/zarar hesaplama**: Ortalama maliyet, toplam yatırım, güncel değer, işlem bazlı ve toplam kâr/zarar (yüzde dahil).
- **Canlı fiyatlar**: Kripto (CoinGecko) ve döviz (Frankfurter) fiyatları otomatik çekilir; altın için güncel fiyat manuel girilir (ücretsiz canlı API bulunmadığından).
- **Portföy dağılım grafiği**: Varlık türüne göre pasta grafik.
- **AI destekli tarihsel olay analizi**: Her işlem için, o tarihteki önemli ekonomik/siyasi gelişmelerin kısa özeti; istenirse Gemini ile IMRaD formatında + SWOT analizi içeren detaylı rapora genişletilebilir. Model gerçek zamanlı internete erişemediği için yalnızca genel bilinen/doğrulanabilir bilgiye dayanır ve emin olmadığı durumları açıkça belirtir (uydurma kaynak vermez).
- Veriler tarayıcıda (localStorage) saklanır — sunucu tarafı veritabanı yok.

## Kullanılan Teknolojiler ve AI Araçları

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS**
- **Recharts** — portföy dağılım grafiği
- **Google Gemini API** (`@google/genai`, `gemini-flash-latest`) — tarihsel olay analizi ve IMRaD/SWOT raporu
- **CoinGecko API** — kripto fiyatları (ücretsiz, key gerektirmez)
- **Frankfurter API** — döviz kurları (ücretsiz, key gerektirmez)
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

- Fon (TEFAS), hisse senedi, vadeli hesap, mevduat varlık türleri ve alt gruplandırmalar
- Harcama takibi: kategori bazlı analiz, hedef bazlı bütçe, banka ekstresi (PDF/CSV/Excel) yükleme ve AI ile otomatik kategorizasyon, çoklu banka desteği
- Finans günlüğü (işlem notlarının ayrı bir zaman akışında gösterimi)
- Finansal kimlik anketi (yaş, meslek, gelir, risk seviyesi) ve kişiselleştirilmiş AI profili
- Aylık AI raporu (PDF/metin dışa aktarım, kullanıcının kendi AI hesabına yükleyebilmesi)
- İşlem hariç tutma + AI'nin tekrarlayan işlemleri öğrenip otomatik filtreleme önerisi
- Finansal takvim (yaklaşan ekonomik olaylar)
- Web arayüzü içi sınırlı görevli AI asistanı (rapor ve tarihsel olay anlatımı + arayüz etkileşimi)
