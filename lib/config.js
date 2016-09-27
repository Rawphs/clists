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
        return prompt.setupConfig()
          .then(answers => {
            let config = {
              config: {
                database: {
                  host    : answers.host,
                  user    : answers.user,
                  database: answers.database
                }
              }
            };

            return fs.writeFile(configPath, JSON.stringify(config), 'utf8', error => {
              if (error) {
                throw error;
              }

              config.createTables = true;

              return resolve(new Storage(config));
            });
          });
      }

      let parsedResult = JSON.parse(result);

      return resolve(new Storage(parsedResult));
    });
  });
}

module.exports = setup;
