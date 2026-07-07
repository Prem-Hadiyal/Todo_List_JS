var addBtn = document.getElementById('addBtn');
var inputPanel = document.getElementById('inputPanel');
var taskInput = document.getElementById('taskInput');
var confirmAdd = document.getElementById('confirmAdd');
var taskList = document.getElementById('taskList');
var taskCount = document.getElementById('taskCount');

confirmAdd.addEventListener('click', addTask);
addBtn.addEventListener('click', toggleAddBox);

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    addTask();
  }
});

var tasks = [];
var nextId = 1;

// store our tasks in localStorage
var STORAGE_KEY = 'myTodoTasks';

// local storage function
function saveTasksToStorage() {
  var tasksAsText = JSON.stringify(tasks);
  localStorage.setItem(STORAGE_KEY, tasksAsText);
}


function loadTasksFromStorage() {
  var savedText = localStorage.getItem(STORAGE_KEY);

  if (savedText === null) {
    return;
  }

  var savedTasks = JSON.parse(savedText);
  tasks = savedTasks;

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id >= nextId) {
      nextId = tasks[i].id + 1;
    }
  }
}

var isInputOpen = false;
function toggleAddBox() {

  isInputOpen = !isInputOpen;

  if (isInputOpen) {
    inputPanel.classList.add('open');
    addBtn.classList.add('is-open');
    addBtn.textContent = 'CANCEL';
    taskInput.value = '';
    taskInput.focus();
  } else {
    inputPanel.classList.remove('open');
    addBtn.classList.remove('is-open');
    addBtn.textContent = '+ ADD';
  }
}

function addTask() {

  var taskText = taskInput.value.trim();

  if (taskText === '') {
    return;
  }

  var newTask = {
    id: nextId,
    text: taskText
  };

  nextId = nextId + 1;

  tasks.push(newTask);
  taskInput.value = '';

  saveTasksToStorage();
  showTasks();
}

function deleteTask(taskId) {

  var updatedTasks = [];

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== taskId) {
      updatedTasks.push(tasks[i]);
    }
  }

  tasks = updatedTasks;

  saveTasksToStorage();
  showTasks();
}

function editTask(taskId) {

  var taskRow = document.querySelector('[data-row-id="' + taskId + '"]');
  var textSpan = taskRow.querySelector('.task-text');

  // current text before we remove the span
  var currentText = textSpan.textContent;

  // create a text area to replace the span
  var editBox = document.createElement('textarea');
  editBox.className = 'task-text editing';
  editBox.value = currentText;
  editBox.rows = 2;

  // swap the span out for the text area
  taskRow.replaceChild(editBox, textSpan);

  editBox.focus();
  editBox.setSelectionRange(currentText.length, currentText.length);

  function saveEdit() {
    var newText = editBox.value.trim();

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === taskId) {
        if (newText !== '') {
          tasks[i].text = newText;
        }
      }
    }

    saveTasksToStorage();
    showTasks();
  }

  editBox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    }
    if (event.key === 'Escape') {
      showTasks();
    }
  });

  editBox.addEventListener('blur', saveEdit);
}


function showTasks() {

  taskCount.textContent = tasks.length;

  taskList.innerHTML = '';

  // no tasks then show empty message
  if (tasks.length === 0) {
    var emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-state';
    emptyMessage.innerHTML =
      '<div class="glyph">+</div>' +
      '<p>No tasks yet</p>' +
      '<span>Press + ADD to create your first one</span>';
    taskList.appendChild(emptyMessage);
    return;
  }

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    // outer box for the whole row
    var taskRow = document.createElement('div');
    taskRow.className = 'task-item';
    taskRow.setAttribute('data-row-id', task.id);

    // left side: the task text
    var taskTextEl = document.createElement('span');
    taskTextEl.className = 'task-text';
    taskTextEl.textContent = task.text;

    // right side: container for the two buttons
    var actionsBox = document.createElement('div');
    actionsBox.className = 'task-actions';

    // edit button
    var editBtn = document.createElement('button');
    editBtn.className = 'icon-btn edit-btn';
    editBtn.textContent = '✎';
    editBtn.title = 'Edit task';
    editBtn.setAttribute('data-id', task.id);

    editBtn.addEventListener('click', function () {
      var clickedTaskId = Number(this.getAttribute('data-id'));
      editTask(clickedTaskId);
    });

    // delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete task';
    deleteBtn.setAttribute('data-id', task.id);

    deleteBtn.addEventListener('click', function () {
      var clickedTaskId = Number(this.getAttribute('data-id'));
      deleteTask(clickedTaskId);
    });

    actionsBox.appendChild(editBtn);
    actionsBox.appendChild(deleteBtn);

    taskRow.appendChild(taskTextEl);
    taskRow.appendChild(actionsBox);

    taskList.appendChild(taskRow);
  }
}

loadTasksFromStorage();
showTasks();