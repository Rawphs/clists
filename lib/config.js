"use strict";

const fs      = require('fs');
const path    = require('path');

let home       = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
let configPath = path.join(home, '.clists');

class Config {
  constructor(inquirer) {
    this.config  = {};
    this.inquirer = inquirer;
  }

  setup() {
    return new Promise(resolve => {
      fs.readFile(configPath, 'utf8', (error, result) => {
        if (error) {
          return this.setConfig();
        }

        this.config = JSON.parse(result);

        return resolve(this.config);
      });
    });
  }

  setConfig() {
    return this.inquirer.setupConfig()
      .then(answers => {
        this.config = {
          database    : {
            host    : answers.host,
            user    : answers.user,
            database: answers.database
          },
          createTables: true
        };
        return this.saveConfig();
      })

  }

  saveConfig() {
    return fs.writeFile(configPath, JSON.stringify(this.config), 'utf8', error => {
      if (error) {
        throw error;
      }
    })
      .then(() => this.config);
  }
}

module.exports.Config = Config;
