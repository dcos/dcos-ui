import {JSONReducer as constraints} from './serviceForm/Constraints';
import {JSONReducer as container} from './serviceForm/Container';
import {JSONReducer as containers} from './serviceForm/Containers';
import {JSONReducer as env} from './serviceForm/EnvironmentVariables';
import {JSONReducer as fetch} from './serviceForm/Artifacts';
import {JSONReducer as healthChecks} from './serviceForm/HealthChecks';
import {JSONReducer as labels} from './serviceForm/Labels';
import {JSONReducer as portDefinitions} from './serviceForm/PortDefinitions';
import {JSONReducer as volumes} from './serviceForm/Volumes';
import {JSONReducer as ipAddress} from './serviceForm/IpAddress';
import {
  simpleFloatReducer,
  simpleIntReducer,
  simpleReducer
} from '../../../../../src/js/utils/ReducerUtil';

import ValidatorUtil from '../../../../../src/js/utils/ValidatorUtil';

module.exports = {
  id: simpleReducer('id'),
  instances: simpleIntReducer('instances'),
  container() {
    const newState = container.apply(this, arguments);
    if (ValidatorUtil.isEmpty(newState)) {
      return null;
    }
    return newState;
  },
  containers,
  cpus: simpleFloatReducer('cpus'),
  mem: simpleIntReducer('mem'),
  disk: simpleIntReducer('disk'),
  gpus: simpleIntReducer('gpus'),
  cmd: simpleReducer('cmd'),
  env,
  labels,
  healthChecks,
  constraints,
  fetch,
  portDefinitions,
  volumes,
  ipAddress
};
