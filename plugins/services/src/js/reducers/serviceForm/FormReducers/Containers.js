import {
  SET,
  ADD_ITEM,
  REMOVE_ITEM
} from '../../../../../../../src/js/constants/TransactionTypes';
import {
  combineReducers,
  simpleReducer
} from '../../../../../../../src/js/utils/ReducerUtil';
import {DEFAULT_POD_CONTAINER} from '../../../constants/DefaultPod';
import {FormReducer as endpointsFormReducer} from './Endpoints';
import {FormReducer as multiContainerArtifacts} from './MultiContainerArtifacts';
import {
  FormReducer as multiContainerHealthFormReducer
} from '../MultiContainerHealthChecks';

const containerReducer = combineReducers({
  cpus: simpleReducer('resources.cpus'),
  mem: simpleReducer('resources.mem'),
  disk: simpleReducer('resources.disk')
});

module.exports = {
  FormReducer(state, {type, path = [], value}) {
    // eslint-disable-next-line no-unused-vars
    const [_, index, field, secondIndex, name, subField] = path;

    if (!path.includes('containers')) {
      return state;
    }

    if (this.cache == null) {
      this.cache = [];
    }

    if (this.healthCheckState == null) {
      this.healthCheckState = [];
    }

    if (!state) {
      state = [];
    }

    let newState = state.slice();
    const joinedPath = path.join('.');

    if (joinedPath === 'containers') {
      switch (type) {
        case ADD_ITEM:
          const name = `container-${newState.length + 1}`;

          newState.push(Object.assign({}, DEFAULT_POD_CONTAINER, {name}));
          this.cache.push({});
          break;
        case REMOVE_ITEM:
          newState = newState.filter((item, index) => {
            return index !== value;
          });
          this.cache = this.cache.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      return newState;
    }

    if (field === 'endpoints') {
      if (newState[index].endpoints == null) {
        newState[index].endpoints = [];
      }

      newState[index].endpoints =
        endpointsFormReducer(newState[index].endpoints, {type, path, value});
    }

    if (field === 'healthCheck') {
      if (this.healthCheckState[index] == null) {
        this.healthCheckState[index] = {};
      }

      newState[index].healthCheck = multiContainerHealthFormReducer.call(
        this.healthCheckState[index],
        newState[index].healthCheck,
        {type, path: path.slice(3), value}
      );
    }

    if (field === 'artifacts') {
      if (newState[index].artifacts == null) {
        newState[index].artifacts = [];
      }

      newState[index].artifacts =
        multiContainerArtifacts(newState[index].artifacts, {type, path, value});
    }

    if (type === SET && joinedPath === `containers.${index}.name`) {
      newState[index].name = value;
    }

    if (type === SET &&
      joinedPath === `containers.${index}.exec.command.shell`) {
      newState[index].exec = Object.assign(
        {},
        newState[index].exec,
        {command: {shell: value}}
      );
    }

    if (type === SET && field === 'resources') {
      // Do not parse numbers, as user might be in the middle of
      // entering a number. 0.0 would then equal 0, yielding it impossible to
      // enter, e.g. 0.001
      newState[index].resources = containerReducer.call(
        this.cache[index],
        newState[index].resources,
        {type, value, path: path.slice(2)}
      );
    }

    if (type === SET && joinedPath === `containers.${index}.image.id`) {
      newState[index] = Object.assign(
        {},
        newState[index],
        {image: {id: value}}
      );
    }

    return newState;
  }
};
