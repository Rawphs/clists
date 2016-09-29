"use strict";

const mysql  = require('mysql');

class Storage {
  constructor(data) {
    this.database     = data.database;
    this.connection   = this.setConnection();
    this.createTables = data.createTables || false;
  }

  setConnection() {
    let connection = mysql.createConnection(this.database);
    connection.connect();

    return connection;
  }

  endConnection() {
    return this.connection.end();
  }

  ensureTables() {
    let listsQuery = 'CREATE TABLE lists (list_id INT AUTO_INCREMENT PRIMARY KEY, ' +
      'list_name VARCHAR(20) NOT NULL)';

    let todosQuery = 'CREATE TABLE todos (id INT AUTO_INCREMENT PRIMARY KEY, ' +
      'todo TINYTEXT NOT NULL, done BOOLEAN NOT NULL, list INT, ' +
      'FOREIGN KEY (list) REFERENCES lists(list_id) ON DELETE CASCADE)';

    let queries = [this.query(listsQuery), this.query(todosQuery)];

    return Promise.all(queries);
  }
  
  createList(name) {
    let query = 'INSERT INTO lists (list_name) VALUES (?)';

    return this.query(query, [name], 'insertId');
  }

  fetchLists() {
    let query = 'SELECT * FROM lists';

    return this.query(query);
  }

  deleteList(listId) {
    let query = 'DELETE FROM lists WHERE list_id=?';

    return this.query(query, [listId]);
  }

  fetchTodos(listId) {
    let query = 'SELECT * FROM todos WHERE list=?';

    return this.query(query, [listId]);
  }

  addTodo(todo, listId) {
    let query = 'INSERT INTO todos (todo, done, list) VALUES (?, ?, ?)';

    return this.query(query, [todo, 0, listId]);
  }

  removeTodos(todos) {
    let query = 'DELETE FROM todos WHERE id=?';
    
    return new Promise((resolve) => {
      todos.forEach(todo => {
        return this.query(query, [todo.id]);
      });

      return resolve(this);
    });
  }

  setTodoStatus(todos) {
    let query   = 'UPDATE todos SET done=? WHERE id=?';
    let updates = [];

    todos.forEach(todo => {
      return updates.push(this.query(query, [todo.done ? 0 : 1, todo.id]));
    });

    return Promise.all(updates);
  }

  listPreview(todos) {
    console.log(`Here is a preview of your list:\n`);

    todos.forEach(todo => {

      let checkbox = '[]';

      if (todo.value.done) {
        checkbox = '[x]';
      }

      console.log(`${checkbox} ${todo.name}\n`);
    });
  }

  query(query, data, param) {
    return new Promise((resolve, reject) => {
      this.connection.query(query, data, (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!param) {
          return resolve(result);
        }

        return resolve(result[param]);
      });
    });
  }
}

module.exports.Storage = Storage;
