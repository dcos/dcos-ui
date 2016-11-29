import {simpleReducer, simpleIntReducer} from '../../../../../../src/js/utils/ReducerUtil';

module.exports = {
  id: simpleReducer('id'),
  instances: simpleReducer('instances'),
  // Container runtime is handled in ./serviceForm/Container
  cpus: simpleReducer('cpus'),
  mem: simpleReducer('mem'),
  disk: simpleReducer('disk'),
  gpus: simpleIntReducer('gpus'),
  cmd: simpleReducer('cmd')
};
