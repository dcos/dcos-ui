import Item from './Item';

module.exports = class Job extends Item {
  constructor(options = {}) {
    super(...arguments);

    const id = this.getId();
    if (id !== '/' && !id.startsWith('/') || id.endsWith('/')) {
      throw new Error(`Id (${id}) must start with a leading slash ("/") and should not end with a slash, except for root id wich is only a slash`);
    }
  }

  getId() {
    return this.get('id') || '/';
  }

  getName() {
    return this.getId().split('/').pop();
  }

};
