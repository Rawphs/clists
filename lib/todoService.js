"use strict";

class TodoService {
  constructor(storage, inquirer) {
    this.storage  = storage;
    this.inquirer = inquirer;
  }

  addTodo(data) {
    return this.inquirer.addTodo()
      .then(answer => this.storage.addTodo(answer.add, data.id));
  }

  removeTodo(data) {
    return this.inquirer.removeTodo(data.todos)
      .then(answer => this.storage.removeTodos(answer.remove));
  }

  updateStatus(data) {
    return this.inquirer.setTodoStatus(data.todos)
      .then(update => this.storage.setTodoStatus(update.done));
  }

  fetchTodos(data) {
    return this.storage.fetchTodos(data.id)
      .then(results => {
        data.todos = [];

        results.forEach(result => {
          data.todos.push({
            name : result.todo,
            value: {
              id  : result.id,
              done: result.done
            }
          });
        });

        return this.storage.listPreview(data.todos);
      });
  }
}

module.exports.TodoService = TodoService;
