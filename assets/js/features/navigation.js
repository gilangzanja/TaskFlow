const routes = new Set(['dashboard', 'tasks', 'progress']);

const getRoute = () => {
  const hash = window.location.hash;
  const requestedRoute = hash.startsWith('#/')
    ? hash.slice(2)
    : hash.slice(1);
  const route = requestedRoute === 'overview' ? 'dashboard' : requestedRoute;

  return routes.has(route) ? route : 'dashboard';
};

export const initNavigation = () => {
  const pages = document.querySelectorAll('[data-page]');
  const pageContainer = document.querySelector('[data-page-container]');
  const routeLinks = document.querySelectorAll('[data-route-link]');

  if (pages.length === 0 || !pageContainer || routeLinks.length === 0) {
    console.error('Navigation page elements not found');
    return;
  }

  const renderRoute = () => {
    const route = getRoute();
    const canonicalHash = `#/${route}`;

    pages.forEach((page) => {
      page.hidden = page.dataset.page !== route;
    });

    pageContainer.hidden = route === 'dashboard';
    pageContainer.classList.toggle('page-layout--single', route !== 'dashboard');

    routeLinks.forEach((link) => {
      if (link.dataset.routeLink === route) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${canonicalHash}`,
      );
    }
  };

  window.addEventListener('hashchange', renderRoute);
  renderRoute();
};
