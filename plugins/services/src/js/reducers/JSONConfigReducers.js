import {
  simpleFloatReducer,
  simpleIntReducer,
  simpleReducer
} from '../../../../../src/js/utils/ReducerUtil';
import {
  JSONReducer as env
} from './form/EnvironmentVariables';
import {
  JSONReducer as labels
} from './form/Labels';

module.exports = {
  id: simpleReducer('id', '/'),
  cpus: simpleFloatReducer('cpus', 0.01),
  mem: simpleIntReducer('mem', 128),
  disk: simpleIntReducer('disk', 0),
  instances: simpleIntReducer('instances', 1),
  cmd: simpleReducer('cmd', ''),
  env,
  labels
};
