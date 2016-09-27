"use strict";

const mysql    = require('mysql');
const inquirer = require('inquirer');
const path     = require('path');
const fs       = require('fs');

let home       = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
let configPath = path.join(home, '.clists');
let data       = {todos: []};
let connection;

setup();

// Set up connection w/ database.

function setup() {
  return new Promise((resolve) => {
    return fs.readFile(`${configPath}.json`, 'utf8', (error, result) => {
      if (error) {
        return saveConfig();
      }

      let config = JSON.parse(result);

      connection = mysql.createConnection(config.database);
      return resolve(connection.connect());
    });
  })
    .then(() => {
      return mainMenu();
    });
}

// Save clists.json.

function saveConfig() {
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
  }])
    .then(answers => {
      let config = {
        database: {
          host    : answers.host,
          user    : answers.user,
          database: answers.database
        }
      };

      connection = mysql.createConnection(config.database);
      connection.connect();

      return fs.writeFile(`${configPath}.json`, JSON.stringify(config), 'utf8', error => {
        if (error) {
          throw error;
        }
      });
    })
    .then(() => {
      connection.query('CREATE TABLE Lists (list_id INT AUTO_INCREMENT PRIMARY KEY, ' +
        'list_name VARCHAR(20) NOT NULL)', error => {
        if (error) {
          throw error;
        }
      });

      connection.query('CREATE TABLE Todos (todo_id INT AUTO_INCREMENT PRIMARY KEY, ' +
        'todo TINYTEXT NOT NULL, done BOOLEAN NOT NULL, list INT, ' +
        'FOREIGN KEY (list) REFERENCES Lists(list_id) ON DELETE CASCADE)', error => {
        if (error) {
          throw error;
        }
      });

      return setup();
    });
}

// Create or select a list.

function mainMenu() {
  return inquirer.prompt([{
    name   : 'action',
    message: '***Welcome to the mighty ToDo List Maker, #1 in Omicron Persei 8!***',
    type   : 'list',
    choices: ['Create a new list', 'View existent list']
  }])
    .then(answer => {

      if (answer.action === 'Create a new list') {
        return createNewList();
      } else {
        return listSelection();
      }
    })
    .then(() => {
      return editList();
    });
}

// Edit options (add, remove, delete).

function editList() {

  return fetchTodos(data.list_id)
    .then(() => {
      listPreview();

      return inquirer.prompt([{
        name   : 'editList',
        message: 'Choose one option bellow:',
        type   : 'list',
        choices: ['Add To Do', 'Mark as done', 'Remove To Do', 'Delete list', 'Quit']
      }]);
    })
    .then(answers => {
      if (answers.editList === 'Mark as done') {
        return changeStatus(data.todos); // @todo: todosArray does not exist anymore

      } else if (answers.editList === 'Add To Do') {
        return addTodo();

      } else if (answers.editList === 'Remove To Do') {
        console.log(data.todos);
        return removeTodo(data.todos); // @todo: todosArray does not exist anymore

      } else if (answers.editList === 'Delete list') {
        return deleteList();

      } else {
        return connection.end();
      }
    });
}

// Create new list.

function createNewList() {
  return inquirer.prompt([{
    name   : 'newListName',
    message: 'Write your new list name:',
    type   : 'input'
  }])
    .then(answer => {
      connection.query(`INSERT INTO Lists (list_name) VALUES (?)`, [answer.newListName], (error, result) => {
        if (error) {
          throw error;
        }

        data.list_id = result.insertId;
      });
    });
}

// Show lists available for selection.

function listSelection() {

  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM Lists', (error, results) => {
      if (error) {
        return reject(error);
      }

      let list = [];

      results.forEach(result => {
        list.push({name: result.list_name, value: result.list_id});
      });

      return resolve(list);
    });
  })
    .then(list => {

      return inquirer.prompt([{
        name   : 'list',
        message: 'Select your list:',
        type   : 'list',
        choices: list
      }])
    })
    .then(answer => {
      data.list_id = answer.list;
    });
}

// Set To Do current status (boolean).

function changeStatus(todos) {
  return inquirer.prompt([{
    name   : 'done',
    message: 'Mark task as completed. (Selecting same task again will set its status as ',
    type   : 'checkbox',
    choices: todos
  }])
    .then(answers => {
      data.todos.forEach(todo => {
        answers.done.forEach(id => {
          if (todo.value === id && todo.done) {
            return connection.query('UPDATE Todos SET done=? WHERE todo_id=?', [0, id], error => {
              if (error) {
                throw error;
              }
            });
          } else if (todo.value === id) {
            return connection.query('UPDATE Todos SET done=? WHERE todo_id=?', [1, id], error => {
              if (error) {
                throw error;
              }
            });
          }
        });
      });
    })
    .then(() => {
      editList();
    });
}

// Insert To Do into the table.

function addTodo() {
  return inquirer.prompt([{
    name   : 'add',
    message: 'Write your new todo:',
    type   : 'input'
  }])
    .then(answer => {
      return connection.query('INSERT INTO Todos (todo, done, list) VALUES (?, ?, ?)',
        [answer.add, 0, data.list_id], error => {
          if (error) {
            throw error;
          }
        });
    })
    .then(() => {
      editList();
    });
}

// Remove To Do from the table.

function removeTodo(todos) {
  return inquirer.prompt([{
    name   : 'remove',
    message: 'Choose todo to remove:',
    type   : 'checkbox',
    choices: todos
  }])
    .then(answers => {
      answers.remove.forEach(todo => {
        console.log(todo);
        return connection.query('DELETE FROM Todos WHERE todo_id=?', [todo], error => {
          if (error) {
            throw error;
          }
        });
      });

      return  editList();
    });
}

// Delete List and associated To Dos from the tables.

function deleteList() {
  return inquirer.prompt([{
    name   : 'confirmation',
    message: 'Are you sure you want to delete this list? This action cannot be undone.',
    type   : 'confirm'
  }])
    .then(answer => {
      if (answer.confirmation) {
        connection.query('DELETE FROM Lists WHERE list_id=?', [data.list_id], error => {
          if (error) {
            throw error;
          }
        });
        connection.query('DELETE FROM Todos WHERE list=?', [data.list_id], error => {
          if (error) {
            throw error;
          }
        });
      }
    })
    .then(() => {
      console.log('List deleted successfully.');

      mainMenu();
    });
}

// Fetch To Dos from selected List.

function fetchTodos(listId) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM Todos WHERE list=?', [listId], (error, results) => {
      if (error) {
        reject(error);
      }

      data.todos = [];

      results.forEach(result => {
        data.todos.push({
          name : result.todo,
          value: result.todo_id,
          done : result.done
        });
      });

      return resolve(data.todos);
    });
  });
}

// Log To Dos and its current status.

function listPreview() {
  console.log(`Here is a preview of your list:\n`);

  data.todos.forEach(item => {

    let checkbox = '[]';

    if (item.done) {
      checkbox = '[x]';
    }

    console.log(`${checkbox} ${item.name}\n`);
  });
}

