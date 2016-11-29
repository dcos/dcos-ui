import {JSONReducer as env} from './serviceForm/EnvironmentVariables';
import {JSONReducer as labels} from './serviceForm/Labels';
import {JSONReducer as volumes} from './serviceForm/Volumes';
import {JSONReducer as healthChecks} from './serviceForm/HealthChecks';
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
  cmd: simpleReducer('cmd'),
  env,
  labels,
  healthChecks
};
