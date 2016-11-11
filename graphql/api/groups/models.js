export default class Groups {
  constructor({ store }) {
    this.store = store;
  }

  getById(id) {
    return this.store.Groups.getById(id);
  }

  getContents(id) {
    const groupsPromise = this.store.Groups.getAll();
    const isChildGroup = new RegExp(`^${id}.{1}`);

    return groupsPromise.then((groups) => {
      return groups.filter((content) => content.id.match(isChildGroup));
    });
  }
}
