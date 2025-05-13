$(document).ready(function () {
  $("#mobile_btn").on("click", function () {
    $("#mobile_menu").toggleClass("active");
    $("#mobile_btn").find("i").toggleClass("fa-x");
  });

  const sections = $("section");

  $(window).on("scroll", function () {
    const scrollPosition = $(window).scrollTop() + 110;

    $("section").each(function () {
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
