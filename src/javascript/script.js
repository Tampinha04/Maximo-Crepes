$(document).ready(function () {
  // Ao clicar no botão de hambúrguer
  $("#mobile_btn").on("click", function () {
    // Alterna a classe 'ativo' para mostrar/ocultar o menu lateral
    $("#mobile_menu").toggleClass("ativo");

    // Alterna a classe 'fa-x' no ícone para mudar de hambúrguer para "X"
    $("#mobile_btn").find("i").toggleClass("fa-x");
  });

  // Lógica para ativar o item de navegação com base no scroll
  const sections = $("section");
  $(window).on("scroll", function () {
    const scrollPosition = $(window).scrollTop() + 110;

    sections.each(function () {
      const sectionTop = $(this).offset().top;
      const sectionHeight = $(this).outerHeight();
      const sectionId = $(this).attr("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        $(".nav-item").removeClass("active");
        $(`.nav-item a[href="#${sectionId}"]`).parent().addClass("active");
      }
    });
  });

  // Adiciona rolagem suave e fecha o menu ao clicar nas opções do menu
  $("#mobile_nav_list a").on("click", function (e) {
    e.preventDefault(); // Impede o comportamento padrão de navegação

    var target = $(this).attr("href"); // Obtém o href da âncora
    $("html, body").animate(
      {
        scrollTop: $(target).offset().top - 80, // Ajuste a posição da rolagem
      },
      500, // Duração da animação
      function () {
        // Fecha o menu após a rolagem
        $("#mobile_menu").removeClass("ativo");
        $("#mobile_btn").find("i").removeClass("fa-x");
      }
    );
  });

  // ScrollReveal
  ScrollReveal().reveal("#cta", {
    origin: "left",
    duration: 2000,
    distance: "20%",
  });

  ScrollReveal().reveal(".dish", {
    origin: "left",
    duration: 2000,
    distance: "20%",
  });

  ScrollReveal().reveal("#testimonial_chef", {
    origin: "left",
    duration: 1000,
    distance: "20%",
  });

  ScrollReveal().reveal(".feedback", {
    origin: "right",
    duration: 1000,
    distance: "20%",
  });
});
