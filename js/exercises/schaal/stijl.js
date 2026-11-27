// exercises/schaal/stijl.js — gedeelde CSS voor oefen- en uitlegscherm.
export function voegSchaalStijlToe() {
  if (document.getElementById("schaal-stijl")) return;
  const s = document.createElement("style");
  s.id = "schaal-stijl";
  s.textContent = `
  .schaal-plaat{display:flex;justify-content:center;margin:8px 0 12px}
  .schaal-plaat svg{border-radius:12px;box-shadow:0 2px 10px rgba(30,50,80,.12)}
  .schaal-info{background:#eef5ff;border-left:6px solid #2f6fb5;border-radius:10px;padding:8px 14px;margin:8px 0;font-size:1rem;line-height:1.45}
  .schaal-vraag{font-size:1.25rem;line-height:1.45;margin:10px 0;font-weight:600}
  .schaal-hint-rij{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:6px 0}
  .schaal-hint{background:#fff7e0;border-left:6px solid #e8913a;border-radius:10px;padding:8px 14px;margin:6px 0;line-height:1.45}
  .schaal-antwoordrij{display:flex;align-items:center;justify-content:center;gap:12px;margin:8px auto 12px;max-width:420px}
  .schaal-antwoordrij .antwoord-scherm{margin:0;flex:1 1 auto;min-width:9ch;max-width:220px}
  .schaal-eenheid{font-size:1.3rem;font-weight:700;color:#2f6fb5}
  .schaal-uitleg{background:#fff;border:2px solid #d9e2ec;border-radius:14px;padding:12px 16px;margin:12px 0}
  .schaal-uitleg h3{margin:0 0 6px;font-size:1.1rem;color:#2f6fb5}
  .schaal-uitleg ol{margin:6px 0 10px;padding-left:22px;line-height:1.6;font-size:1.05rem}
  .schaal-tabel{border-collapse:collapse;margin:8px 0;font-size:1.05rem}
  .schaal-tabel th,.schaal-tabel td{border:2px solid #cfd9e6;padding:6px 14px;text-align:center}
  .schaal-tabel th{background:#eef3fa}
  .schaal-volgende{display:flex;justify-content:center;margin:10px 0}
  .sch-sectie{margin:22px 0}
  .sch-sectie h2{font-size:1.3rem;color:#2f6fb5;margin:0 0 8px}
  .sch-uitleg p,.sch-uitleg li{font-size:1.1rem;line-height:1.55}
  .sch-tip{background:#fff7e0;border-left:6px solid #e8913a;border-radius:10px;padding:10px 14px;margin:10px 0;font-size:1.05rem}
  .sch-rij{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;margin:10px 0}
  .sch-rij>*{flex:1 1 300px;min-width:0}
  .sch-som{display:inline-block;background:#eef3fa;border-radius:8px;padding:2px 8px;font-weight:700}
  `;
  document.head.appendChild(s);
}

/** HTML van een verhoudingstabel: rijen[0] is de kopregel. */
export function tabelHtml(rijen) {
  const [kop, ...rest] = rijen;
  return `<table class="schaal-tabel"><tr>${kop.map((k) => `<th>${k}</th>`).join("")}</tr>` +
    rest.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") + "</table>";
}
