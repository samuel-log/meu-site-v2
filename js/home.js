// Fluxo: perfil -> carrossel de fundo na intro -> logo -> home
(function () {
  // Para adicionar imagens: coloque o arquivo em assets/series/ e inclua uma linha aqui.
  // Cada clique no perfil sorteia uma imagem diferente da anterior. As que não existirem são ignoradas.
  const SLIDES = [
    { src: 'assets/series/samuBadFinal1920x1080.png' },
    { src: 'assets/series/theWalkingDead1920x1080.png' },
    { src: 'assets/series/vikingsFinalPoseSerious1920x1080.png' }
    // { src: 'assets/series/samu_note.png' },
  ];
  const intro = document.getElementById('intro-img');
  const tela = document.getElementById('intro-tela');
  let destino = 'topo';

  // descobre quais imagens existem (assim que a página abre)
  let validos = SLIDES.slice();
  Promise.all(SLIDES.map(s => new Promise(ok => { const i = new Image(); i.onload = () => ok(s); i.onerror = () => ok(null); i.src = s.src; })))
    .then(r => { const v = r.filter(Boolean); if (v.length) validos = v; });

  // sorteia uma imagem diferente da última usada (lembra entre visitas)
  function sortear() {
    let ultimo = -1;
    try { ultimo = parseInt(localStorage.getItem('samuflix:ultimo'), 10); } catch (e) {}
    let idx = Math.floor(Math.random() * validos.length);
    if (validos.length > 1) while (idx === ultimo) idx = Math.floor(Math.random() * validos.length);
    try { localStorage.setItem('samuflix:ultimo', idx); } catch (e) {}
    const s = validos[idx];
    if (!intro.src.endsWith(s.src)) intro.src = s.src;   // só troca se for outra, sem piscar
  }

  // roda ANTES da intro.js começar (ela inicia 400ms depois do clique)
  document.getElementById('conta-samuel').addEventListener('click', () => { destino = 'topo'; sortear(); });
  document.getElementById('conta-projetos').addEventListener('click', e => {
    e.preventDefault(); destino = 'projetos'; sortear();
    document.getElementById('contas-tela').classList.add('saindo');
    document.getElementById('logo-samuflix').classList.add('saindo');
    setTimeout(() => SamuflixIntro.iniciar(), 400);
  });

  // fim da animação da logo: espera ~1s e abre a home
  document.addEventListener('samuflix:intro-fim', () => setTimeout(abrirHome, 1000));

  function abrirHome() {
    document.getElementById('contas-tela').classList.add('d-none');
    document.getElementById('logo-samuflix').classList.add('d-none');
    const h = document.getElementById('home');
    h.classList.remove('d-none'); tela.classList.add('saindo-final');
    if (destino === 'projetos') document.getElementById('linha-projetos').scrollIntoView();
  }

  // ---- linhas de cards ----
  const grad = ['#7a0c14,#2b0507', '#0d3b66,#04121f', '#1b5e20,#07200a', '#5b2a86,#1a0b29', '#8a4b08,#2a1602'];
  const linha = (id, titulo, cards) => `<section class="linha" id="${id}"><h3>${titulo}</h3><div class="trilho">${cards}</div></section>`;
  const cardTexto = (t, i) => `<div class="card-sam card-texto" style="background:linear-gradient(135deg,${grad[i % grad.length]})"><span>${t}</span></div>`;
  const D = SAMU, el = document.getElementById('linhas');
  el.innerHTML =
    linha('linha-projetos', 'Meus projetos', D.projetos.map(p => `<button class="card-sam card-proj" data-proj="${p.id}" style="background-image:url('assets/projetos/${p.imgs[0]}')"><span class="card-nome">${p.titulo}</span></button>`).join('')) +
    linha('linha-certificacoes', 'Certificações', D.certificacoes.map(cardTexto).join('')) +
    linha('linha-series', 'Séries favoritas', D.series.map(cardTexto).join('')) +
    linha('linha-habilidades', 'Habilidades', D.habilidades.map(cardTexto).join(''));

  el.addEventListener('click', e => { const c = e.target.closest('[data-proj]'); if (c) SAMU.abrirProjeto(c.dataset.proj); });
  document.querySelectorAll('[data-sobre]').forEach(b => b.onclick = SAMU.abrirSobre);
  document.querySelectorAll('#home-nav a').forEach(a => a.onclick = e => { e.preventDefault(); document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' }); });
  addEventListener('scroll', () => document.getElementById('home-nav').classList.toggle('solida', scrollY > 40));
})();