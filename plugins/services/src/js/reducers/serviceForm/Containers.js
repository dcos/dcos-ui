import {SET, ADD_ITEM, REMOVE_ITEM} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
import {combineReducers, simpleFloatReducer} from '../../../../../../src/js/utils/ReducerUtil';
import {JSONReducer as MultiContainerHealthChecks} from './MultiContainerHealthChecks';

const containerReducer = combineReducers({
  cpus: simpleFloatReducer('resources.cpus'),
  mem: simpleFloatReducer('resources.mem'),
  disk: simpleFloatReducer('resources.disk')
});

const advancedContainerSettings = [
  'gracePeriodSeconds',
  'intervalSeconds',
  'timeoutSeconds',
  'maxConsecutiveFailures'
];

function containersParser(state) {
  if (state == null || state.containers == null) {
    return [];
  }
  return state.containers.reduce((memo, item, index) => {
    memo.push(new Transaction(['containers'], index, ADD_ITEM));
    if (item.name) {
      memo.push(new Transaction(['containers', index, 'name'], item.name));
    }
    if (item.image) {
      memo.push(new Transaction(['containers', index, 'image'], item.image));
    }
    if (item.resources != null) {
      const {resources} = item;
      if (resources.cpus != null) {
        memo.push(new Transaction(['containers', index, 'resources', 'cpus'], resources.cpus));
      }
      if (resources.mem != null) {
        memo.push(new Transaction(['containers', index, 'resources', 'mem'], resources.mem));
      }
      if (resources.disk != null) {
        memo.push(new Transaction(['containers', index, 'resources', 'disk'], resources.disk));
      }
    }

    if (item.privileged != null) {
      memo.push(new Transaction(['containers', index, 'privileged'], item.privileged));
    }

    if (item.healthChecks != null && item.healthChecks.length !== 0) {
      memo = item.healthChecks.reduce(function (memo, item, HealthCheckIndex) {
        if (item.protocol == null) {
          return memo;
        }
        memo.push(new Transaction(['containers', index, 'healthChecks'], HealthCheckIndex, ADD_ITEM));
        memo.push(new Transaction([
          'containers',
          index,
          'healthChecks',
          HealthCheckIndex,
          'protocol'
        ], item.protocol.toUpperCase(), SET));

        if (item.protocol.toUpperCase() === 'COMMAND') {
          if (item.command != null && item.command.command != null) {
            memo.push(new Transaction([
              'containers',
              index,
              'healthChecks',
              HealthCheckIndex,
              'command'
            ], item.command.command, SET));
          }
        }

        advancedContainerSettings.filter((key) => {
          return item[key] != null;
        }).forEach((key) => {
          if (item[key] != null) {
            memo.push(new Transaction([
              'containers',
              index,
              'healthChecks',
              HealthCheckIndex,
              key
            ], item[key], SET));
          }
        });

        return memo;
      }, memo);
    }

    if (item.artifacts != null && item.artifacts.length !== 0) {
      item.artifacts.forEach((artifact, artifactIndex) => {
        memo.push(
          new Transaction(['containers', index, 'artifacts'], artifactIndex, ADD_ITEM)
        );
        memo.push(...Object.keys(artifact).map((key) => {
          return new Transaction(['containers', index, 'artifacts', artifactIndex, key], artifact[key]);
        }));

      });
    }

    if (item.forcePullImage != null) {
      memo.push(new Transaction(['containers', index, 'forcePullImage'], item.forcePullImage));
    }

    if (item.exec != null && item.exec.command != null && item.exec.command.shell != null) {
      memo.push(new Transaction([
        'containers',
        index,
        'exec',
        'command',
        'shell'
      ], item.exec.command.shell));
    }

    return memo;
  }, []);
};

