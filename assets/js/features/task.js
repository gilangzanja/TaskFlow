export const addTask = (task, taskData) => {
  const newTask = {
    id: crypto.randomUUID(),
    ...taskData,
  };

  task.push(newTask);
  return newTask;
};

export const getTask = (tasks, id) => {
  return tasks.find((task) => String(task.id) === String(id));
};

export const updateTask = (tasks, id, updateData) => {
  const task = getTask(tasks, id);

  if (!task) {
    return false;
  }

  Object.assign(task, updateData);
  return true;
};

export const deleteTask = (tasks, id) => {
  return tasks.filter((task) => String(task.id) !== String(id));
};
