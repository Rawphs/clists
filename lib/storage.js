"use strict";

const prompt = require('./prompt');
const mysql  = require('mysql');

class Storage {
  constructor(data) {
    this.list         = {};
    this.database     = data.config.database;
    this.connection   = this.setConnection();
    this.createTables = data.createTables || false;
    this.ensureTables();
  }

  setConnection() {
    let connection = mysql.createConnection(this.database);
    connection.connect();

    return connection;
  }

  ensureTables() {
    if (this.createTables) {
      this.connection.query('CREATE TABLE Lists (list_id INT AUTO_INCREMENT PRIMARY KEY, ' +
        'list_name VARCHAR(20) NOT NULL)', error => {
        if (error) {
          throw error;
        }
      });

      this.connection.query('CREATE TABLE Todos (todo_id INT AUTO_INCREMENT PRIMARY KEY, ' +
        'todo TINYTEXT NOT NULL, done BOOLEAN NOT NULL, list INT, ' +
        'FOREIGN KEY (list) REFERENCES Lists(list_id) ON DELETE CASCADE)', error => {
        if (error) {
          throw error;
        }
      });
    }
    return this;
  }

  createList(name) {
    return this.connection.query(`INSERT INTO Lists (list_name) VALUES (?)`, [name], (error, result) => {
      if (error) {
        throw error;
      }

      this.list.id = result.insertId;
    });
  }

  selectList() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT * FROM Lists', (error, results) => {
        if (error) {
          throw error;
        }

        let lists = [];

        results.forEach(result => {
          lists.push({name: result.list_name, value: result.list_id});
        });

        return resolve(lists);
      });
    });
  }

  deleteList(confirm) {
    if (confirm) {
      this.connection.query('DELETE FROM Lists WHERE list_id=?', [this.list.id], error => {
        if (error) {
          throw error;
        }
      });
    }

    return this;
  }

  fetchTodos() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT * FROM Todos WHERE list=?', [this.list.id], (error, results) => {
        if (error) {
          throw error;
        }

        this.list.todos = [];

        results.forEach(result => {
          this.list.todos.push({
            name : result.todo,
            value: result.todo_id,
            done : result.done
          });
        });

        return resolve(this);
      });
    });
  }

  addTodo(todo) {
    this.connection.query('INSERT INTO Todos (todo, done, list) VALUES (?, ?, ?)',
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
        return this.connection.query('DELETE FROM Todos WHERE todo_id=?', [todo], error => {
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
          if (item.done === 0 && item.value === id) {
            return this.connection.query('UPDATE Todos SET done=? WHERE todo_id=?', [1, id], error => {
              if (error) {
                throw error;
              }
            });
          } else if (item.value === id && item.done === 1) {
            return this.connection.query('UPDATE Todos SET done=? WHERE todo_id=?', [0, id], error => {
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
