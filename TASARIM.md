# KENAR ÇİZGİSİ — Oyun Tasarım Belgesi

> Taslak 1 · 24 Ekim 2026
> İşaretler: ✅ karar verildi · 💡 öneri, onay bekliyor · ❓ açık soru

---

## 1. Tek cümlede oyun

Carceria'da kariyerine sıfırdan başlayan bir teknik direktörün hem takımını hem de kendi hayatını yönettiği, **yaşayan bir dünyada geçen piksel sanatlı futbol menajerliği oyunu.**

## 2. FM'den farkımız

| FM'de | KENAR ÇİZGİSİ'nde |
|---|---|
| Para kâğıt üstünde kalıyor | Para hayatını değiştiriyor: ev, araba, yatırım, işletme |
| Menajerin kendine ait bir hayatı yok | Evin, mahallen, ilişkilerin, stresin ve itibarın var |
| Antrenman sadece metin ve kaydırıcılardan ibaret | Antrenmanlar 2D sahada izlenen sahneler |
| Dünya menünün arkasında duruyor | Dünya sana tepki veriyor: şehir, taraftar, basın, komşular |

✅ Platform: Windows bilgisayar (.exe). Testler tarayıcıda yapılıyor.
✅ Görsel: piksel sanatı. Sadece ücretsiz ve gerçek sanatçıların çizdiği hazır grafikler kullanılıyor. Yapay zekâ görseli kesinlikle yok.
✅ Görseller CARCERIA'dakiyle aynı tarzda olmayacak.

---

## 3. Dünya (CARCERIA evreni, 2026)

✅ **Carceria** bağımsız bir ülke.
- Komşu ülkelerle yapılan görüşmelerle toprakları zamanla **130 km²**'ye çıktı. Nüfus **100 bini** geçti.
- 1932 suçlu anlaşması hâlâ yürürlükte, hapishaneler hâlâ çalışıyor ama artık eskisi kadar etkin değil.
- Ülkede hapishanelerin çok ötesine geçen, daha büyük hayatlar kurulmuş.
- Başkent **Carceria City**. Para birimi **₡ Caron**: 1 ₡ = 100 centon.

✅ **Sinistra** (batıda) ve **Odexia** (doğuda) iki büyük komşu. Birbirlerine geçmişten kalan bir husumetle bakıyorlar ve futbol bu husumetin bugün en çok yaşadığı alan.

❓ Kullanıcının hazırladığı Carceria tarihçesi (Word dosyası) gelince bu bölüm ona göre düzeltilecek. **Kanonda o dosya esas alınır.**

### 3.1 Şehirler (💡 isimleri Claude koydu, kullanıcı değiştirebilir)

Her ülkenin isimleri kendine özgü bir sese sahip, böylece bir ismi duyan oyuncu nereden geldiğini tahmin edebilir:
- **Sinistra:** Latin ve İtalyan esintili isimler.
- **Odexia:** Yunan ve Ege esintili isimler.
- **Carceria:** Karışık isimler, çünkü ülke iki tarafın insanlarıyla kuruldu.

**Carceria** (130 km²)

| Şehir | Kısa not |
|---|---|
| **Carceria City** ✅ | Başkent. Ülkenin yarısından fazlası burada yaşıyor. Eski merkez cezaevi şehrin ortasında hâlâ duruyor. |
| **Kalvar** ✅ | Kuzeyde, ovanın ortasında. Eski cezaevinin bir kısmı kapandı. Avlusunun olduğu yere stadyum yapıldı. |
| **Brennik** 💡 | Batıda. Sinistra ile yapılan toprak anlaşmasıyla katılan yeni bölge, halkı Sinistralı kökenli. |
| **Ardessa** 💡 | Doğuda. Odexia'dan katılan bölge, halkı yarı Odexialı ve hâlâ iki dil konuşuluyor. |
| **Tessel** 💡 | Güneyde, nehir kenarında bir sanayi kasabası. Demiryolu deposu da burada. |
| **Mirov** 💡 | Kuzeydoğuda, tepelerde küçük ve sakin bir kasaba. Zenginlerin yazlıkları burada. |

**Sinistra** (batı, yeşil ve ormanlık)

