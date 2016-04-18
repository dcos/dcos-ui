import {StoreMixin} from 'mesosphere-shared-reactjs';
import StoreConfig from '../constants/StoreConfig';

StoreMixin.store_configure(StoreConfig);

function add(storeID, config) {
  StoreConfig[storeID] = config;
  StoreMixin.store_configure(StoreConfig);
}

module.exports = {
  add
};

