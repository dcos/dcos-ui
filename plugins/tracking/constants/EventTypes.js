const EventTypes = {};
["AUTH_USER_LOGIN_CHANGED"].forEach(function(eventType) {
  EventTypes[eventType] = eventType;
});

module.exports = EventTypes;
