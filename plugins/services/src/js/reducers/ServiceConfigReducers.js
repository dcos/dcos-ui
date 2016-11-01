import ReducerUtil from '../../../../../src/js/utils/ReducerUtil';

module.exports = {
  id: ReducerUtil.simpleReducer('id', '/'),
  cpus: ReducerUtil.simpleFloatReducer('cpus', 0.01),
  mem: ReducerUtil.simpleIntReducer('mem', 128),
  disk: ReducerUtil.simpleIntReducer('disk', 0),
  instances: ReducerUtil.simpleIntReducer('instances', 1),
  cmd: ReducerUtil.simpleReducer('cmd', '')
};
