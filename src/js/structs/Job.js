import Item from './Item';

module.exports = class Job extends Item {
  constructor(options = {}) {
    super(...arguments);

    const id = this.getId();
    if (!id.startsWidth('/') || id.endsWidth('/')) {
      throw new Error(
        'Id must start with a leading slash ("/") and should not end with a slash.'
      );
    }
  }

  getId() {
    return this.get('id') || '';
  }

  getName() {
    return this.getId().split('/').pop();
  }

};
