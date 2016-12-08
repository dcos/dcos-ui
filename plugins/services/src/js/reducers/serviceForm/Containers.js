import {SET, ADD_ITEM, REMOVE_ITEM} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
import {combineReducers, simpleFloatReducer} from '../../../../../../src/js/utils/ReducerUtil';
import {JSONReducer as MultiContainerHealthChecks} from './MultiContainerHealthChecks';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import Networking from '../../../../../../src/js/constants/Networking';

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

const defaultEndpointsFieldValues = {
  automaticPort: true,
  containerPort: null,
  hostPort: null,
  labels: null,
  loadBalanced: false,
  name: null,
  portMapping: false,
  protocol: 'tcp',
  servicePort: null,
  vip: null
};

function mapEndpoints(endpoints = [], networkType, appState) {
  return endpoints.map((endpoint, index) => {
    let {name, hostPort, containerPort, automaticPort, protocol, vip, labels, loadBalanced} = endpoint;
    if (automaticPort) {
      hostPort = 0;
    }
    if (networkType === Networking.type.CONTAINER) {
      if (loadBalanced) {
        if (vip == null) {
          vip = `${appState.id}:${containerPort}`;
        }

        labels = Object.assign({}, labels, {
          [`VIP_${index}`]: vip
        });
      }

      return {
        name,
        containerPort,
        hostPort,
        protocol: [protocol],
        labels
      };
    }
    return {
      hostPort,
      protocol: [protocol]
    };
  });
}

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

    if (item.endpoints != null && item.endpoints.length !== 0) {
      item.endpoints.forEach((endpoint, endpointIndex) => {
        memo.push(
            new Transaction(['containers', index, 'endpoints'], endpointIndex, ADD_ITEM)
        );

        if (state.network.mode === Networking.type.CONTAINER.toLowerCase()) {
          memo.push(new Transaction(['containers', index, 'endpoints', endpointIndex, 'containerPort'], endpoint.containerPort));
          memo.push(new Transaction(['containers', index, 'endpoints', endpointIndex, 'hostPort'], endpoint.hostPort));
          memo.push(new Transaction(['containers', index, 'endpoints', endpointIndex, 'name'], endpoint.name));
          let vip = findNestedPropertyInObject(endpoint, `labels.VIP_${endpointIndex}`);
          if (vip != null) {
            memo.push(new Transaction([
              'containers', index, 'endpoints', endpointIndex,
              'loadBalanced'
            ], true));

            if (!vip.startsWith(state.id)) {
              memo.push(new Transaction([
                'containers', index, 'endpoints', endpointIndex,
                'vip'
              ], vip));
            }
          }

          if (item.labels != null) {
            memo.push(new Transaction([
              'containers', index, 'endpoints', endpointIndex,
              'labels'
            ], item.labels));
          }
          memo.push(new Transaction(['containers', index, 'endpoints', endpointIndex, 'protocol'], endpoint.protocol.join()));
        }

        if (state.network.mode === Networking.type.HOST.toLowerCase()) {
          memo.push(new Transaction(['containers', index, 'endpoints', endpointIndex, 'hostPort'], endpoint.hostPort));
          memo.push(new Transaction(['containers', index, 'endpoints', endpointIndex, 'protocol'], endpoint.protocol.join()));
        }
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
  JSONReducer(state = [], {type, path = [], value}) {
    if (this.networkType == null) {
      this.networkType = Networking.type.HOST;
    }

    if (this.appState == null) {
      this.appState = {};
    }

    if (path[0] === 'id' && type === SET) {
      this.appState.id = value;
    }

    if (path[0] === 'network' && type === SET) {
      const valueSplit = value.split('.');

      this.networkType = valueSplit[0];
    }

    if (!path.includes('containers')) {
      return state.map((container, index) => {
        container.endpoints = mapEndpoints(this.endpoints[index].endpoints, this.networkType, this.appState);
        return container;
      });
    }

    if (this.cache == null) {
      this.cache = [];
    }

    if (this.healthChecks == null) {
      this.healthChecks = [];
    }

    if (this.endpoints == null) {
      this.endpoints = [];
    }

    let newState = state.slice();

    const index = path[1];
    const joinedPath = path.join('.');

    if (joinedPath === 'containers') {
      switch (type) {
        case ADD_ITEM:
          newState.push({name: `container ${newState.length + 1}`});
          this.cache.push({});
          this.endpoints.push({});
          break;
        case REMOVE_ITEM:
          newState = newState.filter((item, index) => {
            return index !== value;
          });
          this.cache = this.cache.filter((item, index) => {
            return index !== value;
          });
          this.endpoints = this.endpoints.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      return newState;
    }

    if (path[2] === 'endpoints') {
      if (this.endpoints[path[1]].endpoints == null) {
        this.endpoints[path[1]].endpoints = [];
      }

      switch (type) {
        case ADD_ITEM:
          this.endpoints[path[1]].endpoints.push(Object.assign({}, defaultEndpointsFieldValues));
          break;
        case REMOVE_ITEM:
          this.endpoints[path[1]].endpoints = this.endpoints[path[1]].endpoints.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      if (type === SET) {
        if (path[4] === 'name') {
          this.endpoints[path[1]].endpoints[path[3]].name = value;
        }

        if (path[4] === 'hostPort') {
          this.endpoints[path[1]].endpoints[path[3]].hostPort = value;
        }

        if (path[4] === 'containerPort') {
          this.endpoints[path[1]].endpoints[path[3]].containerPort = value;
        }

        if (path[4] === 'protocol') {
          this.endpoints[path[1]].endpoints[path[3]].protocol = value;
        }

        if (path[4] === 'automaticPort') {
          this.endpoints[path[1]].endpoints[path[3]].automaticPort = value;
        }

        if (path[4] === 'portMapping') {
          this.endpoints[path[1]].endpoints[path[3]].portMapping = value;
        }

        if (path[4] === 'loadBalanced') {
          this.endpoints[path[1]].endpoints[path[3]].loadBalanced = value;
        }

        if (path[4] === 'vip') {
          this.endpoints[path[1]].endpoints[path[3]].vip = value;
        }
      }
    }
    newState = newState.map((container, index) => {
      container.endpoints = mapEndpoints(this.endpoints[index].endpoints, this.networkType, this.appState);
      return container;
    });

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

    if (path[2] === 'endpoints') {
      if (newState[path[1]].endpoints == null) {
        newState[path[1]].endpoints = [];
      }

      switch (type) {
        case ADD_ITEM:
          newState[path[1]].endpoints.push(Object.assign({}, defaultEndpointsFieldValues));
          break;
        case REMOVE_ITEM:
          newState[path[1]].endpoints = newState[path[1]].endpoints.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      if (type === SET) {
        if (path[4] === 'name') {
          newState[path[1]].endpoints[path[3]].name = value;
        }

        if (path[4] === 'hostPort') {
          newState[path[1]].endpoints[path[3]].hostPort = value;
        }

        if (path[4] === 'containerPort') {
          newState[path[1]].endpoints[path[3]].containerPort = value;
        }

        if (path[4] === 'protocol') {
          newState[path[1]].endpoints[path[3]].protocol = value;
        }

        if (path[4] === 'automaticPort') {
          newState[path[1]].endpoints[path[3]].automaticPort = value;
        }

        if (path[4] === 'portMapping') {
          newState[path[1]].endpoints[path[3]].portMapping = value;
        }

        if (path[4] === 'loadBalanced') {
          newState[path[1]].endpoints[path[3]].loadBalanced = value;
        }
      }
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
