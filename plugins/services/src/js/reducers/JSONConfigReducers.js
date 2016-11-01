import ReducerUtil from '../../../../../src/js/utils/ReducerUtil';

module.exports = {
  id: ReducerUtil.simpleReducer('id', '/'),
  cpus: ReducerUtil.simpleReducer('cpus', 0.01),
  mem: ReducerUtil.simpleReducer('mem', 128),
  disk: ReducerUtil.simpleReducer('disk', 0),
  instances: ReducerUtil.simpleReducer('instances', 1),
  cmd: ReducerUtil.simpleReducer('cmd', '')
};
