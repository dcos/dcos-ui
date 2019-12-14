import NavigationService from "./NavigationService";
import * as EventTypes from "./EventTypes";

const service = new NavigationService();

export default {
  EventTypes,
  NavigationService: service
};
