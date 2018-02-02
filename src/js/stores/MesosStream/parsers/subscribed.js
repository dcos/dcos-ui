import {
  SUBSCRIBED,
  GET_STATE
} from "../../../constants/MesosStreamMessageTypes";

import getStateAction from "./state";

export default function subscribedAction(state, message) {
  if (message.type !== SUBSCRIBED) {
    return state;
  }

  const getStateMessage = {
    type: GET_STATE,
    get_state: message.subscribed.get_state
  };

  return getStateAction({}, getStateMessage);
}
