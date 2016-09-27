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
          .then(() => editOptions());
      } else {
        return getLists()
          .then(lists => prompt.viewLists(lists))
          .then(answer => data.list.id = answer.list)
          .then(() => editOptions());
      }
    });
}

function editOptions() {
  return data.fetchTodos()
    .then(results => {
      data.list.todos = [];

      results.forEach(result => {
        data.list.todos.push({
          name : result.todo,
          value: result.id,
          done : result.done
        });
      });

      data.listPreview();

      return prompt.editList();
    })
    .then(answer => {
      if (answer.option === 'Add todo') {
        return prompt.addTodo()
          .then(answer => data.addTodo(answer.add))
          .then(() => editOptions());

      } else if (answer.option === 'Remove todo') {
        return prompt.removeTodo(data.list.todos)
          .then(answer => data.removeTodos(answer.remove))
          .then(() => editOptions());

      } else if (answer.option === 'Delete list') {
        return getLists()
          .then(lists => prompt.deleteList(lists))
          .then(answer => data.deleteList(answer.confirm))
          .then(() => editOptions());

      } else if (answer.option === 'Mark as done') {
        return prompt.setTodoStatus(data.list.todos)
          .then(todos => data.setTodoStatus(todos.done))
          .then(() => editOptions());

      } else if (answer.option === 'Change list') {
        return main();

      } else {
        return data.connection.end();
      }
    });
}

function getLists() {
  return new Promise(resolve => {
    return data.fetchLists()
      .then(result => {
        let lists = [];

        result.forEach(result => {
          lists.push({name: result.list_name, value: result.list_id});
        });

        return resolve(lists);
      });
  });
}

clists();
