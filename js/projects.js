// Dados + modal + página de detalhe dos projetos
window.SAMU = {
  projetos: [
    { id: 'food-pay', titulo: 'Food-Pay', ano: 2026, classe: 'Projeto Integrador SENAI',
      resumo: 'Gestão financeira da alimentação escolar. Fui responsável por todo o front-end.',
      papel: 'Front-end: telas, componentes e integração com a API.',
      tags: ['React', 'Vite', '.NET', 'SQL Server'],
      imgs: ['food-pay.png', 'food-pay-responsavel.png'] },
    { id: 'landing-page', titulo: 'Landing Page', ano: 2026, classe: 'Projeto Integrador SENAI',
      resumo: 'Site do nosso produto do Projeto Integrador, feito com HTML e Bootstrap.',
      papel: 'Estrutura, layout responsivo e identidade visual.',
      tags: ['HTML', 'Bootstrap'],
      imgs: ['landing-page.png','landing-page2.png','landing-page3.png','landing-page4.png','landing-page5.png','landing-page6.png','landing-page7.png'] }
  ],
  certificacoes: ['Técnico em Eletromecânica', 'ADS (cursando)', 'Inglês (cursando)', 'Responsive Web Design', 'JavaScript', 'Git & GitHub', 'Bootstrap 5', 'Lógica de Programação', 'Fundamentos de UX/UI'],
  series: ['Breaking Bad', 'One Piece', 'Naruto', 'Death Note', 'Mentalista'],
  habilidades: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'Git', 'GitHub', 'React', 'Python', 'Back-end', 'Bancos de dados', 'UX/UI']
};

(function () {
  const img = (p, f) => `assets/projetos/${f}`;
  const modalEl = document.getElementById('modal-sam');
  const conteudo = document.getElementById('modal-conteudo');
  const modal = new bootstrap.Modal(modalEl);

  SAMU.abrirSobre = function () {
    conteudo.innerHTML = `
      <div class="modal-topo" style="background-image:url('assets/s.jpeg')"><button class="modal-x" data-bs-dismiss="modal" aria-label="Fechar">✕</button></div>
      <div class="p-4">
        <h3 class="fw-bold">Sobre mim</h3>
        <p class="text-secondary">Tenho 18 anos e estudo ADS no SENAI. Comecei pela Eletromecânica, onde aprendi a me virar diante do que ainda não dominava. Hoje foco em Full Stack: HTML, CSS e JavaScript, e estou ampliando React, Python, back-end e bancos de dados.</p>
        <p class="text-secondary mb-0">Criativo, independente e competitivo. Basquete desde os 15 anos.</p>
      </div>`;
    modal.show();
  };

  SAMU.abrirProjeto = function (id) {
    const p = SAMU.projetos.find(x => x.id === id);
    const slides = p.imgs.map((f, i) => `<div class="carousel-item ${i ? '' : 'active'}" data-bs-interval="2800"><img src="${img(0, f)}" class="d-block w-100" alt="${p.titulo} ${i + 1}"></div>`).join('');
    conteudo.innerHTML = `
      <div class="modal-topo-car position-relative">
        <div id="car-proj" class="carousel slide carousel-fade" data-bs-ride="carousel"><div class="carousel-inner">${slides}</div></div>
        <div class="modal-degrade"></div>
        <button class="modal-x" data-bs-dismiss="modal" aria-label="Fechar">✕</button>
        <h3 class="modal-titulo">${p.titulo}</h3>
        <button class="btn btn-light fw-bold modal-play" id="ver-mais">▶ Ver mais</button>
      </div>
      <div class="p-4 row g-4">
        <div class="col-md-8"><p class="mb-2"><span class="verde">${p.ano}</span> <span class="selo">${p.imgs.length} telas</span></p><p>${p.resumo}</p></div>
        <div class="col-md-4 small text-secondary"><p><span class="text-white-50">Série:</span> ${p.classe}</p><p class="mb-0"><span class="text-white-50">Gêneros:</span> ${p.tags.join(', ')}</p></div>
      </div>`;
    conteudo.querySelector('#ver-mais').onclick = () => { modal.hide(); SAMU.abrirDetalhe(id); };
    modal.show();
  };

  // ---- Página de detalhe: nav lateral que desce devagar + parallax ----
  let raf, alvoY = 0, atualY = 0;
  SAMU.abrirDetalhe = function (id) {
    const p = SAMU.projetos.find(x => x.id === id);
    const d = document.getElementById('detalhe');
    const secs = [['resumo', 'Resumo'], ['papel', 'Meu papel'], ['tecnologias', 'Tecnologias'], ['telas', 'Telas']];
    d.innerHTML = `
      <div class="det-fundo" style="background-image:url('${img(0, p.imgs[0])}')"></div>
      <button class="det-voltar" id="det-voltar">← Voltar</button>
      <div class="container-fluid"><div class="row">
        <aside class="col-3 det-lateral"><ul id="det-nav" class="list-unstyled">
          <li class="det-nome">${p.titulo}</li>
          ${secs.map(([k, t]) => `<li><a href="#det-${k}" data-k="${k}">${t}</a></li>`).join('')}
        </ul></aside>
        <main class="col-9 det-main">
          <section id="det-resumo"><h2>${p.titulo}</h2><p class="lead">${p.resumo}</p><p class="text-secondary">${p.classe} · ${p.ano}</p></section>
          <section id="det-papel"><h2>Meu papel</h2><p class="lead">${p.papel}</p></section>
          <section id="det-tecnologias"><h2>Tecnologias</h2><div class="d-flex flex-wrap gap-2">${p.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div></section>
          <section id="det-telas"><h2>Telas</h2>${p.imgs.map(f => `<img src="${img(0, f)}" class="det-img" alt="">`).join('')}</section>
        </main>
      </div></div>`;
    document.getElementById('home').classList.add('d-none');
    d.classList.remove('d-none'); window.scrollTo(0, 0);
    d.querySelector('#det-voltar').onclick = fecharDetalhe;
    d.querySelectorAll('#det-nav a').forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById('det-' + a.dataset.k).scrollIntoView({ behavior: 'smooth' }); });
    const nav = d.querySelector('#det-nav'), fundo = d.querySelector('.det-fundo');
    const loop = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const prog = max > 0 ? scrollY / max : 0;
      alvoY = prog * (innerHeight - nav.offsetHeight - 160);
      atualY += (alvoY - atualY) * 0.035;            // desce bem devagar
      nav.style.transform = `translateY(${atualY.toFixed(1)}px)`;
      fundo.style.transform = `translateY(${(scrollY * 0.25).toFixed(1)}px) scale(1.15)`; // parallax
      let ativo = secs[0][0];
      secs.forEach(([k]) => { if (document.getElementById('det-' + k).getBoundingClientRect().top < innerHeight * 0.4) ativo = k; });
      nav.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.k === ativo));
      raf = requestAnimationFrame(loop);
    };
    atualY = 0; loop();
  };
  function fecharDetalhe() {
    cancelAnimationFrame(raf);
    document.getElementById('detalhe').classList.add('d-none');
    document.getElementById('home').classList.remove('d-none');
    document.getElementById('linha-projetos').scrollIntoView();
  }
})();
