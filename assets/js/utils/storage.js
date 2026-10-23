const TASKS_STORAGE_KEY = 'taskFlow-tasks';

export const loadTasks = (defaultTasks) => {
  const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

  if (storedTasks === null) {
    return defaultTasks.map((task) => ({ ...task }));
  }

  let parsedTasks;

  try {
    parsedTasks = JSON.parse(storedTasks);
  } catch (error) {
    console.error('Saved task data is invalid JSON; using the default tasks.', error);
    return defaultTasks.map((task) => ({ ...task }));
  }

  if (!Array.isArray(parsedTasks)) {
    console.error('Saved task data is not an array; using the default tasks.');
    return defaultTasks.map((task) => ({ ...task }));
  }

  return parsedTasks;
};

export const saveTasks = (tasks) => {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};