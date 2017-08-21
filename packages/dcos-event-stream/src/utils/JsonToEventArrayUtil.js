import MesosInternalEvent from "../MesosInternalEvent";
import MesosEventTypes from "../constants/MesosEventTypes";

const arrayKeyConcat = function(key1, key2) {
  return `${key1}${key1 && key1.length > 0 ? "." : ""}${key2}`;
};

const flatten = function(json, eventType) {
  return JsonToArrayGenerator(json, eventType, "", []);
};

const JsonToArrayGenerator = function(
  json,
  eventType = MesosEventTypes.UPDATE,
  key = "",
  arr = []
) {
  const jsonKeys = Object.keys(json);
  jsonKeys.forEach(prop => {
    if (typeof json[prop] === "object" && Object.keys(json[prop]).length > 0) {
      JsonToArrayGenerator(
        json[prop],
        eventType,
        arrayKeyConcat(key, prop),
        arr
      );
    } else {
      arr.push(
        new MesosInternalEvent(arrayKeyConcat(key, prop), json[prop], eventType)
      );
    }
  });

  return arr;
};

module.exports = { flatten };
