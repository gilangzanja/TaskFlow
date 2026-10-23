const icons = {
  success: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"></path></svg>',
  error: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4m0 4h.01"></path><circle cx="12" cy="12" r="9"></circle></svg>',
};

export const showToast = (title, message, type = 'success') => {
  const toastRegion = document.querySelector('#toastRegion');

  if (!toastRegion) {
    console.error('Toast region not found');
    return;
  }

  const isError = type === 'error';
  const toast = document.createElement('article');
  toast.className = `toast toast--${isError ? 'error' : 'success'}`;
  toast.setAttribute('role', isError ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = 'toast__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = icons[isError ? 'error' : 'success'];

  const content = document.createElement('div');
  content.className = 'toast__content';

  const heading = document.createElement('p');
  heading.className = 'toast__title';
  heading.textContent = title;

  const description = document.createElement('p');
  description.className = 'toast__message';
  description.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.className = 'toast__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close notification');
  closeButton.textContent = '×';

  content.append(heading, description);
  toast.append(icon, content, closeButton);
  toastRegion.append(toast);

  const removeToast = () => {
    window.clearTimeout(timeoutId);
    toast.classList.add('toast--leaving');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    window.setTimeout(() => toast.remove(), 250);
  };

  closeButton.addEventListener('click', removeToast);
  const timeoutId = window.setTimeout(removeToast, 4500);
};
