import { renderStats } from './ui/renderStats.js';
import { renderTasks } from './ui/renderTasks.js';
import { showToast } from './ui/toast.js';

import { initTheme } from './features/theme.js';
import { getCurrentUser, initAuth, signOut } from './features/auth.js';
import { initSidebar } from './features/sidebar.js';
import { initNavigation } from './features/navigation.js';
import { closeModal, initModal, openModal } from './features/modal.js';
import { initDeleteConfirmation } from './features/deleteConfirmation.js';

import { getTask, deleteTask } from './features/task.js';
import { filterByPriority, filterByStatus, searchTasks, sortByDeadline } from './features/taskFilter.js';
import { createTaskRepository } from './data/taskRepository.js';

let taskData = [];
let editingTaskId = null;
let confirmDeleteTask = null;
let activeUserId = null;
let sessionLoadGeneration = 0;
let authUI = null;
let taskRepository = null;

const taskList = document.querySelector('#taskList');
const statsGrid = document.querySelector('#statsGrid');
const progressSummary = document.querySelector('#progressSummary');
const themeButton = document.querySelector('#themeToggle');
const accountEmail = document.querySelector('#accountEmail');
const signOutButton = document.querySelector('#signOutButton');

const addTaskButton = document.querySelector('#addTaskButton');
const taskForm = document.querySelector('#taskForm');
const modalTitle = document.querySelector('#modalTitle');
const saveTaskButton = document.querySelector('#saveTaskButton');
const taskStatusPriorityFields = document.querySelector('#taskStatusPriorityFields');

const taskTitle = document.querySelector('#taskTitle');
const taskDescription = document.querySelector('#taskDescription');
const taskCategory = document.querySelector('#taskCategory');
const taskStatus = document.querySelector('#taskStatus');
const taskPriority = document.querySelector('#taskPriority');
const taskDueDate = document.querySelector('#taskDueDate');
const searchInput = document.querySelector('#searchInput');
const statusFilter = document.querySelector('#statusFilter');
const priorityFilter = document.querySelector('#priorityFilter');
const sortDeadline = document.querySelector('#sortDeadline');
const resetFilterButton = document.querySelector('#resetFilterButton');
const taskResultCount = document.querySelector('#taskResultCount');

const getVisibleTasks = () => {
  const searchedTasks = searchTasks(taskData, searchInput.value);
  const statusFilteredTasks = filterByStatus(searchedTasks, statusFilter.value);
  const priorityFilteredTasks = filterByPriority(statusFilteredTasks, priorityFilter.value);

  return sortByDeadline(priorityFilteredTasks, sortDeadline.value);
};

const refreshDashboard = () => {
  renderStats(taskData, statsGrid, progressSummary);
  handleFilterChange();
};

const replaceTask = (updatedTask) => {
  const taskIndex = taskData.findIndex((task) => task.id === updatedTask.id);

  if (taskIndex !== -1) {
    taskData[taskIndex] = updatedTask;
  }
};

const handleFilterChange = () => {
  const visibleTasks = getVisibleTasks();
  const hasActiveFilters =
    searchInput.value.trim() !== '' ||
    statusFilter.value !== 'all' ||
    priorityFilter.value !== 'all';

  renderTasks(visibleTasks, taskList, { hasActiveFilters });
  taskResultCount.textContent = `Showing ${visibleTasks.length} of ${taskData.length} tasks`;
};

const handleAddTask = () => {
  editingTaskId = null;

  taskForm.reset();

  modalTitle.textContent = 'Add new task';
  saveTaskButton.textContent = 'Save task';
  taskStatusPriorityFields.hidden = false;

  openModal();
};

const handleEditTask = (id) => {
  const task = getTask(taskData, id);

  if (!task) {
    return;
  }

  editingTaskId = id;

  modalTitle.textContent = 'Edit task';
  saveTaskButton.textContent = 'Save task';
  taskStatusPriorityFields.hidden = true;

  taskTitle.value = task.title;
  taskDescription.value = task.description;
  taskCategory.value = task.category;
  taskDueDate.value = task.dueDate;

  openModal();
};

