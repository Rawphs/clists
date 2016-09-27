"use strict";

const prompt = require('./prompt');
const mysql  = require('mysql');

class Storage {
  constructor(data) {
    this.list         = {};
    this.database     = data.database;
    this.connection   = this.setConnection();
    this.createTables = data.createTables || false;
  }

  setConnection() {
    let connection = mysql.createConnection(this.database);
    connection.connect();

    return connection;
  }

  ensureTables() {
    if (this.createTables) {
      this.connection.query('CREATE TABLE lists (list_id INT AUTO_INCREMENT PRIMARY KEY, ' +
        'list_name VARCHAR(20) NOT NULL)', error => {
        if (error) {
          throw error;
        }
      });

      this.connection.query('CREATE TABLE todos (id INT AUTO_INCREMENT PRIMARY KEY, ' +
        'todo TINYTEXT NOT NULL, done BOOLEAN NOT NULL, list INT, ' +
        'FOREIGN KEY (list) REFERENCES lists(list_id) ON DELETE CASCADE)', error => {
        if (error) {
          throw error;
        }
      });
    }
    return this;
  }

  createList(name) {
    return this.connection.query(`INSERT INTO lists (list_name) VALUES (?)`, [name], (error, result) => {
      if (error) {
        throw error;
      }

      this.list.id = result.insertId;
    });
  }

  fetchLists() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT * FROM lists', (error, results) => {
        if (error) {
          throw error;
        }
        
        return resolve(results);
      });
    });
  }

  deleteList(confirm) {
    if (confirm) {
      this.connection.query('DELETE FROM lists WHERE list_id=?', [this.list.id], error => {
        if (error) {
          throw error;
        }
      });
    }

    return this;
  }

  fetchTodos() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT * FROM todos WHERE list=?', [this.list.id], (error, results) => {
        if (error) {
          throw error;
        }
        
        return resolve(results);
      });
    });
  }

  addTodo(todo) {
    this.connection.query('INSERT INTO todos (todo, done, list) VALUES (?, ?, ?)',
      [todo, 0, this.list.id], error => {
        if (error) {
          throw error;
        }
      });

    return this;
  }

  removeTodos(todos) {
    return new Promise((resolve) => {
      todos.forEach(todo => {
        return this.connection.query('DELETE FROM todos WHERE id=?', [todo], error => {
          if (error) {
            throw error;
          }
        });
      });

      return resolve(this);
    });
  }

  setTodoStatus(todos) {
    return new Promise((resolve, reject) => {
      this.list.todos.forEach(item => {
        todos.forEach(id => {
          if (item.value === id && item.done) {
            return this.connection.query('UPDATE todos SET done=? WHERE id=?', [0, id], error => {
              if (error) {
                throw error;
              }
            });
          } else if (item.value === id) {
            return this.connection.query('UPDATE todos SET done=? WHERE id=?', [1, id], error => {
              if (error) {
                throw error;
              }
            });
          }
        });
      });

      return resolve(this);
    });
  }

  listPreview() {
    console.log(`Here is a preview of your list:\n`);

    this.list.todos.forEach(item => {

      let checkbox = '[]';

      if (item.done) {
        checkbox = '[x]';
      }

      console.log(`${checkbox} ${item.name}\n`);
    });
  }
}

module.exports.Storage = Storage;
