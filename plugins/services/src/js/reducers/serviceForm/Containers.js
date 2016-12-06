import {SET, ADD_ITEM, REMOVE_ITEM} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
import {combineReducers, simpleFloatReducer} from '../../../../../../src/js/utils/ReducerUtil';

const containerReducer = combineReducers({
  cpus: simpleFloatReducer('resources.cpus'),
  mem: simpleFloatReducer('resources.mem'),
  disk: simpleFloatReducer('resources.disk')
});

function containers(state, {type, path = [], value}) {
  if (!path.includes('containers')) {
    return state;
  }

  if (this.cache == null) {
    this.cache = [];
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

  if (path[2] === 'artifacts') {
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
        newState[path[1]].artifacts[path[3]] = value;
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
};

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

    if (item.artifacts != null && item.artifacts.length !== 0) {
      item.artifacts.forEach((artifact, artifactIndex) => {
        memo.push(
            new Transaction(['containers', index, 'artifacts'], artifactIndex, ADD_ITEM)
        );
        memo.push(
            new Transaction(['containers', index, 'artifacts', artifactIndex], artifact)
        );
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
  JSONReducer: containers,
  FormReducer: containers,
  JSONParser: containersParser
};
