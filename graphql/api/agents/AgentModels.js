export default class Agents {
  constructor({ store }) {
    this.store = store;
  }

  getById(id) {
    return this.store.Agents.getById(id);
  }

  getAll() {
    return this.store.Agents.getAll();
  }
}
