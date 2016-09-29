"use strict";

const fs      = require('fs');
const Storage = require('./storage').Storage;
const prompt  = require('./prompt');
const path    = require('path');

let home       = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
let configPath = path.join(home, '.clists');

function setup() {
  return new Promise(resolve => {
    fs.readFile(configPath, 'utf8', (error, result) => {
      if (error) {
        return setConfig();
      }

      let parsedResult = JSON.parse(result);
      
      return resolve(new Storage(parsedResult));
    });
  });
}

function setConfig() {
  return prompt.setupConfig()
    .then(answers => {
      let config = {
        database: {
          host    : answers.host,
          user    : answers.user,
          database: answers.database
        }
      };

      return saveConfig(config);
    });
}

function saveConfig(config) {
  return fs.writeFile(configPath, JSON.stringify(config), 'utf8', error => {
    if (error) {
      throw error;
    }
  })
    .then(() => {
      let storage = new Storage(config);

      return storage.ensureTables();
    });
}

module.exports.setup = setup;
