"use strict";

const prompt = require('./prompt');

class ListService {

  static getLists(storage) {
    return storage.fetchLists()
      .then(result => {
        let lists = [];

        result.forEach(result => {
          lists.push({
            name : result.list_name,
            value: result.list_id
          });
        });

        return lists;
      });
  }

  static createList(storage) {
    return prompt.listCreation()
      .then(answer => storage.createList(answer.listName));
  }

  static deleteList(storage) {
    return ListService.getLists(storage)
      .then(lists  => prompt.deleteList(lists))
      .then(answer => storage.deleteList(answer.list));
  }
}

module.exports.ListService = ListService;