| Şehir | Kısa not |
|---|---|
| **Valmora** 💡 | Başkent. Ülkenin en büyük iki kulübü burada. |
| **Corvessa** 💡 | Nehir limanı ve sanayi şehri. Sert, işçi taraftarlarıyla bilinir. |
| **Lucerno** 💡 | Üniversite şehri. Altyapısıyla ünlü kulübü var. |
| **Montelago** 💡 | Göl kıyısında, zenginlerin ve emeklilerin şehri. |
| **Ferrano** 💡 | Maden şehri. Carceria sınırına en yakın büyük şehir. |
| **Santaro** 💡 | Güneyde bir ova ve tarım şehri. |

**Odexia** (doğu, turuncu ve dağlık)

| Şehir | Kısa not |
|---|---|
| **Tyrenna** 💡 | Başkent. Kalabalık, gürültülü, ülkenin futbol merkezi. |
| **Kastrion** 💡 | Eski bir kale şehri. Ülkenin en köklü kulübü burada. |
| **Melitha** 💡 | Göl kıyısında (haritadaki göl), turizm şehri. |
| **Varnessa** 💡 | Dağ eteğinde bir sanayi şehri. Yeni zengin bir kulüp sahibi var. |
| **Dorakos** 💡 | Carceria sınırında bir kasaba. Halkının yarısı her gün Carceria'ya çalışmaya gidiyor. |
| **Pelion** 💡 | Kuzeyde bir dağ kasabası, sert kışlar. |

### 3.2 Carceria Ligi kulüpleri (💡 hepsi öneri)

| Kulüp | Şehir | Kısa not |
|---|---|---|
| **Carceria City FK** | Carceria City | Başkentin köklü kulübü, ligin en zengini. |
| **Dinamo Carceria** | Carceria City | Eskiden gardiyanların kulübüydü. Hâlâ devletten destek alıyor, taraftarlar "sistemin takımı" der. |
| **Union 32** | Carceria City | Adını 1932'den alan halk kulübü. Taraftarı en ateşli olan takım. |
| **Kalvar Spor** | Kalvar | Stadı eski cezaevinin avlusunda, tribünün arkasında gözetleme kulesi duruyor. 💡 Oyuncunun ilk kulübü. |
| **Brennik Atletik** | Brennik | Sinistralı kökenli taraftarlar. |
| **Asteras Ardessa** | Ardessa | Odexialı kökenli taraftarlar. Brennik maçları gergin geçer. |
| **Tessel Lokomotiv** | Tessel | Demiryolu işçilerinin kulübü. |
| **Mirov SK** | Mirov | Küçük ama zengin bir iş insanının oyuncağı. |
| **Kuzey Ovası FK** | Kalvar çevresi köyleri | Amatör ruhlu bir kulüp, oyuncuların çoğunun gündüz başka bir işi var. |
| **Sentinel Carceria** | Carceria City | Küçük bir semt kulübü. Her yıl küme düşmemeye çalışır. |

### 3.3 Göndermeler (💡 öneri)
- **Kalvar:** Eski Kalvar Cezaevi'nin avlusunun olduğu yerde bugün **Kalvar Spor**'un stadyumu duruyor.
- **Demir Masa:** Hiç dağılmadı. Bugün futbolun arka tarafında bahis, şike ve kulüp satın alma işleri çeviren gizli bir çevre. Oyunda gizli bir hikâye katmanı olarak işlenir.

## 4. Futbol yapısı

💡 **Carceria Ligi:** 10 kulüp, yarı profesyonel.
- Faroe Adaları gibi küçük bir ülkenin ligini düşün: stadyumlar küçük, oyuncuların bir kısmının ikinci bir işi var.
- Oyuncu kariyerine burada başlar.

💡 **Sinistra Ligi** ve **Odexia Ligi:** 16'şar kulüplü profesyonel ligler. İkişer küme olmaları da mümkün.

💡 **Antlaşma Kupası:** Üç ülkenin en iyi kulüplerinin katıldığı ortak kupa. Adını 1932 Antlaşması'ndan alıyor.

💡 **Kariyer yolu:** Carceria'da küçük bir kulüple başlarsın, başarılı oldukça komşu ülkelerden teklif gelir. Sinistralı bir kulübü yönetmek ile Odexialı bir kulübü yönetmek farklı tepkiler doğurur. Milli takım teklifleri daha sonraki bir aşamada eklenir.

