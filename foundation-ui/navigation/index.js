import NavigationService from "./NavigationService";
import EventTypes from "./EventTypes";

const service = new NavigationService();

module.exports = {
  EventTypes,
  NavigationService: service
};
