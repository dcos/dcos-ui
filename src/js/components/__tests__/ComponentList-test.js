jest.dontMock("../ComponentList");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");
const ComponentList = require("../ComponentList");
const HealthUnitsList = require("../../structs/HealthUnitsList");

describe("#ComponentList", function() {
  var healthUnits;

  beforeEach(function() {
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

    this.component = TestUtils.renderIntoDocument(
      <ComponentList displayCount={displayCount} units={healthUnits} />
    );
  });

  describe("#getSortedHealthValues", function() {
    it("should sort health units by visibility importance", function() {
      /**
       * health status visibility importance order top to bottom
       * unhealthy > NA > warn/idle > healthy
       */
      const sortedUnits = this.component.getSortedHealthValues(
        healthUnits.getItems()
      );
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

  describe("#getVisibleComponents", function() {
    it("should only return the number of visible units", function() {
      const unitsVisible = this.component.getVisibleComponents(
        healthUnits.getItems()
      );

      expect(unitsVisible.length).toEqual(2);
    });
  });
});
