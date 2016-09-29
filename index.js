"use strict";

const prompt      = require('./lib/prompt');
const config      = require('./lib/config');
const ListService = require('./lib/listService').ListService;
const TodoService = require('./lib/todoService').TodoService;

let storage;
let data = {};

function clists() {
  return config.setup()
    .then(config => {
      storage = config;

      return mainMenu();
    });
}

function mainMenu() {
  return prompt.mainMenu()
    .then(answer => {
      if (!answer.action) {
        return ListService.createList(storage);
      }

      return ListService.getLists(storage)
        .then(lists  => prompt.viewLists(lists))
        .then(answer => answer.list);
    })
    .then(id => {
      data.id = id;

      return editOptions();
    });
}

function editOptions() {
  return TodoService.fetchTodos(storage, data)
    .then(() => {
      return prompt.editList();
    })
    .then(answer => {
      let option = answer.option;

      if (!option.type) {
        return storage.endConnection();
      }

      if (option.type.includes('menu')) {
        return mainMenu();
      }

      if (option.type.includes('list')) {
        return ListService[option.action](storage)
          .then(() => editOptions());
      }
      
      return TodoService[option.action](storage, data)
        .then(() => editOptions());
    });
}

clists();
