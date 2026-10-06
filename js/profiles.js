const perfilSamuel = document.getElementById("conta-samuel");
const logoSamuflix = document.getElementById("logo-samuflix");
const introTela = document.getElementById("intro-tela");

perfilSamuel.addEventListener("click", function(event) {
    event.preventDefault();

    document.getElementById("contas-tela").classList.add("saindo");
    logoSamuflix.classList.add("saindo");

    setTimeout(function() {
        introTela.classList.add("entrando");
        }, 400); // Escute esse codigo depois de 400ms, que é o tempo da animação de saida
});