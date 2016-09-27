"use strict";

const inquirer = require('inquirer');

module.exports = {
  setupConfig() {
    return inquirer.prompt([{
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
  },

  mainMenu() {
    return inquirer.prompt([{
      name   : 'action',
      message: '***Welcome to the mighty ToDo List Maker, #1 in Omicron Persei 8!***',
      type   : 'list',
      choices: ['Create a new list', 'View existent list']
    }]);
  },

  listCreation() {
    return inquirer.prompt([{
      name   : 'listName',
      message: 'Write your new list name:',
      type   : 'input'
    }]);
  },

  viewLists(list) {
    return inquirer.prompt([{
      name   : 'list',
      message: 'Select your list:',
      type   : 'list',
      choices: list
    }]);
  },

  editList() {
    return inquirer.prompt([{
      name   : 'option',
      message: 'Choose one option bellow:',
      type   : 'list',
      choices: ['Add todo', 'Mark as done', 'Remove todo', 'Delete list', 'Change list', 'Quit']
    }]);
  },

  addTodo() {
    return inquirer.prompt([{
      name   : 'add',
      message: 'Write your new todo:',
      type   : 'input'
    }]);
  },

  removeTodo(todos) {
    return inquirer.prompt([{
      name   : 'remove',
      message: 'Choose todo to remove:',
      type   : 'checkbox',
      choices: todos
    }]);
  },

  deleteList(lists) {
    return inquirer.prompt([{
      name   : 'list',
      message: 'Choose list to be deleted:',
      type   : 'list',
      choices: lists
    }, {
      name   : 'confirm',
      message: 'Are you sure you want to delete this list? This action cannot be undone.',
      type   : 'confirm'
    }]);
  },

  setTodoStatus(todos) {
    return inquirer.prompt([{
      name   : 'done',
      message: 'Mark task as completed. (Selecting same task again will set its status as ',
      type   : 'checkbox',
      choices: todos
    }]);
  }
};
