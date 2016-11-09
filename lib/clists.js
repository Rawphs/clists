"use strict";

const Inquirer    = require('./inquirer').Inquirer;
const Storage     = require('./storage').Storage;
const TodoService = require('./todoService').TodoService;
const ListService = require('./listService').ListService;
const Config      = require('./config').Config;

class Clists {
  constructor() {
    this.data        = {};
    this.inquirer    = new Inquirer();
    this.config      = new Config(this.inquirer);
    this.storage     = undefined;
    this.listService = undefined;
    this.todoService = undefined;
  }

  run() {
    return this.config.setup()
      .then(config => {
        this.storage     = new Storage(config);
        this.todoService = new TodoService(this.storage, this.inquirer);
        this.listService = new ListService(this.storage, this.inquirer);
        
        return this.main();
      });
  }

  main() {
    return this.inquirer.mainMenu()
      .then(answer => this.listService[answer.action]())
      .then(id => {
        this.data.id = id;

        return this.edit();
      });
  }

  edit() {
    return this.todoService.fetchTodos(this.data)
      .then(() => this.inquirer.editList())
      .then(answer => {
        let option = answer.option;

        if (!option.type) {
          return this.storage.endConnection();
        }

        if (option.type.includes('menu')) {
          return this.mainMenu();
        }

        if (option.type.includes('list')) {
          return this.listService[option.action]()
            .then(() => this.edit());
        }

        return this.todoService[option.action](this.data)
          .then(() => this.edit());
      });
  }
}

module.exports.Clists = Clists;
