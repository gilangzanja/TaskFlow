import { tasks } from './data/tasks.js';

import { renderStats } from './ui/renderStats.js';
import { renderTasks } from './ui/renderTasks.js';
import { showToast } from './ui/toast.js';

import { initTheme } from './features/theme.js';
import { initSidebar } from './features/sidebar.js';
import { initNavigation } from './features/navigation.js';
import { closeModal, initModal, openModal } from './features/modal.js';
import { initDeleteConfirmation } from './features/deleteConfirmation.js';

import { addTask, getTask, updateTask, deleteTask } from './features/task.js';
import { filterByPriority, filterByStatus, searchTasks, sortByDeadline } from './features/taskFilter.js';
import { loadTasks, saveTasks } from './utils/storage.js';

let taskData = loadTasks(tasks);
let editingTaskId = null;
let confirmDeleteTask = null;

const taskList = document.querySelector('#taskList');
const statsGrid = document.querySelector('#statsGrid');
const progressSummary = document.querySelector('#progressSummary');
const themeButton = document.querySelector('#themeToggle');

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

const handleSaveTask = (event) => {
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

  const isEditing = editingTaskId !== null;

  if (editingTaskId !== null) {
    if (!updateTask(taskData, editingTaskId, taskInput)) {
      showToast('Task update failed', 'The task could not be found.', 'error');
      return;
    }
  } else {
    addTask(taskData, {
      ...taskInput,
      status: taskStatus.value,
      priority: taskPriority.value,
    });
  }

  saveTasks(taskData);
  refreshDashboard();

  closeModal();
  taskForm.reset();
  taskStatusPriorityFields.hidden = false;

  editingTaskId = null;

  showToast(
    isEditing ? 'Task updated' : 'Task added',
    `"${taskInput.title}" was successfully ${isEditing ? 'updated' : 'added'}.`,
  );
};

const handleTaskAttributeChange = (event) => {
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

  if (!updateTask(taskData, id, { [action]: select.value })) {
    console.error(`Task "${id}" was not found`);
    return;
  }

  saveTasks(taskData);
  refreshDashboard();
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

  taskData = deleteTask(taskData, id);
  saveTasks(taskData);
  refreshDashboard();
  showToast('Task deleted', `"${task.title}" was successfully deleted.`);
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
const initializeApp = () => {
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
    !taskResultCount
  ) {
    console.error('Dashboard or task form elements not found');
    return;
  }

  refreshDashboard();
  initTheme(themeButton);
  initSidebar();
  initNavigation();
  initModal();
  confirmDeleteTask = initDeleteConfirmation();

  if (!confirmDeleteTask) {
    return;
  }

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

initializeApp();
