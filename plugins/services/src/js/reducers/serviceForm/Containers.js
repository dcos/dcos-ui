import {
  SET,
  ADD_ITEM,
  REMOVE_ITEM
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
import {
  combineReducers,
  simpleFloatReducer
} from '../../../../../../src/js/utils/ReducerUtil';
import {JSONReducer as MultiContainerHealthChecks} from './MultiContainerHealthChecks';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import Networking from '../../../../../../src/js/constants/Networking';
import {FormReducer as volumeMountsReducer} from './MultiContainerVolumes';
import {DEFAULT_POD_CONTAINER} from '../../constants/DefaultPod';

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
  protocol: 'tcp',
  servicePort: null,
  vip: null
};

function mapEndpoints(endpoints = [], networkType, appState) {

  return endpoints.map((endpoint, index) => {
    let {
      name,
      hostPort,
      containerPort,
      automaticPort,
      protocol,
      vip,
      labels,
      loadBalanced
    } = endpoint;

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
      name,
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
    if (item.image && item.image.id) {
      memo.push(new Transaction(['containers', index, 'image'], item.image.id));
    }
    if (item.resources != null) {
      const {resources} = item;
      if (resources.cpus != null) {
        memo.push(new Transaction([
          'containers',
          index,
          'resources',
          'cpus'
        ], resources.cpus));
      }
      if (resources.mem != null) {
        memo.push(new Transaction([
          'containers',
          index,
          'resources',
          'mem'
        ], resources.mem));
      }
      if (resources.disk != null) {
        memo.push(new Transaction([
          'containers',
          index,
          'resources',
          'disk'
        ], resources.disk));
      }
    }

    if (item.privileged != null) {
      memo.push(new Transaction([
        'containers',
        index,
        'privileged'
      ], item.privileged));
    }

    if (item.healthChecks != null && item.healthChecks.length !== 0) {
      memo = item.healthChecks.reduce(function (memo, item, HealthCheckIndex) {
        if (item.protocol == null) {

          return memo;
        }
        memo.push(new Transaction([
          'containers',
          index,
          'healthChecks'
        ], HealthCheckIndex, ADD_ITEM));
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
          new Transaction([
            'containers',
            index,
            'artifacts'
          ], artifactIndex, ADD_ITEM)
        );
        memo.push(...Object.keys(artifact).map((key) => {

          return new Transaction([
            'containers',
            index,
            'artifacts',
            artifactIndex,
            key
          ], artifact[key]);
        }));

      });
    }

    if (item.endpoints != null && item.endpoints.length !== 0) {
      item.endpoints.forEach((endpoint, endpointIndex) => {
        memo = memo.concat([
          new Transaction(
            ['containers', index, 'endpoints'],
            endpointIndex,
            ADD_ITEM
          ),
          new Transaction(
            ['containers', index, 'endpoints', endpointIndex, 'hostPort'],
            endpoint.hostPort
          ),
          new Transaction(
            ['containers', index, 'endpoints', endpointIndex, 'automaticPort'],
            endpoint.hostPort === 0
          ),
          new Transaction(
            ['containers', index, 'endpoints', endpointIndex, 'servicePort'],
            endpoint.servicePort === 0
          ),
          new Transaction(
            ['containers', index, 'endpoints', endpointIndex, 'name'],
            endpoint.name
          )
        ]);

        if (state.networks[0].mode === Networking.type.CONTAINER.toLowerCase()) {
          memo.push(new Transaction(
            ['containers', index, 'endpoints', endpointIndex, 'containerPort'],
            endpoint.containerPort
          ));
          let vip = findNestedPropertyInObject(
            endpoint,
            `labels.VIP_${endpointIndex}`
          );
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
          memo.push(new Transaction(
            ['containers', index, 'endpoints', endpointIndex, 'protocol'],
            endpoint.protocol.join()
          ));
        }

        if (state.networks[0].mode === Networking.type.HOST.toLowerCase()) {
          memo.push(new Transaction(
            ['containers', index, 'endpoints', endpointIndex, 'protocol'],
            endpoint.protocol.join()
          ));
        }
      });
    }

    if (item.forcePullImage != null) {
      memo.push(new Transaction([
        'containers',
        index,
        'forcePullImage'
      ], item.forcePullImage));
    }

    if (item.exec != null && item.exec.command != null &&
      item.exec.command.shell != null) {
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
    const [base, index, field, secondIndex, name] = path;

    if (this.networkType == null) {
      this.networkType = Networking.type.HOST;
    }

    if (this.appState == null) {
      this.appState = {};
    }

    if (base === 'id' && type === SET) {
      this.appState.id = value;
    }

    if (base === 'network' && type === SET) {
      const valueSplit = value.split('.');

      this.networkType = valueSplit[0];
    }

    if (!path.includes('containers') && !path.includes('volumeMounts')) {

      return state.map((container, index) => {
        container.endpoints = mapEndpoints(
          this.endpoints[index].endpoints,
          this.networkType,
          this.appState
        );

        return container;
      });
    }

    if (this.cache == null) {
      // This is needed to provide a context for nested reducers.
      // Containers is an array so we will have multiple items and so that
      // the reducers are not overwriting each others context we are
      // providing one object per item in the array.
      this.cache = [];
    }

    if (this.healthChecks == null) {
      this.healthChecks = [];
    }

    if (this.endpoints == null) {
      this.endpoints = [];
    }

    if (this.volumeMounts == null) {
      this.volumeMounts = [];
    }
    let newState = state.slice();
    const joinedPath = path.join('.');

    if (joinedPath === 'containers') {
      switch (type) {
        case ADD_ITEM:
          const name = `container-${newState.length + 1}`;

          newState.push(Object.assign({}, DEFAULT_POD_CONTAINER, {name}));
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

    this.volumeMounts = volumeMountsReducer(
      this.volumeMounts,
      {type, path, value}
    );

    newState = state.map((container, index) => {
      if (this.volumeMounts.length !== 0) {
        container.volumeMounts = this.volumeMounts.filter((volumeMount) => {

          return volumeMount.name != null && volumeMount.mountPath[index];
        }).map((volumeMount) => {

          return {
            name: volumeMount.name,
            mountPath: volumeMount.mountPath[index]
          };
        });
      }

      return container;
    });

    if (field === 'endpoints') {
      if (this.endpoints[index].endpoints == null) {
        this.endpoints[index].endpoints = [];
      }

      switch (type) {
        case ADD_ITEM:
          this.endpoints[index].endpoints.push(Object.assign(
            {},
            defaultEndpointsFieldValues
          ));
          break;
        case REMOVE_ITEM:
          this.endpoints[index].endpoints =
            this.endpoints[index].endpoints.filter((item, index) => {

              return index !== value;
            });
          break;
      }

      const fieldNames = [
        'name',
        'protocol',
        'automaticPort',
        'loadBalanced',
        'vip'
      ];
      const numericalFiledNames = ['containerPort', 'hostPort'];

      if (type === SET && fieldNames.includes(name)) {
        this.endpoints[index].endpoints[secondIndex][name] = value;
      }
      if (type === SET && numericalFiledNames.includes(name)) {
        this.endpoints[index].endpoints[secondIndex][name] = parseInt(
          value,
          10
        );
      }
    }
    newState = newState.map((container, index) => {
      container.endpoints = mapEndpoints(
        this.endpoints[index].endpoints,
        this.networkType,
        this.appState
      );

      return container;
    });

    if (field === 'healthChecks') {
      if (newState[index].healthChecks == null) {
        newState[index].healthChecks = [];
      }

      if (this.healthChecks[index] == null) {
        this.healthChecks[index] = {};
      }

      newState[index].healthChecks = MultiContainerHealthChecks.call(
        this.healthChecks[index],
        newState[index].healthChecks,
        {type, path: path.slice(2), value}
      );
    }

    if (field === 'artifacts') {
      if (newState[index].artifacts == null) {
        newState[index].artifacts = [];
      }

      switch (type) {
        case ADD_ITEM:
          newState[index].artifacts.push({uri: ''});
          break;
        case REMOVE_ITEM:
          newState[index].artifacts =
            newState[index].artifacts.filter((item, index) => {

              return index !== value;
            });
          break;
        case SET:
          newState[index].artifacts[secondIndex][name] = value;
          break;
      }

      return newState;
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
      newState[index].resources = containerReducer.call(
        this.cache[index],
        newState[index].resources,
        {type, value, path: path.slice(2)}
      );
    }

    if (type === SET && joinedPath === `containers.${index}.image`) {
      newState[index] =
        Object.assign({},
          newState[index],
          {image: {id: value, kind: 'DOCKER'}});
    }

    return newState;
  },

  FormReducer(state, {type, path = [], value}) {
    // eslint-disable-next-line no-unused-vars
    const [_, index, field, secondIndex, name] = path;

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

      switch (type) {
        case ADD_ITEM:
          newState[index].endpoints.push(Object.assign(
            {},
            defaultEndpointsFieldValues
          ));
          break;
        case REMOVE_ITEM:
          newState[index].endpoints =
            newState[index].endpoints.filter((item, index) => {

              return index !== value;
            });
          break;
      }

      const fieldNames = [
        'name',
        'protocol',
        'automaticPort',
        'loadBalanced',
        'vip'
      ];
      const numericalFiledNames = ['containerPort', 'hostPort'];

      if (type === SET && fieldNames.includes(name)) {
        newState[index].endpoints[secondIndex][name] = value;
      }
      if (type === SET && numericalFiledNames.includes(name)) {
        newState[index].endpoints[secondIndex][name] = parseInt(value, 10);
      }
    }

    if (field === 'healthChecks') {
      if (newState[index].healthChecks == null) {
        newState[index].healthChecks = [];
      }

      if (this.healthChecks[index] == null) {
        this.healthChecks[index] = {};
      }

      newState[index].healthChecks = MultiContainerHealthChecks.call(
        this.healthChecks[index],
        newState[index].healthChecks,
        {type, path: path.slice(2), value}
      );
    }

    if (field === 'artifacts') {
      if (newState[index].artifacts == null) {
        newState[index].artifacts = [];
      }

      switch (type) {
        case ADD_ITEM:
          newState[index].artifacts.push('');
          break;
        case REMOVE_ITEM:
          newState[index].artifacts =
            newState[index].artifacts.filter((item, index) => {

              return index !== value;
            });
          break;
        case SET:
          if (name === 'uri') {
            newState[index].artifacts[secondIndex] = value;
          }
          break;
      }

      return newState;
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
      newState[index].resources = containerReducer.call(
        this.cache[index],
        newState[index].resources,
        {type, value, path: path.slice(2)}
      );
    }

    if (type === SET && joinedPath === `containers.${index}.image`) {
      newState[index] = Object.assign({}, newState[index], {image: value});
    }

    return newState;
  },
  JSONParser: containersParser
};
