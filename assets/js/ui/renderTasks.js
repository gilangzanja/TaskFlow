import { formatDate } from '../utils/date.js';

const statusStyle = {
  Todo: 'task-status--todo',
  'In Progress': 'task-status--in-progress',
  Done: 'task-status--done',
};

const priorityStyles = {
  Low: 'task-priority--low',
  Medium: 'task-priority--medium',
  High: 'task-priority--high',
};

const statusOptions = ['Todo', 'In Progress', 'Done'];
const priorityOptions = ['Low', 'Medium', 'High'];

const escapeHTML = (value = '') => {
  const characters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(value).replace(/[&<>"']/g, (character) => {
    return characters[character];
  });
};

export const renderTasks = (tasks, taskList, { hasActiveFilters = false } = {}) => {
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="col-span-full rounded-2xl border border-dashed
        border-slate-300 bg-white p-8 text-center
        dark:border-slate-700 dark:bg-slate-900">
        <p class="font-semibold">${hasActiveFilters ? 'No tasks match your search or filters' : 'No tasks yet'}</p>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          ${hasActiveFilters ? 'Try changing or resetting the filters.' : 'Tasks you create will appear here.'}
        </p>
      </div>
    `;

    return;
  }

  taskList.innerHTML = tasks
    .map((task) => {
      const safeTitle = escapeHTML(task.title);
      const safeDescription = escapeHTML(task.description);
      const safeCategory = escapeHTML(task.category);
      const formattedDate = escapeHTML(formatDate(task.dueDate));

      const statusClass = statusStyle[task.status] ?? statusStyle.Todo;

      const priorityClass = priorityStyles[task.priority] ?? priorityStyles.Medium;
      const statusSelectOptions = statusOptions
        .map((status) => `
          <option value="${status}" ${task.status === status ? 'selected' : ''}>
            ${status}
          </option>
        `)
        .join('');
      const prioritySelectOptions = priorityOptions
        .map((priority) => `
          <option value="${priority}" ${task.priority === priority ? 'selected' : ''}>
            ${priority}
          </option>
        `)
        .join('');

      return `
        <article
          class="rounded-2xl border border-slate-200 bg-white p-5
            shadow-sm transition hover:-translate-y-0.5 hover:shadow-md
            dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <span
              class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs
                font-medium text-slate-600 dark:bg-slate-800
                dark:text-slate-300"
            >
              ${safeCategory}
            </span>

            <select
              data-action="status"
              data-id="${escapeHTML(task.id)}"
              aria-label="Change status for ${safeTitle}"
              class="task-card-select rounded-lg px-2.5 py-1 text-xs font-semibold
                ring-1 ring-inset ${statusClass}"
            >
              ${statusSelectOptions}
            </select>
          </div>

          <h4 class="text-base font-bold leading-6">
            ${safeTitle}
          </h4>

          <p class="mt-2 min-h-10 text-sm leading-5
            text-slate-500 dark:text-slate-400">
            ${safeDescription}
          </p>

          <div class="mt-5 flex flex-wrap items-center
            justify-between gap-3 border-t border-slate-100
            pt-4 dark:border-slate-800">
            <select
              data-action="priority"
              data-id="${escapeHTML(task.id)}"
              aria-label="Change priority for ${safeTitle}"
              class="task-card-select rounded-lg px-2.5 py-1 text-xs
                font-semibold ${priorityClass}"
            >
              ${prioritySelectOptions}
            </select>

            <span class="text-xs font-medium text-slate-500
              dark:text-slate-400">
              ◷ ${formattedDate}
            </span>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              data-action="edit"
              data-id="${escapeHTML(task.id)}"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200
                px-3 py-2 text-xs font-semibold text-slate-700 transition
                hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-indigo-500
                dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"></path>
              </svg>
              Edit
            </button>

            <button
              type="button"
              data-action="delete"
              data-id="${escapeHTML(task.id)}"
              class="inline-flex items-center gap-2 rounded-lg border border-rose-200
                px-3 py-2 text-xs font-semibold text-rose-600 transition
                hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-rose-500
                dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <path d="M3 6h18"></path>
                <path d="M8 6V4h8v2m3 0-1 14H6L5 6"></path>
                <path d="M10 11v5m4-5v5"></path>
              </svg>
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join('');
};
