import {JSONReducer as constraints} from './serviceForm/Constraints';
import {JSONReducer as fetch} from './serviceForm/Artifacts';
import {JSONReducer as env} from './serviceForm/EnvironmentVariables';
import {JSONReducer as healthChecks} from './serviceForm/HealthChecks';
import {JSONReducer as labels} from './serviceForm/Labels';
import {JSONReducer as volumes} from './serviceForm/Volumes';
import {
  combineReducers,
  simpleFloatReducer,
  simpleIntReducer,
  simpleReducer
} from '../../../../../src/js/utils/ReducerUtil';
import VolumeConstants from '../constants/VolumeConstants';

const {DOCKER} = VolumeConstants.type;

module.exports = {
  id: simpleReducer('id'),
  instances: simpleIntReducer('instances'),
  container: combineReducers({
    type: simpleReducer('container.type', DOCKER),
    docker: combineReducers({
      priviliged: simpleReducer('container.docker.privileged', false),
      forecePullImage: simpleReducer('container.docker.forcePullImage', false),
      image: simpleReducer('container.docker.image', '')
    }),
    volumes
  }),
  cpus: simpleFloatReducer('cpus'),
  mem: simpleIntReducer('mem'),
  disk: simpleIntReducer('disk'),
  gpus: simpleIntReducer('gpus'),
  cmd: simpleReducer('cmd'),
  env,
  labels,
  healthChecks,
  constraints,
  fetch
};