const handleSaveTask = async (event) => {
  event.preventDefault();

  const taskInput = {
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    category: taskCategory.value.trim() || 'General',
    dueDate: taskDueDate.value,
  };

  if (!taskInput.title || !taskInput.dueDate) {
    showToast(
      'Task details missing',
      'Task title and due date are required.',
      'error',
    );
    return;
  }

  if (!activeUserId) {
    showToast('Sign in required', 'Sign in before saving tasks.', 'error');
    return;
  }

  const isEditing = editingTaskId !== null;
  const requestUserId = activeUserId;
  saveTaskButton.disabled = true;

  try {
    if (editingTaskId !== null) {
      const updatedTask = await taskRepository.update(editingTaskId, taskInput);
      if (activeUserId !== requestUserId) {
        return;
      }
      replaceTask(updatedTask);
    } else {
      const createdTask = await taskRepository.create({
        ...taskInput,
        status: taskStatus.value,
        priority: taskPriority.value,
      });
      if (activeUserId !== requestUserId) {
        return;
      }
      taskData.push(createdTask);
    }

    refreshDashboard();
    closeModal();
    taskForm.reset();
    taskStatusPriorityFields.hidden = false;
    editingTaskId = null;

    showToast(
      isEditing ? 'Task updated' : 'Task added',
      `"${taskInput.title}" was successfully ${isEditing ? 'updated' : 'added'}.`,
    );
  } catch (error) {
    console.error('Task could not be saved.', error);
    showToast('Task save failed', 'Your task could not be saved. Please try again.', 'error');
  } finally {
    saveTaskButton.disabled = false;
  }
};

const handleTaskAttributeChange = async (event) => {
  const select = event.target.closest('select[data-action]');

  if (!select || !taskList.contains(select)) {
    return;
  }

  const { action, id } = select.dataset;
  const validValues = {
    status: ['Todo', 'In Progress', 'Done'],
    priority: ['Low', 'Medium', 'High'],
  }[action];

  if (!validValues || !validValues.includes(select.value)) {
    console.error(`Invalid task attribute value for "${action}"`);
    return;
  }

  const task = getTask(taskData, id);

  if (!task) {
    console.error(`Task "${id}" was not found`);
    return;
  }

  const nextValue = select.value;
  const requestUserId = activeUserId;
  select.disabled = true;

  try {
    const updatedTask = await taskRepository.update(id, { [action]: nextValue });
    if (activeUserId !== requestUserId) {
      return;
    }
    replaceTask(updatedTask);
    refreshDashboard();
  } catch (error) {
    console.error(`Task "${id}" could not be updated.`, error);
    select.value = task[action];
    showToast('Task update failed', 'The task change could not be saved.', 'error');
  } finally {
    select.disabled = false;
  }
};

const handleDeleteTask = async (id) => {
  const task = getTask(taskData, id);

  if (!task) {
    return;
  }

  const isConfirmed = await confirmDeleteTask(task.title);

  if (!isConfirmed) {
    return;
  }

  const requestUserId = activeUserId;

  try {
    await taskRepository.remove(id);
    if (activeUserId !== requestUserId) {
      return;
    }
    taskData = deleteTask(taskData, id);
    refreshDashboard();
    showToast('Task deleted', `"${task.title}" was successfully deleted.`);
  } catch (error) {
    console.error(`Task "${id}" could not be deleted.`, error);
    showToast('Task deletion failed', 'The task could not be deleted. Please try again.', 'error');
  }
};

