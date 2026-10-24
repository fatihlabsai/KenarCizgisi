// Sahne çizici: etkin sahneyi 320×192 çözünürlükte çizer ve tam sayı katıyla büyütür.
// "kapla" ekranı taşarak doldurur (ana menü), "sigdir" çerçevenin içine sığdırır (oyun).
const CIZICI = (() => {
  const G = 320, Y = 192;
  const kucuk = document.createElement("canvas");
  kucuk.width = G; kucuk.height = Y;
  const kctx = kucuk.getContext("2d");
  kctx.imageSmoothingEnabled = false;

  let hedef = null, olcek = 3, son = 0;

  function goster(tuval, sahne, { mod = "sigdir", kap, balon = true } = {}) {
    hedef = { tuval, ctx: tuval.getContext("2d"), sahne, mod, kap: kap || tuval.parentElement, balon };
    boyutla();
  }

  function durdur() { hedef = null; }

  function boyutla() {
    if (!hedef) return;
    const r = hedef.kap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    olcek = hedef.mod === "kapla"
      ? Math.max(1, Math.ceil(Math.max(r.width / G, r.height / Y)))
      : Math.max(1, Math.floor(Math.min((r.width - 24) / G, (r.height - 24) / Y)));
    hedef.tuval.width = G * olcek;
    hedef.tuval.height = Y * olcek;
    hedef.ctx.imageSmoothingEnabled = false;
  }

  // Konuşma balonu: yazı büyütülmüş tuvale doğrudan yazılır, böylece keskin kalır.
  function konusma(ctx, b) {
    if (!b) return;
    const yazi = Math.round(7 * olcek);
    ctx.font = `${yazi}px "Jersey 10", sans-serif`;
    const w = ctx.measureText(b.metin).width + 8 * olcek;
    const h = yazi + 5 * olcek;
    let x = Math.round(b.x * olcek - w / 2);
    const y = Math.round(b.y * olcek - h);
    x = Math.max(4, Math.min(ctx.canvas.width - w - 4, x));
    ctx.fillStyle = "#000"; ctx.fillRect(x + olcek, y + olcek, w, h);
    ctx.fillStyle = "#efe6d2"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#22201c"; ctx.textBaseline = "middle";
    ctx.fillText(b.metin, x + 4 * olcek, y + h / 2 + olcek * 0.5);
  }

  function dongu(z) {
    const dt = Math.min(0.05, (z - son) / 1000 || 0);
    son = z;
    if (hedef) {
      const { sahne, ctx } = hedef;
      sahne.guncelle(dt);
      kctx.clearRect(0, 0, G, Y);
      sahne.ciz(kctx);
      ctx.drawImage(kucuk, 0, 0, G * olcek, Y * olcek);
      if (hedef.balon && sahne.balon) konusma(ctx, sahne.balon());
    }
    requestAnimationFrame(dongu);
  }

  addEventListener("resize", boyutla);
  requestAnimationFrame(dongu);

  return { goster, durdur, boyutla };
})();
