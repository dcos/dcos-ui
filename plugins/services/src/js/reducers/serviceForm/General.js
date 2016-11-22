import {simpleReducer} from '../../../../../../src/js/utils/ReducerUtil';

module.exports = {
  id: simpleReducer('id'),
  instances: simpleReducer('instances'),
  // Container runtime is handled in ./serviceForm/Container
  cpus: simpleReducer('cpus'),
  mem: simpleReducer('mem'),
  disk: simpleReducer('disk'),
  cmd: simpleReducer('cmd')
};
