import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import {omit} from '../../../../../../src/js/utils/Util';
import VolumeConstants from '../../constants/VolumeConstants';

let {MESOS} = VolumeConstants.type;

function container(state = {}, {type, path, value}) {
  let joinedPath = path && path.join('.');
  let newState = omit(state, ['docker']);
  if (!newState.type) {
    newState.type = MESOS;
  }
  let containerInfo = state.docker || {};

  if (type === SET && joinedPath === 'container.type') {
    // Update stored container type
    newState.type = value;
  }

  if (type === SET && joinedPath === 'container.docker.privileged') {
    Object.assign(containerInfo, {privileged: value});
  }

  if (type === SET && joinedPath === 'container.docker.forcePullImage') {
    Object.assign(containerInfo, {forcePullImage: value});
  }

  if (type === SET && joinedPath === 'container.docker.image') {
    Object.assign(containerInfo, {image: value});
  }

  // Move container to new containerKey
  return Object.assign({}, newState, {docker: containerInfo});
};

module.exports = {
  JSONReducer: container,
  FormReducer: container
};
