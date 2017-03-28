import {combineReducers} from '../../../../../../../src/js/utils/ReducerUtil';
import {findNestedPropertyInObject} from '../../../../../../../src/js/utils/Util';
import {
  JSONReducer as volumesJSONReducer
} from '../JSONReducers/Volumes';
import {SET, ADD_ITEM, REMOVE_ITEM} from '../../../../../../../src/js/constants/TransactionTypes';
import {simpleParser, combineParsers} from '../../../../../../../src/js/utils/ParserUtil';
import ContainerConstants from '../../../constants/ContainerConstants';
import docker from '../Docker';
import Transaction from '../../../../../../../src/js/structs/Transaction';
import ValidatorUtil from '../../../../../../../src/js/utils/ValidatorUtil';

const {DOCKER, MESOS, NONE} = ContainerConstants.type;

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
    if (type === SET && joinedPath === 'container.docker.image') {
      this.hasImage = !ValidatorUtil.isEmpty(value);
    }

    if (path[0] === 'localVolumes' || path[0] === 'externalVolumes') {
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
  docker(_, {type, path, value}, index) {
    if (this.internalState == null) {
      this.internalState = {};
    }

    // Passing down the index as well, for reducers to use context
    this.internalState = docker(this.internalState, {type, path, value}, index);

    const joinedPath = path && path.join('.');
    if (type === SET && joinedPath === 'container.type') {
      this.containerType = value;
    }

    if (!ValidatorUtil.isEmpty(this.internalState) &&
      this.containerType !== NONE) {
      return Object.assign({}, this.internalState);
    }
  },
  volumes: volumesJSONReducer
});

module.exports = {
  JSONReducer(_, ...args) {
    if (this.internalState == null) {
      this.internalState = {};
    }

    if (this.isMesosRuntime == null) {
      this.isMesosRuntime = true;
    }

    const {type, path, value} = args[0];

    if (type === SET && path.join('.') === 'container.type') {
      this.isMesosRuntime = value === NONE;
    }

    const newState = Object.assign(
      {}, containerJSONReducer.apply(this, [this.internalState, ...args])
    );

    this.internalState = newState;

    if (ValidatorUtil.isEmpty(newState.docker)) {
      delete newState.docker;
    }

    if (ValidatorUtil.isEmpty(newState.type)) {
      newState.type = null;
    }

    if (ValidatorUtil.isEmpty(newState)) {
      return null;
    }

    return newState;
  },

  JSONParser: combineParsers([
    function (state) {
      const image = findNestedPropertyInObject(state, 'container.docker.image');
      let value = findNestedPropertyInObject(state, 'container.type');

      if (value === MESOS && !image) {
        value = NONE;
      }

      if (value == null) {
        value = NONE;
      }

      return new Transaction(['container', 'type'], value);
    },
    simpleParser(['container', DOCKER.toLowerCase(), 'image']),
    simpleParser(['container', DOCKER.toLowerCase(), 'forcePullImage']),
    simpleParser(['container', DOCKER.toLowerCase(), 'privileged'])
  ])
};
