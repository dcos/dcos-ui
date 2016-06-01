import deepEqual from 'deep-equal';
import GetSetBaseStore from './GetSetBaseStore';

var AppDispatcher = require('../events/AppDispatcher');
import ActionTypes from '../constants/ActionTypes';
import Config from '../config/Config';
import EventTypes from '../constants/EventTypes';
import MetadataActions from '../events/MetadataActions';

class MetadataStore extends GetSetBaseStore {

  constructor() {
    super(...arguments);

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      var source = payload.source;
      if (source !== ActionTypes.SERVER_ACTION) {
        return false;
      }

      var action = payload.action;

      switch (action.type) {
        case ActionTypes.REQUEST_METADATA:
          var oldMetadata = this.get('metadata');
          var metadata = action.data;

          // only emitting on change
          if (!deepEqual(oldMetadata, metadata)) {
            this.set({metadata});
            this.emitChange(EventTypes.METADATA_CHANGE);
          }
          break;
        case ActionTypes.REQUEST_DCOS_METADATA:
          var oldDCOSMetadata = this.get('dcosMetadata');
          var dcosMetadata = action.data;

          // only emitting on change
          if (!deepEqual(oldDCOSMetadata, dcosMetadata)) {
            this.set({dcosMetadata});
            this.emitChange(EventTypes.DCOS_METADATA_CHANGE);
          }
          break;
      }

      return true;
    });
  }

  init() {
    this.set({
      metadata: {}
    });
    MetadataActions.fetch();
  }

  // TODO: DCOS-7430 - Remove emitChange method
  emitChange(eventName) {
    this.emit(eventName);
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  buildDocsURI(path) {
    let metadata = this.get('dcosMetadata');
    let version = metadata && metadata.version || 'latest';
    let docsVersion = version.replace(/(.*?)\.(.*?)\..*/, '$1.$2');
    return `${Config.documentationURI}/${docsVersion}${path}`;
  }

  get storeID() {
    return 'metadata';
  }

}

module.exports = new MetadataStore();
