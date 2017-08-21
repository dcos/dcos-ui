import JsonToEventArrayUtil from "../utils/JsonToEventArrayUtil";
import MesosEventTypes from "../constants/MesosEventTypes";

const translate = function(event) {
  event = event["framework_updated"];

  return JsonToEventArrayUtil.flatten(event, MesosEventTypes.UPDATE);
};

module.exports = translate;
