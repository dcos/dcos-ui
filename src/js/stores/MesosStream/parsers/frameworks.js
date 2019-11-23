import {
  GET_FRAMEWORKS,
  FRAMEWORK_ADDED,
  FRAMEWORK_UPDATED,
  FRAMEWORK_REMOVED
} from "../../../constants/MesosStreamMessageTypes";

function processFramework({ framework_info, ...rest }) {
  const framework = { ...framework_info, ...rest };
  framework.id = framework_info.id.value;

  return framework;
}

export function getFrameworksAction(state, message) {
  if (message.type !== GET_FRAMEWORKS) {
    return state;
  }

  const frameworks = Object.keys(message.get_frameworks).reduce(
    (acc, key) => acc.concat(message.get_frameworks[key].map(processFramework)),
    []
  );

  return Object.assign({}, state, { frameworks });
}

export function frameworkAddedAction(state, message) {
  if (message.type !== FRAMEWORK_ADDED) {
    return state;
  }

  const framework = processFramework(message.framework_added.framework);

  return Object.assign({}, state, {
    frameworks: [...state.frameworks, framework]
  });
}

export function frameworkUpdatedAction(state, message) {
  if (message.type !== FRAMEWORK_UPDATED) {
    return state;
  }

  const updatedFramework = processFramework(
    message.framework_updated.framework
  );
  const frameworks = state.frameworks.map(framework => {
    if (updatedFramework.id === framework.id) {
      return updatedFramework;
    }

    return framework;
  });

  return Object.assign({}, state, { frameworks });
}

export function frameworkRemovedAction(state, message) {
  if (message.type !== FRAMEWORK_REMOVED) {
    return state;
  }

  const removedFramework = processFramework({
    framework_info: message.framework_removed.framework_info
  });
  const frameworks = state.frameworks.filter(
    framework => removedFramework.id !== framework.id
  );

  return Object.assign({}, state, { frameworks });
}
