export const searchTasks = (tasks, keyword) => {
  const searchKeyword = keyword.trim().toLowerCase();

  return tasks.filter((task) => {
    const title = task.title.toLowerCase();
    const description = task.description.toLowerCase();

    return title.includes(searchKeyword) || description.includes(searchKeyword);
  });
};

export const filterByStatus = (tasks, status) => {
  if (status === 'all') {
    return tasks;
  }

  return tasks.filter((task) => task.status === status);
};

export const filterByPriority = (tasks, priority) => {
  if (priority === 'all') {
    return tasks;
  }

  return tasks.filter((task) => task.priority === priority);
};

export const sortByDeadline = (tasks, order) => {
  if (order === 'default') {
    return tasks;
  }

  const sortedTasks = [...tasks];

  sortedTasks.sort((a, b) => {
    const comparison = a.dueDate.localeCompare(b.dueDate);
    return order === 'asc' ? comparison : -comparison;
  });

  return sortedTasks;
};
