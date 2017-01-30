import {
  SET,
  ADD_ITEM,
  REMOVE_ITEM
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
import {
  combineReducers,
  simpleFloatReducer,
  simpleReducer
} from '../../../../../../src/js/utils/ReducerUtil';
import {DEFAULT_POD_CONTAINER} from '../../constants/DefaultPod';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import {FormReducer as volumeMountsReducer} from './MultiContainerVolumes';
import {
  JSONSegmentReducer as multiContainerHealthCheckReducer,
  JSONSegmentParser as multiContainerHealthCheckParser,
  FormReducer as multiContainerHealthFormReducer
} from './MultiContainerHealthChecks';
import Networking from '../../../../../../src/js/constants/Networking';
import {isEmpty} from '../../../../../../src/js/utils/ValidatorUtil';

const containerReducer = combineReducers({
  cpus: simpleReducer('resources.cpus'),
  mem: simpleReducer('resources.mem'),
  disk: simpleReducer('resources.disk')
});

const containerFloatReducer = combineReducers({
  cpus: simpleFloatReducer('resources.cpus'),
  mem: simpleFloatReducer('resources.mem'),
  disk: simpleFloatReducer('resources.disk')
});

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
      memo.push(new Transaction(
        ['containers', index, 'image', 'id'],
        item.image.id
      ));
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

    if (item.healthCheck != null) {
      memo = memo.concat(multiContainerHealthCheckParser(
        item.healthCheck, ['containers', index, 'healthCheck']
      ));
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
        if (artifact == null || typeof artifact !== 'object') {
          return;
        }

        memo = memo.concat(Object.keys(artifact).map((key) => {
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

        if (state.networks && state.networks[0] &&
          state.networks[0].mode === Networking.type.CONTAINER.toLowerCase()) {
          memo.push(new Transaction(
            ['containers', index, 'endpoints', endpointIndex, 'containerPort'],
            endpoint.containerPort
          ));
          const vip = findNestedPropertyInObject(
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

        if (state.networks && state.networks[0] &&
          state.networks[0].mode === Networking.type.HOST.toLowerCase()) {
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

    if (this.healthCheckState == null) {
      this.healthCheckState = [];
    }

    if (base === 'id' && type === SET) {
      this.appState.id = value;
    }

    if (base === 'networks' && parseInt(index) === 0 && type === SET) {
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

    if (field === 'healthCheck') {
      if (this.healthCheckState[index] == null) {
        this.healthCheckState[index] = {};
      }

      newState[index].healthCheck = multiContainerHealthCheckReducer.call(
        this.healthCheckState[index],
        newState[index].healthCheck,
        {type, path: path.slice(3), value}
      );
    }

    if (field === 'artifacts') {
      // Create a local cache of artifacts so we can filter the display values
      if (this.artifactState == null) {
        this.artifactState = [];
      }
      if (this.artifactState[index] == null) {
        this.artifactState[index] = [];
      }

      switch (type) {
        case ADD_ITEM:
          this.artifactState[index].push({uri: null});
          break;
        case REMOVE_ITEM:
          this.artifactState[index] =
            this.artifactState[index].filter((item, index) => {
              return index !== value;
            });
          break;
        case SET:
          this.artifactState[index][secondIndex][name] = value;
          break;
      }

      // Filter empty values and assign to state
      this.artifactState.forEach((item, index) => {
        newState[index].artifacts = item.filter(({uri}) => !isEmpty(uri));
      });
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
      // Parse numbers
      newState[index].resources = containerFloatReducer.call(
        this.cache[index],
        newState[index].resources,
        {type, value, path: path.slice(2)}
      );
    }

    if (type === SET && joinedPath === `containers.${index}.image.id`) {
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

      switch (type) {
        case ADD_ITEM:
          newState[index].artifacts.push({uri: null});
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
  },
  JSONParser: containersParser
};
