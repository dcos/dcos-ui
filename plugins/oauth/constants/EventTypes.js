let EventTypes = {};
[
  'CONFIG_ERROR',
  'CONFIG_LOADED'
].forEach(function (eventType) {
  EventTypes[eventType] = eventType;
});

module.exports = EventTypes;
