"use strict";

class ListService {
  constructor(storage, inquirer) {
    this.storage  = storage;
    this.inquirer = inquirer;
  }

  getLists() {
    return this.storage.fetchLists()
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

  selectList() {
    return this.getLists()
      .then(lists => this.inquirer.viewLists(lists))
      .then(answer => answer.id)
  }

  createList() {
      return this.inquirer.createList()
        .then(answer => this.storage.createList(answer.listName));
  }

  deleteList() {
    return this.getLists()
      .then(lists => this.inquirer.deleteList(lists))
      .then(answer => this.storage.deleteList(answer.list));
  }
}

module.exports.ListService = ListService;