✅ Tüm kulüpler, oyuncular ve isimler kurgusal.

## 5. Ana döngü: bir hafta

```
Pazartesi–Perşembe   antrenman sahneleri · kadro ve taktik · transfer · hayat (akşamları)
Cuma                 maç öncesi basın toplantısı · kadro seçimi
Cumartesi/Pazar      2D maç
Ay sonu              maaş yatar · faturalar ve yatırım getirileri gelir
Her hafta            Sınır Postası gazetesi çıkar
```

Her gün **gündüz kulüpte**, **akşam hayatında** geçer. Akşamları seçim yaparsın: evde dinlenmek, bir oyuncuyla yemek, menajerlerle görüşme, şehirde gezme, yatırım yönetmek. Zaman sınırlı olduğu için seçimlerin bir bedeli var.

## 6. Sistemler

### 6.1 Kulüp
- Kadro, mevkiler, oyuncu özellikleri, moral, yorgunluk, sakatlık.
- Taktik: diziliş, oyun anlayışı ve birkaç basit talimat. Bilerek FM'den daha sade tutuluyor, derinlik maç motorundan gelir.
- Transfer ve sözleşmeler, yönetim beklentileri, kulübün finansı.

### 6.2 Antrenman sahneleri
- Haftalık plan yapılır: hücum, savunma, duran top, kondisyon, taktik, dinlenme.
- Her çalışma, 2D sahada 20–40 saniyelik bir sahne olarak izlenir: rondo, şut çalışması, korner, sprint.
- Sahnede oyuncuların iyi ve kötü anlarını görürsün: "Ramos bugün üç kez top kaybetti."
- Gelişme sayılardan değil, sahada görülen şeylerden hissedilir.
- Antrenman sahneleri maç motoruyla aynı sahayı ve aynı figürleri kullanır.

### 6.3 2D maç motoru
- Yukarıdan görünüm, piksel oyuncular.
- Maçın tamamı oynanmaz, önemli anlar gösterilir: atak, şut, gol, kart.
- Kenar çizgisinden müdahale edilir: oyuncu değişikliği, taktik değişikliği, bağırmak.
- Hız ayarı: ×1, ×2, ×4 ya da sadece sonucu görmek.

### 6.4 Menajerin hayatı (kapsamlı)
- ✅ **Karakter oluşturma:** Yeni kariyerde menajerin teni, saçı, saç rengi, sakalı, üst giyimi, pantolonu ve ayakkabısı seçiliyor.
  - 💡 İleride evdeki aynadan görünüş değiştirilebilir. Kuaför ve giyim mağazası şehirde para harcanan yerler olabilir.
- **Konut:** Kiralık daireyle başlarsın. Ev kiralayabilir ya da satın alabilirsin, mahalle seçebilirsin, evini döşeyebilirsin. Ev odalarıyla birlikte piksel sahne olarak görünür.
- **Araç:** Otobüsten başlayıp araba almaya kadar gider. Ulaşım zamanını ve itibarını etkiler.
- **Yatırım:** Kira geliri getiren daire, bir kafe ya da dükkân, bir altyapı okulu, şehirdeki projeler. Kazandırabilir de batırabilir de.
- **İlişkiler:** Oyuncular, menajerler, gazeteciler ve komşular. Kurduğun bağlar kapı açar.
- ✅ **Partner:** Oyunun başında menajer yalnız. Zamanla biriyle tanışabilir ama bu tamamen rastgele gelişir, ne zaman ve kiminle olacağı belli değil. Kafede, bir yatırım görüşmesinde ya da bir komşu aracılığıyla olabilir. İlişki sonra kendi yolunda ilerler.
- **Durum göstergeleri:**
  - **Enerji**, gün içinde harcanır.
  - **Stres**, kötü sonuçlarla ve borçla artar, kararlarını etkiler.
  - **İtibar**, şehirde, basında ve futbol dünyasında ayrı ayrı izlenir.
- **Şehir:** Mekânlara gidilen basit bir şehir haritası: kafe, restoran, emlakçı, banka, galeri. Üst üste kaybettiysen kafede seni kimse sevmez.

