// Ekranlar, açılır pencere, kısa bildirimler ve biçimlendirme yardımcıları.
const $ = (id) => document.getElementById(id);

// Kullanıcının yazdığı metni sayfaya güvenle koymak için
const kacir = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const para = (n) => "₡" + Math.round(n).toLocaleString("tr-TR");

// Tarihler "2026-07-01" biçiminde saklanır
const TARIH = (() => {
  const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const coz = (s) => { const [y, a, g] = s.split("-").map(Number); return new Date(Date.UTC(y, a - 1, g)); };
  const yaz = (d) => d.toISOString().slice(0, 10);
  return {
    uzun: (s) => { const d = coz(s); return `${d.getUTCDate()} ${AYLAR[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${GUNLER[d.getUTCDay()]}`; },
    kisa: (s) => { const d = coz(s); return `${d.getUTCDate()} ${AYLAR[d.getUTCMonth()]} ${d.getUTCFullYear()}`; },
    ekle: (s, gun) => { const d = coz(s); d.setUTCDate(d.getUTCDate() + gun); return yaz(d); },
    ayBasinaKalan: (s) => { const d = coz(s); const sonraki = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)); return Math.round((sonraki - d) / 86400000); },
    ayinIlkGunu: (s) => coz(s).getUTCDate() === 1,
  };
})();

const ARAYUZ = (() => {
  let escIsleyici = null;

  function ekranGoster(id) {
    document.querySelectorAll(".ekran").forEach((e) => { e.hidden = e.id !== id; });
  }

  // dugmeler: [{ yazi, fn, ikincil }]
  function pencereAc(baslik, govde, dugmeler = [], { esc } = {}) {
    $("pencere-baslik").textContent = baslik;
    $("pencere-govde").innerHTML = govde;
    const satir = $("pencere-dugmeler");
    satir.innerHTML = "";
    for (const d of dugmeler) {
      const b = document.createElement("button");
      b.className = "dugme" + (d.ikincil ? " ikincil" : "");
      b.textContent = d.yazi;
      b.onclick = d.fn;
      satir.appendChild(b);
    }
    satir.hidden = !dugmeler.length;
    $("pencere").hidden = false;
    escIsleyici = esc || pencereKapat;
  }

  function pencereKapat() { $("pencere").hidden = true; escIsleyici = null; }
  const pencereAcik = () => !$("pencere").hidden;

  let bildirimZaman = null;
  function bildirim(metin) {
    let el = document.querySelector(".bildirim");
    if (!el) { el = document.createElement("div"); el.className = "bildirim"; document.body.appendChild(el); }
    el.textContent = metin;
    el.hidden = false;
    clearTimeout(bildirimZaman);
    bildirimZaman = setTimeout(() => { el.hidden = true; }, 1800);
  }

  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (pencereAcik() && escIsleyici) { e.preventDefault(); escIsleyici(); return; }
    if (!pencereAcik() && ARAYUZ.escYoksa) ARAYUZ.escYoksa();
  });

  return { ekranGoster, pencereAc, pencereKapat, pencereAcik, bildirim, escYoksa: null };
})();
