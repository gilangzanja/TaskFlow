const editableFieldColumns = {
  title: 'title',
  description: 'description',
  category: 'category',
  status: 'status',
  priority: 'priority',
  dueDate: 'due_date',
};

export const mapTaskToDatabase = (task, userId) => ({
  user_id: userId,
  title: task.title.trim(),
  description: task.description ?? '',
  category: task.category?.trim() || 'General',
  status: task.status,
  priority: task.priority,
  due_date: task.dueDate,
});

export const mapTaskPatchToDatabase = (taskPatch) => {
  const databasePatch = {};

  Object.entries(editableFieldColumns).forEach(([taskField, column]) => {
    if (Object.hasOwn(taskPatch, taskField)) {
      databasePatch[column] =
        taskField === 'title' ? taskPatch[taskField].trim() : taskPatch[taskField];
    }
  });

  return databasePatch;
};

export const mapTaskFromDatabase = (task) => ({
  id: task.id,
  userId: task.user_id,
  title: task.title,
  description: task.description,
  category: task.category,
  status: task.status,
  priority: task.priority,
  dueDate: task.due_date,
});

const apiRequest = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const result = await response.json();

  if (response.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('taskflow:unauthorized'));
  }

  if (!response.ok) {
    throw new Error(result.error ?? 'The task request could not be completed.');
  }

  return result;
};

export const createTaskRepository = () => ({
  async listForUser() {
    const { tasks } = await apiRequest('/api/tasks');
    return tasks;
  },

  async create(task) {
    const { task: createdTask } = await apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return createdTask;
  },

  async update(id, taskPatch) {
    const { task: updatedTask } = await apiRequest(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(taskPatch),
    });
    return updatedTask;
  },

  async remove(id) {
    await apiRequest(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
});
