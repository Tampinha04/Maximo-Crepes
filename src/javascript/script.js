// script.js — Máximo Crepes (corrigido UTF-8, FA6/FA5, acessibilidade)

$(document).ready(function () {
  const THEME_STORAGE_KEY = 'maximo-crepes-theme';

  const $body = $('body');
  const rootElement = document.documentElement;
  const $header = $('.site-header');
  const $preloader = $('#page_preloader');
  const $mobileMenu = $('#mobile_menu');
  const $mobileToggleButton = $('#mobile_btn');
  const $mobileToggleIcon = $mobileToggleButton.find('i');
  const $mobileNavLinks = $('#mobile_nav_list a');
  const $themeToggles = $('#theme_toggle, #mobile_theme_toggle');
  const $menuButton = $('.menu-button');
  const $dishesSection = $('#dishes');

  const $menuTabs = $('.menu-tab');
  const $menuCategories = $('.menu-category');
  const $menuTabsContainer = $('.menu-tabs');
  const $menuTabsPanel = $('.menu-tabs__panel');
  const $menuTabsToggle = $('.menu-tabs__toggle');
  const $menuTabsOverlay = $('.menu-tabs__overlay');

  let currentActiveMenuTab = null;
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

  const sections = $('section');
  const anchoredSections = sections.filter(function () {
    const id = $(this).attr('id');
    return id && $(`.nav-item a[href="#${id}"]`).length;
  });

  const prefersDarkScheme = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  const mobileTabsQuery = window.matchMedia
    ? window.matchMedia('(max-width: 768px)')
    : null;

  const hasScrollReveal = typeof ScrollReveal === 'function';
  const shouldUseScrollReveal =
    hasScrollReveal &&
    ($('#home').length || $('.dish').length || $('#testimonial_chef').length || $('.feedback').length);
  const scrollReveal = shouldUseScrollReveal ? ScrollReveal() : null;

  // ---------- Navegação e botões ----------
  function setActiveNavigation() {
    if (!anchoredSections.length) return;

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

  function setHeaderOffset() {
    if (!$header.length) return;
    const headerHeight = $header.outerHeight();
    if (headerHeight) {
      rootElement.style.setProperty('--header-offset', `${headerHeight}px`);
    }
  }

  function hidePreloader() {
    if (!$preloader.length || $preloader.hasClass('is-hidden')) return;
    $preloader.addClass('is-hidden');
    setTimeout(function () {
      $preloader.remove();
    }, 650);
  }

  function updateHeaderVisibility() {
    if (!$header.length) return;

    const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const delta = currentY - lastScrollY;
    const threshold = 140;

    if ($mobileMenu.hasClass('ativo')) {
      $header.removeClass('is-hidden');
      lastScrollY = currentY;
      return;
    }

    if (currentY > threshold) {
      $header.addClass('is-floating');
    } else {
      $header.removeClass('is-floating');
    }

    if (delta > 4 && currentY > threshold + 20) {
      $header.addClass('is-hidden');
    } else if (delta < -4 || currentY <= threshold) {
      $header.removeClass('is-hidden');
    }

    lastScrollY = currentY <= 0 ? 0 : currentY;
  }

  function toggleMenuButtonVisibility() {
    if ($dishesSection.length === 0 || $menuButton.length === 0) return;

    const rect = $dishesSection[0].getBoundingClientRect();
    const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
    $menuButton.toggleClass('hidden', !isVisible);
  }

  function getMenuCategoryOffset() {
    const rawValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--menu-category-offset');
    const numericValue = parseInt(rawValue, 10);
    return Number.isNaN(numericValue) ? 120 : numericValue;
  }

  // ---------- Abas do cardápio (tabs/dropdown) ----------
  function isDropdownTabsMode() {
    if (!$menuTabsToggle.length) return false;
    if (mobileTabsQuery && typeof mobileTabsQuery.matches === 'boolean') {
      return mobileTabsQuery.matches;
    }
    return $menuTabsToggle.is(':visible');
  }

  function setMenuTabsOpenState(isOpen) {
    if (!$menuTabsContainer.length || !$menuTabsToggle.length) return;

    const shouldOpen = Boolean(isOpen) && isDropdownTabsMode();

    $menuTabsContainer.toggleClass('is-open', shouldOpen);
    $menuTabsToggle.attr('aria-expanded', shouldOpen);

    if ($menuTabsPanel.length) {
      if (isDropdownTabsMode()) {
        $menuTabsPanel.attr('aria-hidden', !shouldOpen);
      } else {
        $menuTabsPanel.removeAttr('aria-hidden');
      }
    }

    if ($menuTabsOverlay.length) {
      if (shouldOpen) {
        $menuTabsOverlay.removeAttr('hidden');
      } else {
        $menuTabsOverlay.attr('hidden', 'hidden');
      }
    }
  }

  function openMenuTabs()  { setMenuTabsOpenState(true);  }
  function closeMenuTabs() { setMenuTabsOpenState(false); }

  function toggleMenuTabs() {
    if (!$menuTabsContainer.length || !$menuTabsToggle.length || !isDropdownTabsMode()) return;
    setMenuTabsOpenState(!$menuTabsContainer.hasClass('is-open'));
  }

  function centerMenuTab($tab) {
    if (!$tab || !$tab.length) return;

    const $scrollContainer = $tab.closest('.menu-tabs__panel').length
      ? $tab.closest('.menu-tabs__panel')
      : $tab.closest('.menu-tabs');

    if (!$scrollContainer.length) return;

    const container = $scrollContainer[0];
    if (!container || container.scrollWidth <= container.clientWidth) return;

    const tab = $tab[0];
    const containerRect = container.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const offset =
      tabRect.left -
      containerRect.left +
      container.scrollLeft -
      containerRect.width / 2 +
      tabRect.width / 2;

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const nextScrollLeft = Math.min(maxScrollLeft, Math.max(0, offset));
    const shouldReduceMotion = Boolean(reduceMotionQuery && reduceMotionQuery.matches);

    if (typeof container.scrollTo === 'function' && !shouldReduceMotion) {
      container.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
      return;
    }

    if (!shouldReduceMotion && typeof $scrollContainer.stop === 'function' && typeof $scrollContainer.animate === 'function') {
      $scrollContainer.stop(true, false).animate({ scrollLeft: nextScrollLeft }, 240);
      return;
    }

    container.scrollLeft = nextScrollLeft;
  }

  function setActiveMenuTab() {
    if (!$menuTabs.length || !$menuCategories.length) return null;

    const scrollPosition = $(window).scrollTop() + getMenuCategoryOffset();
    let activeId = null;

    for (let i = $menuCategories.length - 1; i >= 0; i -= 1) {
      const $category = $($menuCategories[i]);
      const categoryTop = $category.offset().top;
      if (scrollPosition >= categoryTop) {
        activeId = $category.attr('id');
        break;
      }
    }

    $menuTabs.removeClass('active');
    if (activeId) {
      const $activeTab = $menuTabs.filter(`[data-target="#${activeId}"]`);
      $activeTab.addClass('active');

      if (activeId !== currentActiveMenuTab) {
        currentActiveMenuTab = activeId;
        centerMenuTab($activeTab);
      }
    } else {
      currentActiveMenuTab = null;
    }
    return activeId;
  }

  // ---------- Tema claro/escuro ----------
  function updateThemeToggleState(isDark) {
    $themeToggles.each(function () {
      const $toggle = $(this);
      const $srText = $toggle.find('.sr-only');
      const $stateText = $toggle.find('.theme-toggle__state');

      $toggle.attr('aria-pressed', isDark);
      $toggle.toggleClass('is-dark', isDark);

      if ($stateText.length) {
        $stateText.text(isDark ? 'Modo escuro' : 'Modo claro');
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

  // ---------- Menu mobile ----------
  function setMobileIcon(open) {
    // Remove variações e aplica a que existir no seu projeto
    $mobileToggleIcon.removeClass('fa-x fa-xmark fa-times');
    // FA6
    if ($mobileToggleIcon.length && typeof $mobileToggleIcon.addClass === 'function') {
      $mobileToggleIcon.toggleClass('fa-xmark', open);
      // fallback FA5
      $mobileToggleIcon.toggleClass('fa-times', open && !$mobileToggleIcon.hasClass('fa-xmark'));
    }
  }

  function closeMobileMenu() {
    $mobileMenu.removeClass('ativo').attr('aria-hidden', true);
    setMobileIcon(false);
    $mobileToggleButton.attr('aria-label', 'Abrir menu de navegação');
  }

  // Init tema
  initTheme();

  if (prefersDarkScheme) {
    if (typeof prefersDarkScheme.addEventListener === 'function') {
      prefersDarkScheme.addEventListener('change', function (event) {
        if (!getStoredTheme()) applyTheme(event.matches ? 'dark' : 'light', { persist: false });
      });
    } else if (typeof prefersDarkScheme.addListener === 'function') {
      prefersDarkScheme.addListener(function (event) {
        if (!getStoredTheme()) applyTheme(event.matches ? 'dark' : 'light', { persist: false });
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
    setMobileIcon(willOpen);
    $mobileToggleButton.attr('aria-label', willOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
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
        { scrollTop: $targetElement.offset().top - 80 },
        500,
        function () { closeMobileMenu(); }
      );
    }
  });

  $menuTabs.on('click', function () {
    const $tab = $(this);
    const target = $tab.data('target');
    const usingDropdown = isDropdownTabsMode();
    if (!target) return;

    const $targetSection = $(target);
    const targetId = typeof target === 'string' ? target.replace('#', '') : null;

    if ($targetSection.length) {
      const scrollOffset = Math.max(0, getMenuCategoryOffset() - 24);
      const destination = Math.max(0, $targetSection.offset().top - scrollOffset);
      const shouldReduceMotion = Boolean(reduceMotionQuery && reduceMotionQuery.matches);
      if (shouldReduceMotion) {
        window.scrollTo({ top: destination, left: 0, behavior: 'auto' });
      } else {
        $('html, body').stop(true, false).animate({ scrollTop: destination }, 500);
      }
    }

    $menuTabs.removeClass('active');
    $tab.addClass('active');
    currentActiveMenuTab = targetId;
    centerMenuTab($tab);

    if (usingDropdown) {
      closeMenuTabs();
      if ($menuTabsToggle.length) $menuTabsToggle.trigger('focus');
    }
  });

  // ---------- Eventos de janela (com rAF-throttle leve) ----------
  let scrollScheduled = false;
  function onScrollRaf() {
    scrollScheduled = false;
    setActiveNavigation();
    toggleMenuButtonVisibility();
    updateHeaderVisibility();
    setActiveMenuTab();
  }

  $(window).on('scroll', function () {
    if (!scrollScheduled) {
      scrollScheduled = true;
      (window.requestAnimationFrame || setTimeout)(onScrollRaf, 16);
    }
  });

  $(window).on('resize orientationchange', function () {
    setHeaderOffset();
    setActiveMenuTab();
    setMenuTabsOpenState(false);
  });

  if ($menuTabsToggle.length) {
    $menuTabsToggle.on('click', function (event) {
      event.preventDefault();
      toggleMenuTabs();
    });
  }

  if ($menuTabsOverlay.length) {
    $menuTabsOverlay.on('click', function () {
      closeMenuTabs();
    });
  }

  $(document).on('keydown', function (event) {
    if (event.key === 'Escape' && $menuTabsContainer.hasClass('is-open') && isDropdownTabsMode()) {
      closeMenuTabs();
      if ($menuTabsToggle.length) $menuTabsToggle.trigger('focus');
    }
  });

  // ---------- Estado inicial ----------
  setMenuTabsOpenState(false);
  setActiveNavigation();
  toggleMenuButtonVisibility();
  setHeaderOffset();
  updateHeaderVisibility();
  setActiveMenuTab();

  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    $(window).on('load', hidePreloader);
  }

  // ---------- ScrollReveal (se disponível) ----------
  if (scrollReveal) {
    if (typeof scrollReveal.clean === 'function') {
      scrollReveal.clean(
        '.dish, .menu-stat, .menu-card, .menu-header, .localizacao-bloco, .localizacao-mapa, .localizacao-mapa-nota, .sobre-nos .sobre-imagem, .sobre-nos .sobre-texto, .sobre-destaque, #cta, #testimonial_chef, .feedback'
      );
    }

    scrollReveal.reveal('#cta', {
      origin: 'left', duration: 1600, distance: '18%',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    });

    scrollReveal.reveal('.menu-header', {
      origin: 'bottom', duration: 1400, distance: '40px',
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.menu-stat', {
      origin: 'bottom', duration: 1400, distance: '35px', interval: 120,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.dish', {
      origin: 'bottom', duration: 1500, distance: '45px', scale: 0.96, interval: 140,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.menu-card', {
      origin: 'bottom', duration: 1450, distance: '42px', scale: 0.97, interval: 120,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
    });

    scrollReveal.reveal('.localizacao-bloco', {
      origin: 'left', duration: 1600, distance: '40px',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    });

    scrollReveal.reveal('.localizacao-mapa', {
      origin: 'right', duration: 1500, distance: '40px',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 120,
    });
  }
});

