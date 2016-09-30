"use strict";

const inquirer = require('inquirer');

class Inquirer {
  constructor() {
    this.inquirer = inquirer;
  }
  
  setupConfig() {
    return this.inquirer.prompt([{
      name   : 'host',
      message: 'HOST',
      type   : 'input'
    }, {
      name   : 'user',
      message: 'USERNAME',
      type   : 'input'
    }, {
      name   : 'database',
      message: 'DATABASE',
      type   : 'input'
    }]);
  }

  mainMenu() {
    return this.inquirer.prompt([{
      name   : 'action',
      message: '***Welcome to the mighty ToDo List Maker, #1 in Omicron Persei 8!***',
      type   : 'list',
      choices: [{
        name : 'Create a new list',
        value: 'createList'
      }, {
        name : 'View existent list',
        value: 'selectList'
      }]
    }]);
  }

  createList() {
    return this.inquirer.prompt([{
      name   : 'listName',
      message: 'Write your new list name:',
      type   : 'input'
    }]);
  }

  viewLists(list) {
    return this.inquirer.prompt([{
      name   : 'id',
      message: 'Select your list:',
      type   : 'list',
      choices: list
    }]);
  }

  editList() {
    return this.inquirer.prompt([{
      name   : 'option',
      message: 'Choose one option bellow:',
      type   : 'list',
      choices: [{
        name : 'Add todo',
        value: {
          action: 'addTodo',
          type  : 'todo'
        }
      }, {
        name : 'Mark as done',
        value: {
          action: 'updateStatus',
          type  : 'todo'
        }
      }, {
        name : 'Remove todo',
        value: {
          action: 'removeTodo',
          type  : 'todo'
        }
      }, {
        name : 'Delete list',
        value: {
          action: 'deleteList',
          type  : 'list'
        }
      }, {
        name : 'Change list',
        value: {
          action: 'mainMenu',
          type  : 'menu'
        }
      }, {
        name : 'Quit',
        value: false
      }]
    }]);
  }

  addTodo() {
    return this.inquirer.prompt([{
      name   : 'add',
      message: 'Write your new todo:',
      type   : 'input'
    }]);
  }

  removeTodo(todos) {
    return this.inquirer.prompt([{
      name   : 'remove',
      message: 'Choose todo to remove:',
      type   : 'checkbox',
      choices: todos
    }]);
  }

  deleteList(lists) {
    return this.inquirer.prompt([{
      name   : 'list',
      message: 'Choose list to be deleted:',
      type   : 'list',
      choices: lists
    }, {
      name   : 'confirm',
      message: 'Are you sure you want to delete this list? This action cannot be undone.',
      type   : 'confirm'
    }]);
  }

  setTodoStatus(todos) {
    return this.inquirer.prompt([{
      name   : 'done',
      message: 'Mark task as completed. (Selecting same task again will set its status as ',
      type   : 'checkbox',
      choices: todos
    }]);
  }
}

module.exports.Inquirer = Inquirer;
