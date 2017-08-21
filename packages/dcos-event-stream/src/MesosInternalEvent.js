import MesosEventTypes from "./constants/MesosEventTypes";

class MesosInternalEvent {
  constructor(key, value, eventType = MesosEventTypes.ADD) {
    this.key = key;
    this.value = value;
    this.eventType = eventType;
  }
}

module.exports = MesosInternalEvent;
