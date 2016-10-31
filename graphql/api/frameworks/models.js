export default class Frameworks {
  constructor({ store }) {
    this.store = store;
  }

  getAllByName() {
    return this.store.Frameworks.getAllByName();
  }
}
