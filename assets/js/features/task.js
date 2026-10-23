export const getTask = (tasks, id) => {
  return tasks.find((task) => String(task.id) === String(id));
};

export const deleteTask = (tasks, id) => {
  return tasks.filter((task) => String(task.id) !== String(id));
};
