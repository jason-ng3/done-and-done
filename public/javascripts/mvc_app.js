class Model {
  constructor() {
    this.allTodos = [];
  }

  sortByCompleted(todos) {
    return Array.from(todos).sort((a, b) => {
      return (a.completed < b.completed) ? -1 : (a.completed > b.completed) ? 1 : 0;
    })
  }

  todoGroupsByDate(todos) { 
    let result = {};

    todos.forEach(todo => {
      if (todo.year === '0000' || todo.month === '00') {
        if (result['No Due Date']) {
          result['No Due Date'].push(todo);
        } else {
          result['No Due Date'] = [todo];
        } 
      } else {
        let date = todo.month + '/' + todo.year;
        if (result[date]) {
          result[date].push(todo);
        } else {
          result[date] = [todo];
        }
      }
    });

    return result;
  }

  completedTodos(todos) {
    return todos.filter(todo => todo.completed);
  }

  completedTodoGroupsByDate(todos) {
    return this.todoGroupsByDate(this.completedTodos(todos));
  }

  sortByDate(todoGroups) {
    return todoGroups.sort((a, b) => {
      if (a[0] === 'No Due Date') {
        return -1;
      } else if (b[0] === 'No Due Date') {
        return 1;
      } else {
        a = a[0].split('/');
        b = b[0].split('/');
        let date1 = Number(a[1] + a[0]);
        let date2 = Number(b[1] + b[0]);
        return date1 - date2;
      }
    });
  }

  navList(todos) {
    let todoGroupsByDate = this.todoGroupsByDate(todos);
    let sortedNavList = this.sortByDate(Object.entries(todoGroupsByDate)).map(entry => {
      let obj = {};
      obj.date = entry[0];
      obj.todos = entry[1];
      return obj;
    });

    return sortedNavList;
  }

  navCompletedList(todos) {
    let completedTodoGroupsByDate = this.completedTodoGroupsByDate(todos);
    let sortedNavCompletedList = this.sortByDate(Object.entries(completedTodoGroupsByDate)).map(entry => {
      let obj = {};
      obj.date = entry[0];
      obj.todos = entry[1];
      return obj;
    });

    return sortedNavCompletedList;
  }

  async getAllTodos() {
    try {
      let response = await fetch('/api/todos');
      this.allTodos = await response.json();
      return this.allTodos;
    } catch(error) {
      alert(`${error.name}: ${error.message}`);
    }
  }

  async createTodo(todo) {
    try {
      let response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(todo), 
      })
  
      if (!response.ok) {
        response.text().then(text => alert(text));
      }
    } catch(error) {
      alert(`${error.name}: ${error.message}`);
    }

  }

  async updateTodo(todo, todoId) {
    try {
      let response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(todo),
      });

      if (!response.ok) {
        response.text().then(text => alert(text));
      }
    } catch(error) {
      alert(`${error.name}: ${error.message}`);
    }
  }

  async deleteTodo(todoId) {
    try {
      let response = await fetch(`http://localhost:3000/api/todos/${todoId}`, { method: 'DELETE' });
    
      if (!response.ok) {
        response.text().then(text => alert(text));
      }
    } catch(error) {
      alert(`${error.name}: ${error.message}`);
    }
  }

  async toggleTodo(todoId, newTodoState) {
    try {
      let response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ completed: newTodoState }),
      });
  
      if (!response.ok) {
        response.text().then(text => alert(text));
      }
    } catch(error) {
      alert(`${error.name}: ${error.message}`);
    }
  }

  async markTodoAsComplete(todoId) {
    try {
      let response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ completed: 'true' }),
      });
  
      if (!response.ok) {
        response.text().then(text => alert(text));
      }
    } catch(error) {
      alert(`${error.name}: ${error.message}`);
    }
  }
}

Handlebars.registerHelper('isCompleted', (completed) => completed ? 'completed' : '');
Handlebars.registerHelper('formatYear', (year) => year.slice(2));
Handlebars.registerHelper('hasValue', (value) => value !== '00' && value !== '0000');

