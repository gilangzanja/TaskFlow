const taskModal = document.querySelector('#taskModal');
const closeModalButton = document.querySelector('#closeModalButton');
const cancelTaskButton = document.querySelector('#cancelTaskButton');
const taskTitle = document.querySelector('#taskTitle');

let previousFocusElement = null;

export const openModal = () => {
  previousFocusElement = document.activeElement;

  taskModal.classList.remove('hidden');
  taskModal.classList.add('flex');

  taskTitle.focus();
};

export const closeModal = () => {
  taskModal.classList.add('hidden');
  taskModal.classList.remove('flex');

  previousFocusElement?.focus();
};

export const initModal = () => {
  closeModalButton.addEventListener('click', closeModal);
  cancelTaskButton.addEventListener('click', closeModal);

  taskModal.addEventListener('click', (event) => {
    if (event.target === taskModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !taskModal.classList.contains('hidden')) {
      closeModal();
    }

    if (event.key === 'Tab' && !taskModal.classList.contains('hidden')) {
      const focusableElements = [...taskModal.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])')];

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
};
