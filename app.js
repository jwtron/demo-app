const STORAGE_KEY = "focus-list-tasks";
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const activeCount = document.querySelector("#activeCount");
const doneCount = document.querySelector("#doneCount");
const clearDoneButton = document.querySelector("#clearDone");
const filterButtons = [...document.querySelectorAll("[data-filter]")];

let currentFilter = "all";
let tasks = loadTasks();

function loadTasks() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [
      {
        id: "welcome-1",
        title: "Add the first real task",
        done: false,
        createdAt: 1
      },
      {
        id: "welcome-2",
        title: "Ship the simple version",
        done: true,
        createdAt: 2
      }
    ];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveTasks() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter((task) => !task.done);
  if (currentFilter === "done") return tasks.filter((task) => task.done);
  return tasks;
}

function render() {
  const visibleTasks = getVisibleTasks();
  const completed = tasks.filter((task) => task.done).length;
  const active = tasks.length - completed;

  activeCount.textContent = `${active} active`;
  doneCount.textContent = `${completed} done`;
  clearDoneButton.disabled = completed === 0;
  emptyState.hidden = visibleTasks.length > 0;

  filterButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.filter === currentFilter);
  });

  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = task.done ? "task done" : "task";

  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  const title = document.createElement("span");
  const deleteButton = document.createElement("button");

  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  title.textContent = task.title;

  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  label.append(checkbox, title);
  item.append(label, deleteButton);
  return item;
}

function addTask(title) {
  tasks = [
    {
      id: window.crypto.randomUUID(),
      title,
      done: false,
      createdAt: Date.now()
    },
    ...tasks
  ];
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  addTask(title);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

clearDoneButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  render();
});

render();
