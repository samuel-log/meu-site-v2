/* =========================================================
   INTRO DO SAMUFLIX
   1. mostra a imagem escura com o loader vermelho neon
   2. quando a imagem + fonte estão prontas (mín. 1,8s), o loader some,
      a imagem dissolve para o fundo claro e a logo entra
   3. no fim dispara o evento "samuflix:intro-fim"
   ========================================================= */
(function () {
    const PALAVRA = "SAMUFLIX";
    const TEMPO_MIN_LOADER = 1800; // ms que o loader fica visível, mesmo se tudo carregar rápido

    const tela = document.getElementById("intro-tela");
    const img = document.getElementById("intro-img");
    const loader = document.getElementById("intro-loader");
    const logo = document.getElementById("intro-logo");
    const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const letras = [...PALAVRA].map(function (c) {
        const s = document.createElement("span");
        s.className = "letra";
        s.setAttribute("aria-hidden", "true");
        s.textContent = c;
        logo.appendChild(s);
        return s;
    });

    // ---------- utilidades ----------
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const easeOut = x => 1 - Math.pow(1 - x, 3);
    const mix = (a, b, t) => a + (b - a) * t;
    const lerp = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t)));
    const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

    // Cores da sombra longa: perto da letra é cinza-azulado, longe some no escuro
    const NEAR = [150, 157, 176], FAR = [226, 224, 226], WHITE = [255, 255, 255], RED = [229, 9, 20];

    function sombra(depth, fade) {
        if (depth < 1.5) return "none";
        const out = [];
        for (let i = 1; i <= depth; i++) {
            const k = Math.pow(i / depth, 0.9) * 0.85 + fade * 0.15;
            out.push(`${(i * 0.55).toFixed(2)}px ${i}px 0 ${rgb(lerp(NEAR, FAR, clamp(k + fade * (1 - k))))}`);
        }
        const a = (0.32 * (1 - fade)).toFixed(3);
        out.push(`${(depth * 0.55).toFixed(1)}px ${depth.toFixed(1)}px ${(depth * 0.35 + 2).toFixed(1)}px rgba(110,118,140,${a})`);
        out.push(`${(depth * 0.3).toFixed(1)}px ${(depth * 0.5).toFixed(1)}px ${(depth * 0.2 + 2).toFixed(1)}px rgba(110,118,140,${(a * 0.8).toFixed(3)})`);
        return out.join(",");
    }

    // ---------- linha do tempo da logo (segundos) ----------
    const ST = 0.09;            // intervalo entre o início de cada letra
    const E = 1.5;              // todas chegam na proporção final juntas
    const S0 = 1.65, S1 = 1.97; // descida com impacto
    const D = 62;               // profundidade máxima da sombra
    const FIM = S1 + 0.4;
    let inicio = null, raf, iniciou = false;

    function frame(agora) {
        if (inicio === null) inicio = agora;
        const t = (agora - inicio) / 1000;

        const s = clamp((t - S0) / (S1 - S0));
        const sE = Math.pow(s, 4);
        const cT = clamp((s - 0.7) / 0.3), c = cT * cT * (3 - 2 * cT);

        letras.forEach(function (el, i) {
            const st = i * ST;
            const r = easeOut(clamp((t - st) / 0.35));
            const e = mix(-14, 100, r);
            const m = r >= 1 ? "none" : `linear-gradient(90deg,#000 ${e}%,transparent ${e + 14}%)`;
            el.style.webkitMaskImage = m;
            el.style.maskImage = m;
            el.style.opacity = r > 0 ? 1 : 0;

            const x = clamp((t - st) / (E - st));
            const g = 1 - Math.pow(1 - x, 3);

            el.style.textShadow = sombra(D * g * (1 - sE), sE);
            el.style.color = rgb(lerp(WHITE, RED, c));
            el.style.transform = `translateY(${((1 - g) * 34).toFixed(2)}px) scale(${(0.86 + 0.14 * g).toFixed(4)})`;
        });

        // tremida curta no impacto
        const u = Math.max(0, t - S1);
        const y = Math.sin(u * 64) * Math.exp(-u * 20) * 5;
        logo.style.transform = `translateY(calc(-4% + ${y.toFixed(2)}px))`;

        if (t < FIM) {
            raf = requestAnimationFrame(frame);
        } else {
            logo.style.transform = "translateY(-4%)";
            terminar();
        }
    }

    function estadoFinal() {
        letras.forEach(function (el) {
            el.style.opacity = 1;
            el.style.color = rgb(RED);
            el.style.textShadow = "none";
            el.style.transform = "none";
        });
    }

    function terminar() {
        // pequena pausa com a logo vermelha parada, depois avisa o resto do site
        setTimeout(function () {
            tela.classList.add("concluida");
            document.dispatchEvent(new CustomEvent("samuflix:intro-fim"));
        }, 700);
    }

    function tocarLogo() {
        if (reduzMovimento) {
            estadoFinal();
            terminar();
            return;
        }
        cancelAnimationFrame(raf);
        inicio = null;
        raf = requestAnimationFrame(frame);
    }

    // ---------- loader ----------
    // decode() espera a imagem baixar e decodificar (e resolve na hora se já estiver pronta)
    const imagemPronta = () => (img.decode ? img.decode() : Promise.resolve()).catch(function () {});

    function iniciar() {
        if (iniciou) return;
        iniciou = true;

        tela.classList.add("entrando");

        const espera = new Promise(function (ok) { setTimeout(ok, TEMPO_MIN_LOADER); });
        const fonte = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

        Promise.all([imagemPronta(), fonte, espera]).then(function () {
            loader.classList.add("fim");
            // 1) loader some  2) imagem dissolve para o fundo claro  3) logo entra
            setTimeout(function () { tela.classList.add("claro"); }, 350);
            setTimeout(tocarLogo, 350 + 950);
        });
    }

    window.SamuflixIntro = { iniciar: iniciar };
})();
