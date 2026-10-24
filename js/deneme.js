// Grafik denemesi: üç sahne arasında geçiş yapan basit bir döngü.
(() => {
  const G = 320, Y = 192;
  const tuval = document.getElementById("tuval");
  const ctx = tuval.getContext("2d");
  const sahneler = [SAHNE_ANTRENMAN, SAHNE_SOKAK, SAHNE_DAIRE];
  let aktif = 0, olcek = 3, son = 0;

  // Küçük çizim yüzeyi: sahneler 320×192 çözünürlükte buraya çizilir, sonra büyütülür
  const kucuk = document.createElement("canvas");
  kucuk.width = G; kucuk.height = Y;
  const kctx = kucuk.getContext("2d");
  kctx.imageSmoothingEnabled = false;

  function boyutla() {
    const alan = document.querySelector(".sahne-alani").getBoundingClientRect();
    olcek = Math.max(1, Math.floor(Math.min((alan.width - 40) / G, (alan.height - 40) / Y)));
    tuval.width = G * olcek; tuval.height = Y * olcek;
    ctx.imageSmoothingEnabled = false;
  }

  function sec(i) {
    aktif = i;
    document.getElementById("baslik").textContent = sahneler[i].ad;
    document.getElementById("altbaslik").textContent = sahneler[i].alt;
    document.querySelectorAll("#sekmeler button").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
  }

  function konusma(b) {
    if (!b) return;
    const yazi = Math.round(7 * olcek);
    ctx.font = `${yazi}px "Jersey 10", sans-serif`;
    const w = ctx.measureText(b.metin).width + 8 * olcek;
    const h = yazi + 5 * olcek;
    let x = Math.round(b.x * olcek - w / 2), y = Math.round(b.y * olcek - h);
    x = Math.max(4, Math.min(tuval.width - w - 4, x));
    ctx.fillStyle = "#000"; ctx.fillRect(x + olcek, y + olcek, w, h);
    ctx.fillStyle = "#efe6d2"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#22201c"; ctx.textBaseline = "middle";
    ctx.fillText(b.metin, x + 4 * olcek, y + h / 2 + olcek * 0.5);
  }

  function dongu(z) {
    const dt = Math.min(0.05, (z - son) / 1000 || 0);
    son = z;
    const s = sahneler[aktif];
    s.guncelle(dt);
    kctx.clearRect(0, 0, G, Y);
    s.ciz(kctx);
    ctx.drawImage(kucuk, 0, 0, G * olcek, Y * olcek);
    konusma(s.balon());
    requestAnimationFrame(dongu);
  }

  const nav = document.getElementById("sekmeler");
  sahneler.forEach((s, i) => {
    const b = document.createElement("button");
    b.textContent = `${i + 1} · ${s.ad}`;
    b.onclick = () => sec(i);
    nav.appendChild(b);
  });
  addEventListener("keydown", (e) => { const n = parseInt(e.key, 10); if (n >= 1 && n <= sahneler.length) sec(n - 1); });
  addEventListener("resize", boyutla);

  KAYNAK.hepsiniYukle().then(() => {
    sahneler.forEach((s) => s.kur());
    boyutla();
    sec(0);
    requestAnimationFrame(dongu);
  }).catch((e) => { document.body.insertAdjacentHTML("beforeend", `<p style="color:#e66;padding:20px">${e.message}</p>`); });
})();
