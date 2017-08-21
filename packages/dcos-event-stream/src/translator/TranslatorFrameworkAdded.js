import JsonToEventArrayUtil from "../utils/JsonToEventArrayUtil";
import MesosEventTypes from "../constants/MesosEventTypes";

const translate = function(event) {
  event = event["framework_added"];

  return JsonToEventArrayUtil.flatten(event, MesosEventTypes.ADD);
};

module.exports = translate;
