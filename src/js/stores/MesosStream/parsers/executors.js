import { GET_EXECUTORS } from "../../../constants/MesosStreamMessageTypes";
import { scalar } from "./ProtobufUtil";

function processExecutor({ agent_id, executor_info }) {
  const executor = { agent_id, ...executor_info };
  executor.id = scalar(executor.executor_id);
  executor.slave_id = scalar(executor.agent_id);
  executor.framework_id = scalar(executor.framework_id);

  return executor;
}

export default function getExecutorsAction(state, message) {
  if (message.type !== GET_EXECUTORS) {
    return state;
  }

  const executors = (message.get_executors.executors || []).map(
    processExecutor
  );

  return Object.assign({}, state, { executors });
}
