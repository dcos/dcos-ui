import {SET, ADD_ITEM, REMOVE_ITEM} from '../../../../../../src/js/constants/TransactionTypes';
import {combineReducers} from '../../../../../../src/js/utils/ReducerUtil';
import ContainerConstants from '../../constants/ContainerConstants';
import {JSONReducer as volumes} from './Volumes';
import ValidatorUtil from '../../../../../../src/js/utils/ValidatorUtil';

import docker from './Docker';

const {MESOS, NONE} = ContainerConstants.type;

const containerJSONReducer = combineReducers({
  type(state, {type, path, value}) {
    if (path == null) {
      return state;
    }

    if (this.hasImage == null) {
      this.hasImage = false;
    }

    if (this.noState == null) {
      this.noState = true;
    }

    if (this.hasVolumes == null) {
      this.hasVolumes = [];
    }

    const joinedPath = path.join('.');

    if (joinedPath === 'container.docker.image') {
      this.hasImage = !ValidatorUtil.isEmpty(value);
    }

    if (path[0] === 'localVolumes' && !this.hasImage) {
      switch (type) {
        case ADD_ITEM:
          this.hasVolumes.push(true);
          break;
        case REMOVE_ITEM:
          this.hasVolumes = this.hasVolumes.filter((item, index) => {
            return index !== value;
          });
      }
    }

    if (type === SET && joinedPath === 'container.type' && value !== NONE) {
      this.noState = false;
      return value;
    }

    if (value === NONE) {
      this.noState = true;
    }

    let volumesState = null;

    if (this.hasVolumes.length !== 0) {
      volumesState = MESOS;
    }

    if (this.noState) {
      return volumesState;
    }

    return state;
  },
  docker() {
    if (this.internalState == null) {
      this.internalState = {};
    }

    arguments[0] = this.internalState;

    this.internalState = docker.apply(this, arguments);
    if (!ValidatorUtil.isEmpty(this.internalState.image)) {
      let newState = Object.assign({}, this.internalState);
      Object.keys(this.internalState).forEach((key) => {
        if (ValidatorUtil.isEmpty(this.internalState[key])) {
          delete newState[key];
        }
      });
      return newState;
    }
  },
  volumes
});

const containerReducer = combineReducers({
  type(state, {type, path, value}) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join('.');

    if (type === SET && joinedPath === 'container.type') {
      return value;
    }

    return state;
  },
  docker() {
    if (this.internalState == null) {
      this.internalState = {};
    }

    arguments[0] = this.internalState;

    this.internalState = docker.apply(this, arguments);
    if (!ValidatorUtil.isEmpty(this.internalState.image)) {
      let newState = Object.assign({}, this.internalState);
      Object.keys(this.internalState).forEach((key) => {
        if (ValidatorUtil.isEmpty(this.internalState[key])) {
          delete newState[key];
        }
      });
      return newState;
    }
  },
  volumes
});

function container() {
  if (this.localVolumes === null) {
    this.localVolumes = [];
  }

  if (this.internalState == null) {
    this.internalState = {};
  }

  arguments[0] = this.internalState;
  let newState = Object.assign({}, containerReducer.apply(this, arguments));
  this.internalState = newState;

  if (ValidatorUtil.isEmpty(newState)) {
    return null;
  }

  if (ValidatorUtil.isEmpty(newState.docker)) {
    delete newState.docker;
  } else if (ValidatorUtil.isEmpty(newState.docker.image)) {
    delete newState.docker;
  }

  if (ValidatorUtil.isEmpty(newState.volumes)) {
    delete newState.volumes;
  }

  if (ValidatorUtil.isEmpty(newState.type)) {
    delete newState.type;
  }

  if (ValidatorUtil.isEmpty(newState)) {
    return null;
  }

  return newState;
};

module.exports = {
  JSONReducer() {
    if (this.internalState == null) {
      this.internalState = {};
    }

    arguments[0] = this.internalState;
    let newState = Object.assign({}, containerJSONReducer.apply(this, arguments));
    this.internalState = newState;

    if (ValidatorUtil.isEmpty(newState)) {
      return null;
    }

    if (ValidatorUtil.isEmpty(newState.docker)) {
      delete newState.docker;
    } else if (ValidatorUtil.isEmpty(newState.docker.image)) {
      delete newState.docker;
    }

    if (ValidatorUtil.isEmpty(newState.volumes)) {
      delete newState.volumes;
    }

    if (ValidatorUtil.isEmpty(newState.type)) {
      delete newState.type;
    }

    if (ValidatorUtil.isEmpty(newState)) {
      return null;
    }

    return newState;
  },
  FormReducer: container
};