const handleTaskAction = (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button || !taskList.contains(button)) {
    return;
  }

  const { action, id } = button.dataset;

  if (action === 'edit') {
    handleEditTask(id);
  }

  if (action === 'delete') {
    handleDeleteTask(id);
  }
};
const bindTaskEvents = () => {
  addTaskButton.addEventListener('click', handleAddTask);
  taskForm.addEventListener('submit', handleSaveTask);
  taskList.addEventListener('click', handleTaskAction);
  taskList.addEventListener('change', handleTaskAttributeChange);
  searchInput.addEventListener('input', handleFilterChange);
  statusFilter.addEventListener('change', handleFilterChange);
  priorityFilter.addEventListener('change', handleFilterChange);
  sortDeadline.addEventListener('change', handleFilterChange);
  resetFilterButton.addEventListener('click', () => {
    searchInput.value = '';
    statusFilter.value = 'all';
    priorityFilter.value = 'all';
    sortDeadline.value = 'default';
    handleFilterChange();
  });
};

const clearTaskData = () => {
  taskData = [];
  taskForm.reset();
  taskStatusPriorityFields.hidden = false;
  editingTaskId = null;
  closeModal();
  refreshDashboard();
};

const handleSessionChange = async (session) => {
  const generation = ++sessionLoadGeneration;

  if (!session) {
    activeUserId = null;
    clearTaskData();
    accountEmail.textContent = '';
    authUI.showAuthScreen();
    return;
  }

  const userId = session.id;

  if (activeUserId === userId) {
    authUI.showApp();
    return;
  }

  activeUserId = userId;
  clearTaskData();
  accountEmail.textContent = session.email ?? 'Signed in';
  authUI.showApp();
  taskList.innerHTML = `
    <div class="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p class="font-semibold">Loading your tasks…</p>
    </div>
  `;

  try {
    const userTasks = await taskRepository.listForUser();

    if (generation !== sessionLoadGeneration || activeUserId !== userId) {
      return;
    }

    taskData = userTasks;
    refreshDashboard();
  } catch (error) {
    if (generation !== sessionLoadGeneration || activeUserId !== userId) {
      return;
    }

    console.error('Tasks could not be loaded.', error);
    taskData = [];
    refreshDashboard();
    showToast('Tasks could not be loaded', 'Check your connection and try again.', 'error');
  }
};

const initializeApp = async () => {
  if (
    !taskList ||
    !statsGrid ||
    !progressSummary ||
    !themeButton ||
    !addTaskButton ||
    !taskForm ||
    !modalTitle ||
    !saveTaskButton ||
    !taskStatusPriorityFields ||
    !taskTitle ||
    !taskDescription ||
    !taskCategory ||
    !taskStatus ||
    !taskPriority ||
    !taskDueDate ||
    !searchInput ||
    !statusFilter ||
    !priorityFilter ||
    !sortDeadline ||
    !resetFilterButton ||
    !taskResultCount ||
    !accountEmail ||
    !signOutButton
  ) {
    console.error('Dashboard or task form elements not found');
    return;
  }

  const appLoading = document.querySelector('#appLoading');
  initTheme(themeButton);
  initSidebar();
  initNavigation();
  initModal();
  confirmDeleteTask = initDeleteConfirmation();

  if (!confirmDeleteTask) {
    return;
  }

  bindTaskEvents();

  taskRepository = createTaskRepository();
  authUI = initAuth(handleSessionChange);
  window.addEventListener('taskflow:unauthorized', () => handleSessionChange(null));

  signOutButton.addEventListener('click', async () => {
    signOutButton.disabled = true;
    document.querySelector('#app').inert = true;

    try {
      const result = await signOut();
      await handleSessionChange(null);

      if (!result.remoteRevoked) {
        showToast(
          'Signed out',
          'The browser session was cleared, but remote session revocation could not be confirmed.',
          'error',
        );
      }
    } catch (error) {
      console.error('Sign out failed.', error);
      showToast('Sign out failed', 'Could not sign out. Please try again.', 'error');
    } finally {
      signOutButton.disabled = false;
      document.querySelector('#app').inert = false;
    }
  });

  try {
    const user = await getCurrentUser();
    await handleSessionChange(user);
  } catch (error) {
    console.error('The current session could not be restored.', error);
    authUI.showAuthScreen();
    showToast('Session check failed', 'You can still try signing in again.', 'error');
  } finally {
    appLoading.hidden = true;
  }
};

initializeApp();
