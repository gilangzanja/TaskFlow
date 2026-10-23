export const initSidebar = () => {
  const sidebar = document.querySelector('#sidebar');
  const menuToggle = document.querySelector('#menuToggle');
  const overlay = document.querySelector('#sidebarOverlay');

  if (!sidebar || !menuToggle || !overlay) {
    console.error('Sidebar elements not found');
    return;
  }

  const openSidebar = () => {
    sidebar.classList.add('is-open');
    overlay.classList.remove('hidden');
    menuToggle.setAttribute('aria-expanded', 'true');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('is-open');
    overlay.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isClosed = !sidebar.classList.contains('is-open');

    if (isClosed) {
      openSidebar();
    } else {
      closeSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);

  sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });
};
