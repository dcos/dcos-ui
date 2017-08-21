import JsonToEventArrayUtil from "../utils/JsonToEventArrayUtil";
import MesosEventTypes from "../constants/MesosEventTypes";

const translate = function(event) {
  event = event["agent_removed"];

  return JsonToEventArrayUtil.flatten(event, MesosEventTypes.REMOVE);
};

module.exports = translate;
