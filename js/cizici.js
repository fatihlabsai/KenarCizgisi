// Sahne çizici: etkin sahneyi kendi küçük çözünürlüğünde (varsayılan 320×192) çizer ve tam sayı katıyla büyütür.
// "kapla" ekranı taşarak doldurur (ana menü), "sigdir" çerçevenin içine sığdırır (oyun).
// Sahne isterse büyütülmüş tuvale ayrıca yazı çizebilir: balon() ya da ustCiz(ctx, olcek).
const CIZICI = (() => {
  const kucuk = document.createElement("canvas");
  const kctx = kucuk.getContext("2d");

  let hedef = null, olcek = 3, son = 0, G = 320, Y = 192;

  function goster(tuval, sahne, { mod = "sigdir", kap, balon = true } = {}) {
    hedef = { tuval, ctx: tuval.getContext("2d"), sahne, mod, kap: kap || tuval.parentElement, balon };
    G = sahne.G || 320; Y = sahne.Y || 192;
    kucuk.width = G; kucuk.height = Y;
    kctx.imageSmoothingEnabled = false;
    boyutla();
  }

  function durdur() { hedef = null; }
  const etkin = () => hedef && hedef.sahne;

  function boyutla() {
    if (!hedef) return;
    const r = hedef.kap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    olcek = hedef.mod === "kapla"
      ? Math.max(1, Math.ceil(Math.max(r.width / G, r.height / Y)))
      : Math.max(1, Math.floor(Math.min((r.width - 12) / G, (r.height - 12) / Y)));
    hedef.tuval.width = G * olcek;
    hedef.tuval.height = Y * olcek;
    hedef.ctx.imageSmoothingEnabled = false;
  }

  // Konuşma balonu: yazı büyütülmüş tuvale doğrudan yazılır, böylece keskin kalır.
  function konusma(ctx, b, o = olcek) {
    if (!b) return;
    const yazi = Math.round(7 * o);
    ctx.font = `${yazi}px "Jersey 10", sans-serif`;
    const w = ctx.measureText(b.metin).width + 8 * o;
    const h = yazi + 5 * o;
    let x = Math.round(b.x * o - w / 2);
    const y = Math.max(2, Math.round(b.y * o - h));
    x = Math.max(4, Math.min(ctx.canvas.width - w - 4, x));
    ctx.fillStyle = "#000"; ctx.fillRect(x + o, y + o, w, h);
    ctx.fillStyle = b.renk || "#efe6d2"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = b.yaziRenk || "#22201c"; ctx.textBaseline = "middle";
    ctx.fillText(b.metin, x + 4 * o, y + h / 2 + o * 0.5);
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
      if (hedef.balon && sahne.balon) {
        const b = sahne.balon();
        (Array.isArray(b) ? b : [b]).forEach((x) => konusma(ctx, x));
      }
      if (sahne.ustCiz) sahne.ustCiz(ctx, olcek);
    }
    requestAnimationFrame(dongu);
  }

  addEventListener("resize", boyutla);
  requestAnimationFrame(dongu);

  return { goster, durdur, boyutla, etkin, konusma };
})();
