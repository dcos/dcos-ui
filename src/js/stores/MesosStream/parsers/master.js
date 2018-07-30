import { GET_MASTER } from "../../../constants/MesosStreamMessageTypes";

export default function getMaster(state, message) {
  if (message.type !== GET_MASTER) {
    return state;
  }

  const { master_info, elected_time, start_time } = message.get_master;
  const enhancedMasterInfo = Object.assign({}, master_info, {
    elected_time,
    start_time
  });

  return Object.assign({}, state, { master_info: enhancedMasterInfo });
}
