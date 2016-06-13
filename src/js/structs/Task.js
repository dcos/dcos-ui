import Item from './Item';
import ServiceImages from '../constants/ServiceImages';

module.exports = class Task extends Item {
  getId() {
    return this.get('id');
  }

  getName() {
    return this.get('name');
  }

  getImages() {
    return ServiceImages.NA_IMAGES;
  }

};
