import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import {omit} from '../../../../../../src/js/utils/Util';
import VolumeConstants from '../../constants/VolumeConstants';

let {MESOS} = VolumeConstants.type;
const ALL_CONTAINER_KEYS = Object.values(VolumeConstants.type).map(
  (typeName) => typeName.toLowerCase()
);

function container(state = {}, {type, path, value}) {
  let joinedPath = path && path.join('.');
  let newState = omit(state, ALL_CONTAINER_KEYS);
  if (!newState.type) {
    newState.type = MESOS;
  }
  let containerKey = newState.type.toLowerCase();
  let containerInfo = state[containerKey] || {};

  if (type === SET && joinedPath === 'container.type') {
    // Update stored container type
    containerKey = value && value.toLowerCase();
    newState.type = value;
  }

  if (type === SET && joinedPath === `container.${containerKey}.privileged`) {
    Object.assign(containerInfo, {privileged: value});
  }

  if (type === SET && joinedPath === `container.${containerKey}.forcePullImage`) {
    Object.assign(containerInfo, {forcePullImage: value});
  }

  if (type === SET && joinedPath === `container.${containerKey}.image`) {
    Object.assign(containerInfo, {image: value});
  }

  // Move container to new containerKey
  return Object.assign({}, newState, {[`${containerKey}`]: containerInfo});
};

module.exports = {
  JSONReducer: container,
  FormReducer: container
};
