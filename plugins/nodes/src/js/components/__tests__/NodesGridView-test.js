const React = require("react");
const ReactDOM = require("react-dom");

const MesosStateStore = require("#SRC/js/stores/MesosStateStore");
const NodesList = require("#SRC/js/structs/NodesList");

const NodesGridView = require("../NodesGridView").default;
const ServicesList = require("../../../../../services/src/js/structs/ServicesList");

let thisStoreChangeListener,
  thisHosts,
  thisServices,
  thisContainer,
  thisInstance;

describe("NodesGridView", function() {
  describe("#getActiveServiceIds", function() {
    beforeEach(function() {
      thisStoreChangeListener = MesosStateStore.addChangeListener;
      MesosStateStore.addChangeListener = function() {};

      thisHosts = new NodesList({
        items: [
          {
            name: "foo",
            framework_ids: ["a", "b", "c"]
          },
          {
            name: "bar",
            framework_ids: ["a", "b", "c", "d", "e", "f"]
          },
          {
            name: "zoo",
            framework_ids: ["a", "d", "g", "z"]
          }
        ]
      });
      thisServices = new ServicesList({
        items: [
          { id: "a", tasks: [] },
          { id: "b", tasks: [] },
          { id: "c", tasks: [] },
          { id: "d", tasks: [] },
          { id: "e", tasks: [] },
          { id: "f", tasks: [] },
          { id: "g", tasks: [] },
          { id: "z", tasks: [] }
        ]
      });

      thisContainer = global.document.createElement("div");
      thisInstance = ReactDOM.render(
        <NodesGridView
          onShowServices={function() {}}
          resourcesByFramework={{}}
          serviceColors={{}}
          selectedResource={"mem"}
          hosts={thisHosts.getItems()}
          services={thisServices.getItems()}
        />,
        thisContainer
      );
    });
    afterEach(function() {
      MesosStateStore.addChangeListener = thisStoreChangeListener;
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("returns a list of unique framework_ids", function() {
      const list = thisInstance.getActiveServiceIds(thisHosts.getItems());

      expect(list).toEqual(["a", "b", "c", "d", "e", "f", "g", "z"]);
    });
  });

  describe("#shouldRenderLoadingScreen", function() {
    const shouldRenderLoadingScreen = props =>
      NodesGridView.prototype.shouldRenderLoadingScreen.call({
        props
      });

    it("returns true if it has a loading error", function() {
      expect(shouldRenderLoadingScreen({ hasLoadingError: true })).toBeTruthy();
    });

    it("returns true if it has an empty mesos state", function() {
      expect(
        shouldRenderLoadingScreen({ receivedEmptyMesosState: true })
      ).toBeTruthy();
    });

    it("returns true if it has no node healthy response", function() {
      expect(
        shouldRenderLoadingScreen({ receivedNodeHealthResponse: false })
      ).toBeTruthy();
    });

    it("returns false otherwise", function() {
      expect(
        shouldRenderLoadingScreen({ receivedNodeHealthResponse: true })
      ).toBeFalsy();
    });
  });
});
