import {combineReducers, simpleReducer} from '../../../../../../src/js/utils/ReducerUtil';

module.exports = combineReducers({
  privileged: simpleReducer('container.docker.privileged', null),
  forcePullImage: simpleReducer('container.docker.forcePullImage', null),
  image: simpleReducer('container.docker.image', '')
});