module.exports = {
  JSONReducer(state, {type, path = [], value}) {
    if (!path.includes('containers')) {
      return state;
    }

    if (this.cache == null) {
      this.cache = [];
    }

    if (this.healthChecks == null) {
      this.healthChecks = [];
    }

    if (!state) {
      state = [];
    }

    let newState = state.slice();
    const index = path[1];
    const joinedPath = path.join('.');

    if (joinedPath === 'containers') {
      switch (type) {
        case ADD_ITEM:
          newState.push({name: `container ${newState.length + 1}`});
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

    let field = path[2];
    if (field === 'healthChecks') {
      if (newState[path[1]].healthChecks == null) {
        newState[path[1]].healthChecks = [];
      }

      if (this.healthChecks[path[1]] == null) {
        this.healthChecks[path[1]] = {};
      }

      newState[path[1]].healthChecks = MultiContainerHealthChecks.call(
        this.healthChecks[path[1]],
        newState[path[1]].healthChecks,
        {type, path: path.slice(2), value}
      );
    }

    if (field === 'artifacts') {
      if (newState[path[1]].artifacts == null) {
        newState[path[1]].artifacts = [];
      }

      switch (type) {
        case ADD_ITEM:
          newState[path[1]].artifacts.push({uri: ''});
          break;
        case REMOVE_ITEM:
          newState[path[1]].artifacts = newState[path[1]].artifacts.filter((item, index) => {
            return index !== value;
          });
          break;
        case SET:
          newState[path[1]].artifacts[path[3]][path[4]] = value;
          break;
      }

      return newState;
    }

    if (type === SET && joinedPath === `containers.${index}.name`) {
      newState[index].name = value;
    }

    if (type === SET && joinedPath === `containers.${index}.exec.command.shell`) {
      newState[index].exec = Object.assign({}, newState[index].exec, {command: {shell: value}});
    }

    if (type === SET && path[2] === 'resources') {
      newState[index].resources = containerReducer.call(this.cache[index], newState[index].resources, {
        type,
        value,
        path: path.slice(2)
      });
    }

    if (type === SET && joinedPath === `containers.${index}.image`) {
      newState[index] = Object.assign({}, newState[index], {image: value});
    }

    return newState;
  },
  FormReducer(state, {type, path = [], value}) {
    if (!path.includes('containers')) {
      return state;
    }

    if (this.cache == null) {
      this.cache = [];
    }

    if (this.healthChecks == null) {
      this.healthChecks = [];
    }

    if (!state) {
      state = [];
    }

    let newState = state.slice();
    const index = path[1];
    const joinedPath = path.join('.');

    if (joinedPath === 'containers') {
      switch (type) {
        case ADD_ITEM:
          newState.push({name: `container ${newState.length + 1}`});
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

    let field = path[2];

    if (field === 'healthChecks') {
      if (newState[path[1]].healthChecks == null) {
        newState[path[1]].healthChecks = [];
      }

      if (this.healthChecks[path[1]] == null) {
        this.healthChecks[path[1]] = {};
      }

      newState[path[1]].healthChecks = MultiContainerHealthChecks.call(
        this.healthChecks[path[1]],
        newState[path[1]].healthChecks,
        {type, path: path.slice(2), value}
      );
    }

    if (field === 'artifacts') {
      if (newState[path[1]].artifacts == null) {
        newState[path[1]].artifacts = [];
      }

      switch (type) {
        case ADD_ITEM:
          newState[path[1]].artifacts.push('');
          break;
        case REMOVE_ITEM:
          newState[path[1]].artifacts = newState[path[1]].artifacts.filter((item, index) => {
            return index !== value;
          });
          break;
        case SET:
          if (path[4] === 'uri') {
            newState[path[1]].artifacts[path[3]] = value;
          }
          break;
      }

      return newState;
    }

    if (type === SET && joinedPath === `containers.${index}.name`) {
      newState[index].name = value;
    }

    if (type === SET && joinedPath === `containers.${index}.exec.command.shell`) {
      newState[index].exec = Object.assign({}, newState[index].exec, {command: {shell: value}});
    }

    if (type === SET && path[2] === 'resources') {
      newState[index].resources = containerReducer.call(this.cache[index], newState[index].resources, {
        type,
        value,
        path: path.slice(2)
      });
    }

    if (type === SET && joinedPath === `containers.${index}.image`) {
      newState[index] = Object.assign({}, newState[index], {image: value});
    }

    return newState;
  },
  JSONParser: containersParser
};