Handlebars.registerHelper('formatDate', (date) => {
  return date !== 'No Due Date' ? (date.slice(0, -4) + date.slice(-2)) : date;
});

class View {
  constructor() {
    this.todoHeadingTemplate = Handlebars.compile(document.querySelector('#todo-heading').innerHTML);
    this.todoListTemplate = Handlebars.compile(document.querySelector('#todo-list').innerHTML);
    this.navListTemplate = Handlebars.compile(document.querySelector('#nav-list').innerHTML);
    this.navCompletedHeadingTemplate = Handlebars.compile(document.querySelector('#nav-completed-heading').innerHTML);
    this.navCompletedListTemplate = Handlebars.compile(document.querySelector('#nav-completed-list').innerHTML);

    this.todoList = document.querySelector('.todo-list');
    this.todoListHeading = document.querySelector('.todo-list-heading');
    this.navListHeading = document.querySelector('.list-heading');
    this.navList = document.querySelector('.nav-list');
    this.navCompletedHeading = document.querySelector('.completed-heading');
    this.navCompletedList = document.querySelector('.nav-completed-list')
    this.modal = document.querySelector('.modal');
    this.overlay = document.querySelector('.overlay');

    this.addNewTodo = document.querySelector('.add-new-todo');
    this.todoForm = document.querySelector('.todo-form');
    this.completeButton = document.querySelector('button[name="complete"]');
  }

  showModal() {
    this.modal.classList.remove('hide');
    this.overlay.classList.remove('hide');
  }

  hideModal() {
    this.modal.classList.add('hide');
    this.overlay.classList.add('hide');
  }

  highlightTodoGroup(todoGroup) {
    let highlighted = document.querySelector('.highlight');

    if (highlighted) {
      highlighted.classList.remove('highlight');
    }

    todoGroup.classList.add('highlight');
  }

  clearTodoList() {
    this.todoList.innerHTML = '';
    this.todoListHeading.innerHTML = '';
  }

  clearNavigation() {
    this.navListHeading.innerHTML = '';
    this.navList.innerHTML = '';
    this.navCompletedHeading.innerHTML = '';
    this.navCompletedList .innerHTML = '';
  }

  formDataToJson(formData) {
    return Object.fromEntries([...formData.entries()]);
  }

  navDate() {
    return this.todoList.dataset.date;
  }

  navAllOrCompleted() {
    return this.todoList.dataset.allOrCompleted;
  }

  modifyHeading(newHeading) {
    document.querySelector('.todo-list-heading h1').textContent = newHeading;
  }

  highlightTodoGroup(todoGroup) {
    let highlighted = document.querySelector('.highlight');

    if (highlighted) {
      highlighted.classList.remove('highlight');
    }

    todoGroup.classList.add('highlight');
  }

  renderTodoListTemplate(todos) {
    this.clearTodoList();

    let todoHeadingHTML = this.todoHeadingTemplate({ todos: todos });
    let todoListHTML = this.todoListTemplate({ todos: todos });

    this.todoListHeading.insertAdjacentHTML('afterbegin', todoHeadingHTML);
    this.todoList.insertAdjacentHTML('beforeend', todoListHTML);
  }

  renderNavHeading(todos) {
    let navListHeadingHTML = this.todoHeadingTemplate({ todos: todos });
    this.navListHeading.insertAdjacentHTML('afterbegin', navListHeadingHTML);
  }
  
  renderNavList(todos) { // pass in sorted nav list
    let navListHTML = this.navListTemplate({ todosByDate: todos });
    this.navList.insertAdjacentHTML('afterbegin', navListHTML);
  }

  renderNavCompletedHeading(todos) { // pass in completed todos
    let navCompletedHeadingHTML = this.navCompletedHeadingTemplate({ todos: todos });
    this.navCompletedHeading.insertAdjacentHTML('afterbegin', navCompletedHeadingHTML);
  }

