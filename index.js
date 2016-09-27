"use strict";

const prompt = require('./lib/prompt');
const setup  = require('./lib/config');

let data;

function clists() {
  return setup()
    .then(storage => {
      data = storage;

      return main();
    });
}

function main() {
  return prompt.mainMenu()
    .then(answer => {

      if (answer.action === 'Create a new list') {
        return prompt.listCreation()
          .then(answer => data.createList(answer.listName))
          .then(() => options());
      } else {
        return data.selectList()
          .then(lists => prompt.viewLists(lists))
          .then(answer => data.list.id = answer.list)
          .then(() => options());
      }
    });
}

function options() {
  return data.fetchTodos()
    .then(data => {
      data.listPreview();

      return prompt.editList();
    })
    .then(answer => {
      if (answer.option === 'Add todo') {
        return prompt.add()
          .then(answer => data.addTodo(answer.add))
          .then(() => options());

      } else if (answer.option === 'Remove todo') {
        return prompt.remove(data.list.todos)
          .then(answer => data.removeTodos(answer.remove))
          .then(() => options());

      } else if (answer.option === 'Delete list') {
        return data.selectList()
          .then(lists => prompt.deleteList(lists))
          .then(answer => data.deleteList(answer.confirm))
          .then(() => options());

      } else if (answer.option === 'Mark as done') {
        return prompt.setTodoStatus(data.list.todos)
          .then(todos => data.setTodoStatus(todos.done))
          .then(() => options());

      } else if (answer.option === 'Change list') {
        return main();

      } else {
        data.connection.end();
      }
    });
}

clists();
