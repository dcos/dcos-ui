import { Route } from "react-router";

import EventStreamTest from "../pages/event-stream-test/EventStreamTest";

const eventStreamTestRoutes = [
  {
    type: Route,
    path: "event-stream-test",
    component: EventStreamTest,
    category: "root",
    isInSidebar: false
  }
];

module.exports = eventStreamTestRoutes;
