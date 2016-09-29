"use strict";

const prompt = require('./prompt');

class TodoService {

  static addTodo(storage, data) {
    return prompt.addTodo()
      .then(answer => storage.addTodo(answer.add, data.id));
  }

  static removeTodo(storage, data) {
    return prompt.removeTodo(data.todos)
      .then(answer => storage.removeTodos(answer.remove));
  }

  static updateStatus(storage, data) {
    return prompt.setTodoStatus(data.todos)
      .then(update => storage.setTodoStatus(update.done));
  }


  static fetchTodos(storage, data) {
    return storage.fetchTodos(data.id)
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

        return storage.listPreview(data.todos);
      });
  }
}

module.exports.TodoService = TodoService;
