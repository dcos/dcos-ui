import {simpleReducer} from '../../../../../../src/js/utils/ReducerUtil';

module.exports = {
  id: simpleReducer('id', '/'),
  instances: simpleReducer('instances', 1),
  // Container runtime is handled in ./serviceForm/Container
  cpus: simpleReducer('cpus', 0.01),
  mem: simpleReducer('mem', 128),
  disk: simpleReducer('disk', 0),
  cmd: simpleReducer('cmd')
};
