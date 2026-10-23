export const renderStats = (tasks, statsGrid, progressSummary) => {
  const total = tasks.length;

  const todoCount = tasks.filter((task) => task.status === 'Todo').length;

  const inProgressCount = tasks.filter((task) => task.status === 'In Progress').length;

  const doneCount = tasks.filter((task) => task.status === 'Done').length;

  const completionRate = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const statistic = [
    {
      label: 'Total Tasks',
      value: total,
      helper: 'All tasks',
      icon: '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M8 2v4m8-4v4M3 10h18M8 14h2m4 0h2m-8 3h2m4 0h2"></path></svg>',
      iconStyle: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300',
    },
    {
      label: 'To Do',
      value: todoCount,
      helper: 'Waiting to be started',
      icon: '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>',
      iconStyle: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      helper: 'Currently in progress',
      icon: '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M7 17 17 7M8 7h9v9"></path></svg>',
      iconStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300',
    },
    {
      label: 'Completed',
      value: doneCount,
      helper: `${completionRate}% of tasks completed`,
      icon: '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="m5 12 4 4L19 6"></path></svg>',
      iconStyle: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300',
    },
  ];

  statsGrid.innerHTML = statistic
    .map(
      (item) => `
        <article
          class="rounded-2xl border border-slate-200 bg-white p-5
            shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-start justify-between">
            <p class="text-sm font-medium text-slate-500
              dark:text-slate-400">
              ${item.label}
            </p>

            <span class="flex h-10 w-10 items-center
              justify-center rounded-xl text-xl ${item.iconStyle}">
              ${item.icon}
            </span>
          </div>

          <p class="mt-4 text-3xl font-bold tracking-tight">
            ${item.value}
          </p>

          <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            ${item.helper}
          </p>
        </article>
      `,
    )
    .join('');

  const progressItems = [
    {
      label: 'Todo',
      count: todoCount,
      color: 'bg-amber-500',
    },
    {
      label: 'In Progress',
      count: inProgressCount,
      color: 'bg-blue-500',
    },
    {
      label: 'Done',
      count: doneCount,
      color: 'bg-emerald-500',
    },
  ];

  progressSummary.innerHTML = progressItems
    .map((item) => {
      const percentage = total === 0 ? 0 : Math.round((item.count / total) * 100);

      return `
        <div>
          <div class="mb-2 flex items-center justify-between gap-3">
            <span class="text-sm font-medium">${item.label}</span>

            <span class="text-sm text-slate-500 dark:text-slate-400">
              ${item.count} ${item.count === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div class="h-2 overflow-hidden rounded-full
            bg-slate-100 dark:bg-slate-800">
            <div
              class="h-full rounded-full ${item.color}"
              style="width: ${percentage}%"
            ></div>
          </div>
        </div>
      `;
    })
    .join('');
};
