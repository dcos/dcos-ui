import {combineReducers, simpleReducer} from '../../../../../../src/js/utils/ReducerUtil';
import Networking from '../../../../../../src/js/constants/Networking';

module.exports = combineReducers({
  privileged: simpleReducer('container.docker.privileged', null),
  forcePullImage: simpleReducer('container.docker.forcePullImage', null),
  image: simpleReducer('container.docker.image', ''),
  network(state, {type, path, value}) {
    if (type === SET && joinedPath === 'networking.type') {
      return Networking.type[value];
    }

    return state;
  }
});
