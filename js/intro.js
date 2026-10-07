(function () {
    const PALAVRA = "SAMUFLIX";
    const TEMPO_MIN_LOADER = 1800;
    const TEMPO_MAX_ESPERA = 4000; // nunca trava esperando imagem/fonte (rede da faculdade, file:///)

    const tela = document.getElementById("intro-tela");
    const img = document.getElementById("intro-img");
    const loader = document.getElementById("intro-loader");
    const logo = document.getElementById("intro-logo");

    // FORÇADO: ignora "Reduzir movimento" do Windows/GPO
    const reduzMovimento = false;

    const letras = [...PALAVRA].map(function (c) {
        const s = document.createElement("span");
        s.className = "letra";
        s.setAttribute("aria-hidden", "true");
        s.textContent = c;
        logo.appendChild(s);
        return s;
    });

    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const easeOut = x => 1 - Math.pow(1 - x, 3);
    const mix = (a, b, t) => a + (b - a) * t;
    const lerp = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t)));
    const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

    const NEAR = [150, 157, 176], FAR = [226, 224, 226], WHITE = [255, 255, 255], RED = [229, 9, 20];

    // passo = quantos px entre cada camada da sombra (1 = máxima qualidade).
    // Em PC sem GPU o passo sobe sozinho e a sombra fica bem mais leve.
    let passo = 1;

    function sombra(depth, fade) {
        if (depth < 1.5) return "none";
        const out = [];
        for (let i = 1; i <= depth; i += passo) {
            const k = Math.pow(i / depth, 0.9) * 0.85 + fade * 0.15;
            out.push(`${(i * 0.55).toFixed(2)}px ${i}px 0 ${rgb(lerp(NEAR, FAR, clamp(k + fade * (1 - k))))}`);
        }
        const a = (0.32 * (1 - fade)).toFixed(3);
        out.push(`${(depth * 0.55).toFixed(1)}px ${depth.toFixed(1)}px ${(depth * 0.35 + 2).toFixed(1)}px rgba(110,118,140,${a})`);
        out.push(`${(depth * 0.3).toFixed(1)}px ${(depth * 0.5).toFixed(1)}px ${(depth * 0.2 + 2).toFixed(1)}px rgba(110,118,140,${(a * 0.8).toFixed(3)})`);
        return out.join(",");
    }

    const ST = 0.09;
    const E = 1.5;
    const S0 = 1.65, S1 = 1.97;
    const D = 62;
    const FIM = S1 + 0.4;
    let inicio = null, raf, iniciou = false, concluido = false, ultimo = null, lentos = 0;

    function frame(agora) {
        if (inicio === null) inicio = agora;
        const t = (agora - inicio) / 1000;

        // detecta máquina lenta e simplifica a sombra automaticamente
        if (ultimo !== null) {
            const dt = agora - ultimo;
            if (dt > 40) lentos++; else lentos = Math.max(0, lentos - 1);
            if (lentos >= 3 && passo < 4) { passo = passo === 1 ? 3 : 4; lentos = 0; }
        }
        ultimo = agora;

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

        const u = Math.max(0, t - S1);
        const y = Math.sin(u * 64) * Math.exp(-u * 20) * 5;
        logo.style.transform = `translateY(calc(-4% + ${y.toFixed(2)}px))`;

        if (t < FIM) {
            raf = requestAnimationFrame(frame);
        } else {
            estadoFinal();
            logo.style.transform = "translateY(-4%)";
            terminar();
        }
    }

    function estadoFinal() {
        letras.forEach(function (el) {
            el.style.webkitMaskImage = "none";
            el.style.maskImage = "none";
            el.style.opacity = 1;
            el.style.color = rgb(RED);
            el.style.textShadow = "none";
            el.style.transform = "none";
        });
    }

    function terminar() {
        if (concluido) return;
        concluido = true;
        setTimeout(function () {
            tela.classList.add("concluida");
            document.dispatchEvent(new CustomEvent("samuflix:intro-fim"));
        }, 700);
    }

    function tocarLogo() {
        cancelAnimationFrame(raf);
        inicio = null;
        ultimo = null;
        raf = requestAnimationFrame(frame);
        // rede de segurança: se o rAF for engasgado/pausado, a intro ainda termina
        setTimeout(function () {
            if (!concluido) {
                cancelAnimationFrame(raf);
                estadoFinal();
                terminar();
            }
        }, (FIM + 2.5) * 1000);
    }

    // ---------- loader ----------
    const limite = ms => new Promise(function (ok) { setTimeout(ok, ms); });

    // nunca espera mais que TEMPO_MAX_ESPERA (Google Fonts bloqueado, file:///, etc.)
    const imagemPronta = () =>
        Promise.race([
            (img.decode ? img.decode() : Promise.resolve()).catch(function () {}),
            limite(TEMPO_MAX_ESPERA)
        ]);

    const fontePronta = () =>
        Promise.race([
            (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).catch(function () {}),
            limite(TEMPO_MAX_ESPERA)
        ]);

    function iniciar() {
        if (iniciou) return;
        iniciou = true;

        tela.classList.add("entrando");

        Promise.all([imagemPronta(), fontePronta(), limite(TEMPO_MIN_LOADER)]).then(function () {
            loader.classList.add("fim");
            setTimeout(function () { tela.classList.add("claro"); }, 350);
            setTimeout(tocarLogo, 350 + 950);
        });
    }

    window.SamuflixIntro = { iniciar: iniciar };
})();
