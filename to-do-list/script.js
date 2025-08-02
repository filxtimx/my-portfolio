const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const prioritySelect = document.getElementById("priority");
const dueDateInput = document.getElementById("due-date");
const filterButtons = document.querySelectorAll(".filters button");
const dailyCompleteEl = document.getElementById("daily-complete");
const congratsEl = document.getElementById("congrats");
const themeToggle = document.getElementById("theme-toggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";
let today = new Date().toISOString().split("T")[0];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  const filtered = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = `task ${task.priority} ${task.completed ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    };

    const span = document.createElement("span");
    span.textContent = task.text;

    const due = document.createElement("small");
    due.textContent = task.dueDate ? `Due: ${task.dueDate}` : "";

    const remove = document.createElement("button");
    remove.textContent = "\u2716";
    remove.onclick = () => {
      tasks = tasks.filter(t => t !== task);
      saveTasks();
      renderTasks();
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(due);
    li.appendChild(remove);
    taskList.appendChild(li);
  });

  const completedToday = tasks.filter(t => t.completed && t.dueDate === today).length;
  dailyCompleteEl.textContent = completedToday;

  if (filtered.length > 0 && filtered.every(t => t.completed)) {
    congratsEl.classList.remove("hidden");
    confetti();
  } else {
    congratsEl.classList.add("hidden");
  }
}

form.onsubmit = e => {
  e.preventDefault();
  const text = input.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value;

  if (!text) return;

  const task = {
    id: Date.now(),
    text,
    completed: false,
    priority,
    dueDate
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  form.reset();
};

filterButtons.forEach(btn => {
  btn.onclick = () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    renderTasks();
  };
});

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

renderTasks();

window.addEventListener("load", () => {
  document.getElementById("loader").classList.add("fade-out");
});

particlesJS("particles-js", {
  particles: {
    number: { value: 60, density: { enable: true, value_area: 800 } },
    color: { value: "#5865f2" },
    shape: { type: "circle" },
    opacity: { value: 0.4 },
    size: { value: 3 },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#5865f2",
      opacity: 0.3,
      width: 1
    },
    move: { enable: true, speed: 1.6 }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: true, mode: "repulse" },
      onclick: { enable: true, mode: "push" }
    },
    modes: {
      repulse: { distance: 100 },
      push: { particles_nb: 4 }
    }
  },
  retina_detect: true
});