  renderNavCompletedList(todos) { // pass in sorted nav list that is completed
    let navCompletedListHTML = this.navCompletedListTemplate({ completedTodosByDate: todos });
    this.navCompletedList.insertAdjacentHTML('afterbegin', navCompletedListHTML);
  }

  bindAddNewTodo(handler) {
    this.addNewTodo.addEventListener('click', (event) => {
      event.preventDefault();
      this.showModal();
    });
  }

  bindCloseModal(handler) {
    document.addEventListener('click', (event) => {
      if (!event.target.closest(".modal")) {
        this.hideModal();
        this.todoForm.reset();
      }
    }, true);
  }

  bindCreateTodo(handler) {
    this.todoForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let form = event.target;
      let todoId = form.dataset.id;
  
      if (!todoId) {
        let title = document.querySelector('input#title');
  
        if (form.checkValidity()) {
          let formData = new FormData(form);
          let jsonObj = this.formDataToJson(formData);
          handler(jsonObj, todoId);
          form.reset();
          this.hideModal();
          this.highlightTodoGroup(this.navListHeading);
        } else {
          if (title.validity.tooShort || title.validity.valueMissing) {
            alert('You must enter a title at least 3 characters long.');
          }
        }
      }
    });
  }

  bindEditTodo(handler) {
    this.todoList.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.target.tagName === 'LABEL') {
        let label = event.target;
        let todoId = label.htmlFor.match(/\d+$/)[0];
        let todo = handler(todoId);
        
        this.todoForm.dataset.id = todoId;
        this.todoForm.dataset.completed = todo.completed;

        document.querySelector('#due-day').value = todo.day;
        document.querySelector('#due-month').value = todo.month;
        document.querySelector('#due-year').value = todo.year;
        document.querySelector('#title').value = todo.title;
        document.querySelector('#description').value = todo.description;
        this.showModal();
      }
    });
  }

  bindUpdateTodo(handler) {
    this.todoForm.addEventListener('submit', (event) => {
      let form = event.target;
      let todoId = form.dataset.id;
      let formData = new FormData(form);
      let jsonObj = this.formDataToJson(formData);

      if (todoId) {
        handler(jsonObj, todoId);
        form.reset();
        this.hideModal();
        form.dataset.id = '';
        form.dataset.completed = '';
      }
    });
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.target.className === 'delete-btn') {
        let id = event.target.dataset.id;
        handler(id);
      }
    });
  }

  bindMouseOver() {
    this.todoList.addEventListener('mouseover', (event) => {
      let todo = event.target.closest('.todo');
      let deleteBtn = event.target.closest('.delete');
    
      if (todo) {
        todo.style.backgroundColor = 'lightblue';
      } else if (deleteBtn) {
        deleteBtn.style.backgroundColor = 'red';
      }
    });
  }

  bindMouseOut() {
    this.todoList.addEventListener('mouseout', (event) => {
      let todo = event.target.closest('.todo');
      let deleteBtn = event.target.closest('.delete');
  
      if (todo) {
        todo.style.backgroundColor = 'white';
      } else if (deleteBtn) {
        deleteBtn.style.backgroundColor = 'white';
      }
    });
  }

  bindHighlightTodoName() {
    this.todoList.addEventListener('mouseover', (event) => {
      let label = event.target.closest('label');
      if (label) {
        label.style.color = 'darkcyan';
      }
    });
  }

  bindunHighlightTodoName() {
    this.todoList.addEventListener('mouseout', (event) => {
      let label = event.target.closest('label');
      if (label) {
        label.style.color = '';
      }
    });
  }

  bindNavList(handler) {
    this.navList.addEventListener('click', (event) => {
      if (event.target.closest('.nav-list')) {
        let currentTodoGroup = event.target.closest('.todo-group');
        this.highlightTodoGroup(currentTodoGroup);
  
        let todosByDate = handler();
        let todoGroupDate = currentTodoGroup.dataset.date;
        let currentTodos = todosByDate[todoGroupDate]
        this.renderTodoListTemplate(currentTodos);
        this.modifyHeading(todoGroupDate);
  
        this.todoList.dataset.date = todoGroupDate;
        this.todoList.dataset.allOrCompleted = 'all';
      }
    });
  }

  bindNavCompletedList(handler) {
    this.navCompletedList.addEventListener('click', (event) => {
      if (event.target.closest('.nav-completed-list')) {
        let currentTodoGroup = event.target.closest('.completed-todo-group');
        this.highlightTodoGroup(currentTodoGroup)
  
        let completedTodosByDate = handler();
        let todoGroupDate = currentTodoGroup.dataset.date;
        this.renderTodoListTemplate(completedTodosByDate[todoGroupDate]);
        this.modifyHeading(todoGroupDate);
  
        this.todoList.dataset.date = todoGroupDate;
        this.todoList.dataset.allOrCompleted = 'completed';
      }
    });
  }

  bindNavAllTodosHeading(handler) {
    this.navListHeading.addEventListener('click', (event) => {
      let currentTodoGroup = event.target.closest('.list-heading');
      this.highlightTodoGroup(currentTodoGroup);
  
      this.renderTodoListTemplate(handler());
      this.modifyHeading('All Todos');
  
      this.todoList.dataset.date = '';
      this.todoList.dataset.allOrCompleted = 'all';
    });
  }

  bindNavCompletedHeading(handler) {
    this.navCompletedHeading.addEventListener('click', (event) => {
      let currentTodoGroup = event.target.closest('.completed-heading');
      this.highlightTodoGroup(currentTodoGroup);
  
      this.renderTodoListTemplate(handler());
      this.modifyHeading('Completed');
  
      this.todoList.dataset.date = '';
      this.todoList.dataset.allOrCompleted = 'completed';
    });
  }

  bindToggleTodoState(handler) {
    this.todoList.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.target.className === 'todo' || event.target.type === 'checkbox') {
        let todo = event.target;
        let todoId = todo.dataset.id;
        let newTodoState = todo.dataset.completed === 'true' ? 'false' : 'true';
        handler(todoId, newTodoState);
      }
    });
  }

  bindMarkAsCompleted(handler) {
    this.completeButton.addEventListener('click', (event) => {
      event.preventDefault();
      let form = event.target.closest('form')
      let todoId = form.dataset.id;
      let todoState = form.dataset.completed;
  
      if (todoState === 'false') {
        handler(todoId);
        this.hideModal();
        form.dataset.id = '';
        form.dataset.completed = '';
        form.reset();
      } else if (todoState === 'true') {
        this.hideModal();
        form.dataset.id = '';
        form.dataset.completed = '';
        form.reset();
      } else {
        alert('Cannot mark as complete as item has not been created yet!');
      }
    });
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.displayAllTodos();
    this.bindEvents();
  }

  displayNavigation(todos) {
    this.view.clearNavigation();
    this.view.renderNavHeading(todos);
    this.view.renderNavList(this.model.navList(todos)); // might need to switch to sorted todos? pass in sorted nav list
    this.view.renderNavCompletedHeading(this.model.completedTodos(todos));
    this.view.renderNavCompletedList(this.model.navCompletedList(todos));
  }

  async displayAllTodos() {
    let todos = await this.model.getAllTodos();
    this.view.renderTodoListTemplate(this.model.sortByCompleted(todos));
    this.displayNavigation(todos);
  }

  async displayCompletedTodos() {
    let todos = await this.model.getAllTodos();
    this.view.renderTodoListTemplate(this.model.completed());
    this.view.modifyHeading('Completed');
    this.displayNavigation(todos);
  }

  async displayAllTodosByDate(date) {
    let todos = await this.model.getAllTodos();
    let allTodosByDate = this.model.sortByCompleted(todos).filter(todo => {
      if (date === 'No Due Date') {
        return (todo.month === '00' || todo.year === '0000');
      } else {
        return (`${todo.month}/${todo.year}` === date);
      }
    });
    this.view.renderTodoListTemplate(allTodosByDate);
    this.view.modifyHeading(date);
    this.displayNavigation(todos);
  }

  async displayCompletedTodosByDate(date) {
    let todos = await this.model.getAllTodos();
    let completedTodosByDate = todos.filter(todo => {
      if (date === 'No Due Date') {
        return (todo.month === '00' || todo.year === '0000') && todo.completed;
      } else {
        return (`${todo.month}/${todo.year}` === date) && todo.completed;
      }
    });
    
    this.view.renderTodoListTemplate(completedTodosByDate);
    this.view.modifyHeading(date);
    this.displayNavigation(todos);
  }

  displayCurrentTodos(date, allOrCompleted) {
    if (!date && allOrCompleted === 'all') {
      this.displayAllTodos();
    } else if (!date && allOrCompleted === 'completed') {
      this.displayCompletedTodos();
    } else if (date && allOrCompleted === 'all') {
      this.displayAllTodosByDate(date);
    } else if (date && allOrCompleted === 'completed') {
      this.displayCompletedTodosByDate(date);
    }
  }

  bindEvents() {
    this.view.bindCreateTodo(this.handleCreateTodo.bind(this));
    this.view.bindAddNewTodo();
    this.view.bindCloseModal();
    this.view.bindEditTodo(this.handleEditTodo.bind(this));
    this.view.bindUpdateTodo(this.handleUpdateTodo.bind(this));
    this.view.bindDeleteTodo(this.handleDeleteTodo.bind(this));
    this.view.bindMouseOut();
    this.view.bindMouseOver();
    this.view.bindHighlightTodoName();
    this.view.bindunHighlightTodoName();
    this.view.bindNavList(this.handleClickNavList.bind(this));
    this.view.bindNavCompletedList(this.handleClickNavCompletedList.bind(this));
    this.view.bindNavAllTodosHeading(this.handleClickNavAllTodosHeading.bind(this));
    this.view.bindNavCompletedHeading(this.handleClickNavCompletedHeading.bind(this));
    this.view.bindToggleTodoState(this.handleToggleTodoState.bind(this));
    this.view.bindMarkAsCompleted(this.handleMarkAsCompleted.bind(this));
  }

  async handleCreateTodo(todo) {
    await this.model.createTodo(todo);
    this.displayAllTodos();
  }

  handleEditTodo(todoId) {
    return this.model.allTodos.filter(todo => todo.id === Number(todoId))[0];
  }

  async handleUpdateTodo(todo, todoId) {
    await this.model.updateTodo(todo, todoId);
    this.displayCurrentTodos(this.view.navDate(), this.view.navAllOrCompleted());
  }

  async handleDeleteTodo(todoId) {
    if (confirm('Delete this contact?')) {
      await this.model.deleteTodo(todoId);
      this.displayCurrentTodos(this.view.navDate(), this.view.navAllOrCompleted());
    }
  }

  async handleToggleTodoState(todoId, newTodoState) {
    await this.model.toggleTodo(todoId, newTodoState);
    this.displayCurrentTodos(this.view.navDate(), this.view.navAllOrCompleted());
  }

  async handleMarkAsCompleted(todoId) {
    await this.model.markTodoAsComplete(todoId);
    this.displayCurrentTodos(this.view.navDate(), this.view.navAllOrCompleted());
  }

  handleClickNavList() {
    return this.model.todoGroupsByDate(this.model.sortByCompleted(this.model.allTodos));
  }

  handleClickNavCompletedList() {
    return this.model.completedTodoGroupsByDate(this.model.allTodos);
  }

  handleClickNavAllTodosHeading() {
    return this.model.sortByCompleted(this.model.allTodos);
  }

  handleClickNavCompletedHeading() {
    return this.model.completedTodos(this.model.allTodos);
  }
}

const TodoApp = new Controller(new Model(), new View());