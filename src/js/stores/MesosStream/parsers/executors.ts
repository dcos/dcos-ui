import { GET_EXECUTORS } from "../../../constants/MesosStreamMessageTypes";

function processExecutor({ agent_id, executor_info }) {
  const executor = { agent_id, ...executor_info };
  executor.id = executor.executor_id.value;
  executor.slave_id = executor.agent_id.value;
  executor.framework_id = executor.framework_id.value;

  return executor;
}

export default function getExecutorsAction(state, message) {
  if (message.type !== GET_EXECUTORS) {
    return state;
  }

  const executors = (message.get_executors.executors || []).map(
    processExecutor
  );

  return {
    ...state,
    executors,
  };
}
