import {combineReducers} from '../../../../../../../src/js/utils/ReducerUtil';
import {SET} from '../../../../../../../src/js/constants/TransactionTypes';
import ContainerConstants from '../../../constants/ContainerConstants';
import docker from '../Docker';
import ValidatorUtil from '../../../../../../../src/js/utils/ValidatorUtil';

const {NONE} = ContainerConstants.type;

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

    if (!ValidatorUtil.isEmpty(this.internalState) && this.containerType !== NONE) {
      const newState = Object.assign({}, this.internalState);
      Object.keys(this.internalState).forEach((key) => {
        if (ValidatorUtil.isEmpty(this.internalState[key])) {
          delete newState[key];
        }
      });

      return newState;
    }
  }
});

module.exports = {
  FormReducer(_, ...args) {
    if (this.internalState == null) {
      this.internalState = {};
    }

    const newState = Object.assign(
      {}, containerReducer.apply(this, [this.internalState, ...args])
    );

    this.internalState = newState;

    if (ValidatorUtil.isEmpty(newState.docker)) {
      delete newState.docker;
    } else if (ValidatorUtil.isEmpty(newState.type)) {
      delete newState.docker;
    } else if (this.isMesosRuntime && !ValidatorUtil.isEmpty(newState.docker)) {
      delete newState.docker;
    } else if (newState.docker.type === NONE) {
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
  }
};
