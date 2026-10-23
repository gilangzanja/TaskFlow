export const initDeleteConfirmation = () => {
  const dialog = document.querySelector('#deleteConfirmDialog');
  const taskName = document.querySelector('#deleteConfirmTaskName');
  const cancelButton = document.querySelector('#cancelDeleteButton');
  const confirmButton = document.querySelector('#confirmDeleteButton');

  if (!dialog || !taskName || !cancelButton || !confirmButton) {
    console.error('Delete confirmation dialog elements not found');
    return null;
  }

  let resolveConfirmation = null;
  let previousFocusElement = null;

  const closeDialog = (confirmed) => {
    if (!resolveConfirmation) {
      return;
    }

    dialog.classList.add('hidden');
    dialog.classList.remove('flex');
    previousFocusElement?.focus();

    const resolve = resolveConfirmation;
    resolveConfirmation = null;
    previousFocusElement = null;
    resolve(confirmed);
  };

  cancelButton.addEventListener('click', () => closeDialog(false));
  confirmButton.addEventListener('click', () => closeDialog(true));

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeDialog(false);
    }
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog(false);
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = [cancelButton, confirmButton];
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return (name) => {
    if (resolveConfirmation) {
      return Promise.resolve(false);
    }

    previousFocusElement = document.activeElement;
    taskName.textContent = name;
    dialog.classList.remove('hidden');
    dialog.classList.add('flex');
    cancelButton.focus();

    return new Promise((resolve) => {
      resolveConfirmation = resolve;
    });
  };
};
