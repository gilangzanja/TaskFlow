const validStatuses = new Set(['Todo', 'In Progress', 'Done']);
const validPriorities = new Set(['Low', 'Medium', 'High']);
const allowedFields = new Set([
  'title',
  'description',
  'category',
  'status',
  'priority',
  'dueDate',
]);

const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const validateTaskInput = (input, { partial = false } = {}) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { data: null, error: 'Task data must be an object.' };
  }

  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    return { data: null, error: 'Task contains unsupported fields.' };
  }

  if (partial && Object.keys(input).length === 0) {
    return { data: null, error: 'Provide at least one task field to update.' };
  }

  const data = {};

  if (!partial || Object.hasOwn(input, 'title')) {
    if (typeof input.title !== 'string' || !input.title.trim()) {
      return { data: null, error: 'Enter a task title.' };
    }
    if (input.title.trim().length > 100) {
      return { data: null, error: 'Task title must be 100 characters or fewer.' };
    }
    data.title = input.title.trim();
  }

  if (!partial || Object.hasOwn(input, 'description')) {
    if (input.description !== undefined && typeof input.description !== 'string') {
      return { data: null, error: 'Enter a valid task description.' };
    }
    data.description = input.description?.trim() ?? '';
    if (data.description.length > 2000) {
      return { data: null, error: 'Task description must be 2000 characters or fewer.' };
    }
  }

  if (!partial || Object.hasOwn(input, 'category')) {
    if (input.category !== undefined && typeof input.category !== 'string') {
      return { data: null, error: 'Enter a valid task category.' };
    }
    const category = input.category?.trim() ?? '';
    if (category.length > 100) {
      return { data: null, error: 'Task category must be 100 characters or fewer.' };
    }
    data.category = category || 'General';
  }

  if (!partial || Object.hasOwn(input, 'status')) {
    const status = input.status ?? 'Todo';
    if (!validStatuses.has(status)) {
      return { data: null, error: 'Choose a valid task status.' };
    }
    data.status = status;
  }

  if (!partial || Object.hasOwn(input, 'priority')) {
    const priority = input.priority ?? 'Medium';
    if (!validPriorities.has(priority)) {
      return { data: null, error: 'Choose a valid task priority.' };
    }
    data.priority = priority;
  }

  if (!partial || Object.hasOwn(input, 'dueDate')) {
    if (!isValidDate(input.dueDate)) {
      return { data: null, error: 'Enter a valid due date.' };
    }
    data.dueDate = input.dueDate;
  }

  return { data, error: null };
};
