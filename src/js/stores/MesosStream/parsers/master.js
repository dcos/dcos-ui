import { GET_MASTER } from "../../../constants/MesosStreamMessageTypes";

export default function getMaster(state, message) {
  if (message.type !== GET_MASTER) {
    return state;
  }

  const { master_info } = message.get_master;

  return Object.assign({}, state, { master_info });
}
