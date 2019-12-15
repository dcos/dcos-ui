import React from "react";
import { shallow } from "enzyme";

import ComponentList from "../ComponentList";
import HealthUnitsList from "../../structs/HealthUnitsList";

let thisComponent;

describe("#ComponentList", () => {
  let healthUnits;

  beforeEach(() => {
    healthUnits = new HealthUnitsList({
      items: [
        { id: "dcos-marathon.service", health: 0, name: "Marathon" },
        { id: "dcos-mesos-dns.service", health: 1, name: "Mesos DNS" },
        { id: "dcos-mesos-master.service", health: 0 },
        { id: "dcos-signal.service", health: 0, name: "A Signal Service" },
        { id: "log-rotate", health: 3, name: "Log Rotate" }
      ]
    });
    const displayCount = 2;

    thisComponent = shallow(
      <ComponentList displayCount={displayCount} units={healthUnits} />
    );
  });

  describe("#getSortedHealthValues", () => {
    it("sorts health units by visibility importance", () => {
      /**
       * health status visibility importance order top to bottom
       * unhealthy > NA > warn/idle > healthy
       */
      const sortedUnits = thisComponent
        .instance()
        .getSortedHealthValues(healthUnits.getItems());
      const expectedResult = [
        {
          id: "dcos-mesos-dns.service",
          health: 1,
          name: "Mesos DNS",
          _itemData: {
            id: "dcos-mesos-dns.service",
            health: 1,
            name: "Mesos DNS"
          }
        },
        {
          id: "log-rotate",
          health: 3,
          name: "Log Rotate",
          _itemData: {
            id: "log-rotate",
            health: 3,
            name: "Log Rotate"
          }
        },
        {
          id: "dcos-signal.service",
          health: 0,
          name: "A Signal Service",
          _itemData: {
            id: "dcos-signal.service",
            health: 0,
            name: "A Signal Service"
          }
        },
        {
          id: "dcos-marathon.service",
          health: 0,
          name: "Marathon",
          _itemData: {
            id: "dcos-marathon.service",
            health: 0,
            name: "Marathon"
          }
        },
        {
          id: "dcos-mesos-master.service",
          health: 0,
          _itemData: {
            id: "dcos-mesos-master.service",
            health: 0
          }
        }
      ];

      expect(sortedUnits).toEqual(expectedResult);
    });
  });

  describe("#getVisibleComponents", () => {
    it("only returns the number of visible units", () => {
      const unitsVisible = thisComponent
        .instance()
        .getVisibleComponents(healthUnits.getItems());

      expect(unitsVisible.length).toEqual(2);
    });
  });
});