### 6.5 Yaşayan dünya
- **Sınır Postası:** Haftalık gazete. Manşetler, transfer dedikoduları, senin hakkında yazılanlar.
- Diğer menajerlerin de kariyerleri var: kovulurlar, yükselirler, sana rakip olurlar.
- Oyuncular yaşlanır, emekli olur, bazıları teknik direktör olur.
- Ekonomi, siyaset ve iki ülke arasındaki ilişkiler futbolu etkiler.
- 💡 Demir Masa gizli hikâye katmanı olarak işlenir.

## 7. Görsel ve ses

- **16×16 piksel sanatı**, tek bir sanatçının ya da aynı tarzdaki paketlerin grafikleri. Farklı tarzlar karıştırılmaz.
- **Arayüz:** Sade, kâğıt tonlu ve okunaklı, gazete havasında.
- **Yazılar insan elinden çıkmış gibi olmalı:** Tribün dili, gazete manşetleri, Carceria'ya özgü deyimler. Genel ve ruhsuz yapay zekâ metni olmaz.
- Kullanılan her hazır grafik ve sesin lisansı `KREDILER.md` dosyasına yazılır.

## 8. Teknik

- HTML5 Canvas (sahneler) + HTML/CSS (menüler), derleme adımı olmayan JavaScript.
- Electron ile Windows `.exe`, kayıtlar `%APPDATA%\KenarCizgisi\saves\`.
- Kurulum ve yayın düzeni CARCERIA ile aynı.

## 9. Yol haritası

| Aşama | İçerik | Bittiğinde |
|---|---|---|
| **0. İskelet** ✅ | Proje, pencere, ana menü, kayıt, `.exe` derleme | Boş ama açılan bir oyun |
| **1. İlk dilim** ✅ | 1 kulüp, 1 hafta: antrenman sahnesi → 2D maç → maaş → daire → gazete | Oyunun hissi görülür |
| **2. Sezon** ✅ | Carceria Ligi, fikstür, puan tablosu, görsel taktik ekranı, transfer, sözleşmeler | Bir sezon baştan sona oynanır |
| **3. Hayat** | Ev ve araba, yatırımlar, şehir haritası, ilişkiler, enerji/stres/itibar | Para gerçekten bir işe yarar |
| **4. Dünya** | Komşu ligler, Antlaşma Kupası, menajer kariyerleri, Demir Masa | Dünya yaşamaya başlar |
| **5. Cila** | Ses, müzik, denge, seslendirme | Yayına hazır |

## 9.1 Aşama 1'de verilen kararlar (💡 kullanıcı değiştirebilir)
- **Takvim:** Kariyer 27 Temmuz 2026 Pazartesi başlıyor. İlk hafta 1 Ağustos Cumartesi'deki hazırlık maçıyla bitiyor, böylece ilk maaş da aynı gün yatıyor.
- **Hazırlık maçları:** 1 Ağustos Tessel Lokomotiv (ev), 8 Ağustos Kuzey Ovası (deplasman), 15 Ağustos Brennik Atletik (ev), 22 Ağustos Mirov SK (deplasman). Lig 29 Ağustos'ta başlıyor (Aşama 2).
- **Antrenman:** 6 tür: pas ve rondo, bitiricilik, savunma hattı, duran top, kondisyon, dinlenme.
  - Gençler daha hızlı gelişir. Yoğun antrenman yorar.
  - Hocanın enerjisi 30'un altına düşerse antrenmanın verimi azalır.
- **Maç:** Maç dakika dakika oynanır ve önemli anlar sahada canlandırılır.
  - Kenardan müdahale: taktik, 3 oyuncu değişikliği ve her yarıda bir kez bağırma.
- **Basın:** Cuma toplantısında Sınır Postası'ndan Mira Halvor bir soru soruyor. Cevap moral, taraftar ve yönetimi etkiliyor, pazar gazetesinde de alıntılanıyor.
- **Akşamlar:** Üç seçenek var:
  - Evde dinlen: enerji toplarsın.
  - Gözcü Kafe: ₡14. Stres azalır, dedikodu duyulur. Rakibin dizilişi böyle öğrenilebilir.
  - Bir oyuncuyu yemeğe çağır: ₡60, oyuncunun morali yükselir.
- **Yeni isimler:** Başkan Ilian Dorsa, muhabir Mira Halvor, Gözcü Kafe ve sahibi Mavro.

## 9.2 Aşama 2 planı ✅ (kullanıcı onayladı, yapıldı)

### Taktik ekranı ✅ (kullanıcı istedi)
- **Saha görünümü:** Yukarıdan bakılan sahada, seçilen dizilişe göre 11 oyuncu durur. Her oyuncunun forması, numarası ve adı görünür.
- **Sürükle-bırak:**
  - Sahadaki iki oyuncunun yerini değiştirmek için birini diğerinin üstüne bırak.
  - Yedeklerden birini sahaya almak için oyuncunun üstüne bırak.
- **Uyarılar:**
  - Kendi mevkisi dışında oynayan oyuncu kırmızı işaretlenir.
  - Kondisyonu düşük olan oyuncunun altında bir çubuk görünür.
- **Diziliş:** Değiştirince oyuncular sahada yeni yerlerine kayar.
- **Takım talimatları:** Maç motorunu gerçekten etkiler.
  - Savunma hattı: geride / normal / önde. Önde oynamak rakibi sıkıştırır ama arkaya top yeme riskini artırır.
  - Pres: az / normal / yoğun. Yoğun pres top kazandırır ama yorar.
  - Pas: kısa / karışık / uzun.
  - Genişlik: dar / normal / geniş.
- **Görevler:** Kaptan, penaltıcı, korner ve frikik kullanıcısı.
- **Rakip analizi:** Rakibin bilinen dizilişi küçük bir sahada gösterilir. Bilinmiyorsa "?" yazar.
- **Maçta da aynı ekran:** Devre arasında ve "Taktik" düğmesinde bu ekran açılır.

### Lig
- **Format:** 10 takım, 3 devre, 27 hafta. Faroe Adaları ligi de böyle oynanıyor, küçük ülkede çok maç demek. 3/1/0 puan.
- **Takvim:** 29 Ağustos'ta başlar. 19 Aralık–9 Ocak arası kış arası. Mart sonunda biter.
- **Sonuçlar:** Şampiyon Antlaşma Kupası'na katılır (Aşama 4). Son sıradaki takım küme düşmemek için baraj oynar.
- **Ekranlar:** Puan tablosu, fikstür, haftanın sonuçları, gol krallığı.

### Transfer ve sözleşmeler
- **Pencereler:** Transfer dönemi 31 Ağustos'ta ve ocak ayında açık.
- **Teklif:** Başka kulübün oyuncusuna bonservis teklifi verilir. Kulüp kabul ederse oyuncuyla maaş ve süre konuşulur.
- **Serbest oyuncular:** Bonservissiz, sadece maaşla alınabilen oyuncular listesi.
- **Sözleşmeler:** Her oyuncunun maaşı ve bitiş tarihi var. Süresi bitmek üzere olanla uzatma görüşmesi yapılır, uzatılmazsa sezon sonunda ayrılır.
- **Kulüp bütçesi:** Transfer bütçesi ve maaş bütçesi ayrı tutulur. Yönetim bunları sezon başında belirler.
- **Diğer kulüpler de transfer yapar.** Kulis haberleri gerçek olaylardan beslenir.

### Sezon boyunca
- **Sakatlıklar:** Maçta ve yoğun antrenmanda olabilir. Süresi gün olarak gösterilir.
- **Kartlar:** Sarı kart birikirse ve kırmızı kart görülürse ceza var.
- **Yönetim güveni:** Sezon başında bir hedef konur. Güven çok düşerse kovulma riski doğar.
- **Kira:** Kulübün ödediği ilk üç ay bitince, Kasım'dan itibaren Lale Sokak'ın kirası (₡620) maaştan düşer.

## 10. Açık sorular

1. ✅ Grafik: Kenney Roguelike serisi (şehir, iç mekân, karakterler), CC0.
2. ✅ Şehir adlarını Claude koydu (3.1). Kullanıcı istediğini değiştirebilir.
3. ✅ Partner: başta yok, rastgele bir tanışma ile gelir.
4. ✅ Kod GitHub deposunda tutulacak (güncelleme ve iki bilgisayar için).
5. ❓ Kulüp isimleri (3.2) ve oyuncunun ilk kulübü olarak Kalvar Spor.
