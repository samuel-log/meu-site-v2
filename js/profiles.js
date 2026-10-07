const perfilSamuel = document.getElementById("conta-samuel");
const logoSamuflix = document.getElementById("logo-samuflix");
const contasTela = document.getElementById("contas-tela");

perfilSamuel.addEventListener("click", function (event) {
    event.preventDefault();

    contasTela.classList.add("saindo");
    logoSamuflix.classList.add("saindo");

    setTimeout(function () {
        SamuflixIntro.iniciar();
    }, 400); // tempo da animação de saída
});

// Dispara quando a animação da logo termina
document.addEventListener("samuflix:intro-fim", function () {
    console.log("Intro terminou");
    // aqui você mostra a home, ex:
    // introTela.classList.remove("entrando");
    // document.getElementById("home-screen").classList.remove("d-none");
});
