$(document).ready(function () {
  const THEME_STORAGE_KEY = 'maximo-crepes-theme';
  const $body = $('body');
  const $mobileMenu = $('#mobile_menu');
  const $mobileToggleButton = $('#mobile_btn');
  const $mobileToggleIcon = $mobileToggleButton.find('i');
  const $mobileNavLinks = $('#mobile_nav_list a');
  const $themeToggles = $('#theme_toggle, #mobile_theme_toggle');
  const $menuButton = $('.menu-button');
  const $dishesSection = $('#dishes');
  const $menuTabs = $('.menu-tab');
  const $menuCategories = $('.menu-category');
  const sections = $('section');
  const anchoredSections = sections.filter(function () {
    const id = $(this).attr('id');
    return id && $(`.nav-item a[href="#${id}"]`).length;
  });
  const prefersDarkScheme = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
  const hasScrollReveal = typeof ScrollReveal === 'function';
  const shouldUseScrollReveal =
    hasScrollReveal &&
    ($('#home').length || $('.dish').length || $('#testimonial_chef').length || $('.feedback').length);
  const scrollReveal = shouldUseScrollReveal ? ScrollReveal() : null;

  function setActiveNavigation() {
    if (!anchoredSections.length) {
      return;
    }

    const scrollPosition = $(window).scrollTop() + 110;
    $('.nav-item').removeClass('active');

    for (let index = anchoredSections.length - 1; index >= 0; index -= 1) {
      const $section = $(anchoredSections[index]);
      const sectionTop = $section.offset().top;
      const sectionId = $section.attr('id');

      if (scrollPosition >= sectionTop) {
        $(`.nav-item a[href="#${sectionId}"]`).parent().addClass('active');
        break;
      }
    }
  }

  function toggleMenuButtonVisibility() {
    if ($dishesSection.length === 0 || $menuButton.length === 0) {
      return;
    }

    const rect = $dishesSection[0].getBoundingClientRect();
    const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;

    if (isVisible) {
      $menuButton.removeClass('hidden');
    } else {
      $menuButton.addClass('hidden');
    }
  }

  function getMenuCategoryOffset() {
    const rawValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--menu-category-offset');
    const numericValue = parseInt(rawValue, 10);

    if (Number.isNaN(numericValue)) {
      return 120;
    }

    return numericValue;
  }

  function setActiveMenuTab() {
    if (!$menuTabs.length || !$menuCategories.length) {
      return null;
    }

    const scrollPosition = $(window).scrollTop() + getMenuCategoryOffset();
    let activeId = null;

    for (let index = $menuCategories.length - 1; index >= 0; index -= 1) {
      const $category = $($menuCategories[index]);
      const categoryTop = $category.offset().top;

      if (scrollPosition >= categoryTop) {
        activeId = $category.attr('id');
        break;
      }
    }

    $menuTabs.removeClass('active');
    if (activeId) {
      $menuTabs.filter(`[data-target="#${activeId}"]`).addClass('active');
    }

    return activeId;
  }

  function updateThemeToggleState(isDark) {
    $themeToggles.each(function () {
      const $toggle = $(this);
      const $icon = $toggle.find('i');
      const $srText = $toggle.find('.sr-only');

      $toggle.attr('aria-pressed', isDark);
      $toggle.toggleClass('is-dark', isDark);

      if ($icon.length) {
        $icon.toggleClass('fa-moon', !isDark);
        $icon.toggleClass('fa-sun', isDark);
      }

      if ($srText.length) {
        $srText.text(isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
      }
    });
  }

  function applyTheme(theme, options) {
    const settings = $.extend({ persist: true }, options);
    const normalizedTheme = theme === 'dark' ? 'dark' : 'light';

    $body.attr('data-theme', normalizedTheme);
    updateThemeToggleState(normalizedTheme === 'dark');

    if (settings.persist) {
      localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    }
  }

  function getStoredTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY);
  }

  function initTheme() {
    const storedTheme = getStoredTheme();

    if (storedTheme) {
      applyTheme(storedTheme);
    } else {
      const prefersDark = prefersDarkScheme ? prefersDarkScheme.matches : false;
      applyTheme(prefersDark ? 'dark' : 'light', { persist: false });
    }
  }

  function closeMobileMenu() {
    $mobileMenu.removeClass('ativo').attr('aria-hidden', true);
    $mobileToggleIcon.removeClass('fa-x');
    $mobileToggleButton.attr('aria-label', 'Abrir menu de navegaÃ§Ã£o');
  }

  initTheme();

  if (prefersDarkScheme) {
    if (typeof prefersDarkScheme.addEventListener === 'function') {
      prefersDarkScheme.addEventListener('change', function (event) {
        if (!getStoredTheme()) {
          applyTheme(event.matches ? 'dark' : 'light', { persist: false });
        }
      });
    } else if (typeof prefersDarkScheme.addListener === 'function') {
      prefersDarkScheme.addListener(function (event) {
        if (!getStoredTheme()) {
          applyTheme(event.matches ? 'dark' : 'light', { persist: false });
        }
      });
    }
  }

  $themeToggles.on('click', function () {
    const nextTheme = $body.attr('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  $mobileToggleButton.on('click', function () {
    const willOpen = !$mobileMenu.hasClass('ativo');

    $mobileMenu.toggleClass('ativo', willOpen).attr('aria-hidden', !willOpen);
    $mobileToggleIcon.toggleClass('fa-x', willOpen);
    $mobileToggleButton.attr(
      'aria-label',
      willOpen ? 'Fechar menu de navegaÃ§Ã£o' : 'Abrir menu de navegaÃ§Ã£o'
    );
  });

  $mobileNavLinks.on('click', function (event) {
    const target = $(this).attr('href');

    if (!target || target === '#') {
      closeMobileMenu();
      return;
    }

    if (!target.startsWith('#')) {
      closeMobileMenu();
      return;
    }

    event.preventDefault();

    const $targetElement = $(target);

    if ($targetElement.length) {
      $('html, body').animate(
        {
          scrollTop: $targetElement.offset().top - 80,
        },
        500,
        function () {
          closeMobileMenu();
        }
      );
    }
  });

  $menuTabs.on('click', function () {
    const target = $(this).data('target');

    if (!target) {
      return;
    }

    const $targetSection = $(target);

    if ($targetSection.length) {
      $('html, body').animate(
        {
          scrollTop: $targetSection.offset().top - 90,
        },
        500
      );
    }

    $menuTabs.removeClass('active');
    $(this).addClass('active');
  });

  $(window).on('scroll', function () {
    setActiveNavigation();
    toggleMenuButtonVisibility();
    setActiveMenuTab();
  });

  $(window).on('resize orientationchange', function () {
    setActiveMenuTab();
  });

  setActiveNavigation();
  toggleMenuButtonVisibility();
  setActiveMenuTab();

  if (scrollReveal) {
    if (typeof scrollReveal.clean === 'function') {
      scrollReveal.clean(
        '.dish, .menu-stat, .menu-card, .menu-header, .localizacao-bloco, .localizacao-mapa, .localizacao-mapa-nota, .sobre-nos .sobre-imagem, .sobre-nos .sobre-texto, .sobre-destaque, #cta, #testimonial_chef, .feedback'
      );
    }

    scrollReveal.reveal('#cta', {
      origin: 'left',
      duration: 1600,
      distance: '18%',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    });

    scrollReveal.reveal('.menu-header', {
      origin: 'bottom',
      duration: 1400,
      distance: '40px',
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.menu-stat', {
      origin: 'bottom',
      duration: 1400,
      distance: '35px',
      interval: 120,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.dish', {
      origin: 'bottom',
      duration: 1500,
      distance: '45px',
      scale: 0.96,
      interval: 140,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.menu-card', {
      origin: 'bottom',
      duration: 1450,
      distance: '42px',
      scale: 0.97,
      interval: 120,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.localizacao-bloco', {
      origin: 'left',
      duration: 1600,
      distance: '40px',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    });

    scrollReveal.reveal('.localizacao-mapa', {
      origin: 'right',
      duration: 1500,
      distance: '40px',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      delay: 120,
    });

    scrollReveal.reveal('.localizacao-mapa-nota', {
      origin: 'bottom',
      duration: 1400,
      distance: '30px',
      delay: 200,
    });

    scrollReveal.reveal('.sobre-nos .sobre-imagem', {
      origin: 'left',
      duration: 1500,
      distance: '40px',
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.sobre-nos .sobre-texto', {
      origin: 'right',
      duration: 1500,
      distance: '40px',
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
      delay: 120,
    });

    scrollReveal.reveal('.sobre-destaque', {
      origin: 'bottom',
      duration: 1200,
      distance: '30px',
      interval: 100,
    });

    scrollReveal.reveal('#testimonial_chef', {
      origin: 'left',
      duration: 1200,
      distance: '20%',
    });

    scrollReveal.reveal('.feedback', {
      origin: 'right',
      duration: 1200,
      distance: '18%',
      interval: 120,
    });
  }
});

