import {
  GET_STATE,
  GET_AGENTS,
  GET_FRAMEWORKS,
  GET_TASKS,
  GET_EXECUTORS
} from "../../../constants/MesosStreamMessageTypes";

import { getFrameworksAction } from "./frameworks";
import { getTasksAction } from "./tasks";
import getExecutorsAction from "./executors";
import { getAgentsAction } from "./agents";

export default function getStateAction(state, message) {
  if (message.type !== GET_STATE) {
    return state;
  }

  const getFrameworksMessage = {
    type: GET_FRAMEWORKS,
    get_frameworks: message.get_state.get_frameworks
  };
  const frameworksPartial = getFrameworksAction({}, getFrameworksMessage);

  const getTasksMessage = {
    type: GET_TASKS,
    get_tasks: message.get_state.get_tasks
  };
  const tasksPartial = getTasksAction(
    { ...frameworksPartial },
    getTasksMessage
  );

  const getExecutorsMessage = {
    type: GET_EXECUTORS,
    get_executors: message.get_state.get_executors
  };
  const executorsPartial = getExecutorsAction({}, getExecutorsMessage);

  let agentsPartial = {};
  if (message.get_state.get_agents) {
    const getAgentsMessage = {
      type: GET_AGENTS,
      get_agents: message.get_state.get_agents
    };

    agentsPartial = getAgentsAction({}, getAgentsMessage);
  }

  return Object.assign({}, state, {
    ...agentsPartial,
    ...executorsPartial,
    ...frameworksPartial,
    ...tasksPartial
  });
}
