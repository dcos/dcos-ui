import {JSONReducer as container} from './serviceForm/Container';
import {JSONReducer as env} from './serviceForm/EnvironmentVariables';
import {JSONReducer as labels} from './serviceForm/Labels';
import {
  simpleFloatReducer,
  simpleIntReducer,
  simpleReducer
} from '../../../../../src/js/utils/ReducerUtil';

module.exports = {
  id: simpleReducer('id'),
  instances: simpleIntReducer('instances'),
  container,
  cpus: simpleFloatReducer('cpus'),
  mem: simpleIntReducer('mem'),
  disk: simpleIntReducer('disk'),
  cmd: simpleReducer('cmd'),
  env,
  labels
};
