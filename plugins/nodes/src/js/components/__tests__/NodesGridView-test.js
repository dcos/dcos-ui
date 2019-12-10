import NodesList from "#SRC/js/structs/NodesList";
import ServicesList from "../../../../../services/src/js/structs/ServicesList";

const React = require("react");
const ReactDOM = require("react-dom");

const MesosStateStore = require("#SRC/js/stores/MesosStateStore");

const NodesGridView = require("../NodesGridView").default;

let thisStoreChangeListener,
  thisHosts,
  thisServices,
  thisContainer,
  thisInstance;

describe("NodesGridView", () => {
  describe("#getActiveServiceIds", () => {
    beforeEach(() => {
      thisStoreChangeListener = MesosStateStore.addChangeListener;
      MesosStateStore.addChangeListener = () => {};

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
          onShowServices={() => {}}
          resourcesByFramework={{}}
          serviceColors={{}}
          selectedResource={"mem"}
          hosts={thisHosts.getItems()}
          services={thisServices.getItems()}
        />,
        thisContainer
      );
    });
    afterEach(() => {
      MesosStateStore.addChangeListener = thisStoreChangeListener;
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("returns a list of unique framework_ids", () => {
      const list = thisInstance.getActiveServiceIds(thisHosts.getItems());

      expect(list).toEqual(["a", "b", "c", "d", "e", "f", "g", "z"]);
    });
  });

  describe("#shouldRenderLoadingScreen", () => {
    const shouldRenderLoadingScreen = props =>
      NodesGridView.prototype.shouldRenderLoadingScreen.call({
        props
      });

    it("returns true if it has a loading error", () => {
      expect(shouldRenderLoadingScreen({ hasLoadingError: true })).toBeTruthy();
    });

    it("returns true if it has an empty mesos state", () => {
      expect(
        shouldRenderLoadingScreen({ receivedEmptyMesosState: true })
      ).toBeTruthy();
    });

    it("returns true if it has no node healthy response", () => {
      expect(
        shouldRenderLoadingScreen({ receivedNodeHealthResponse: false })
      ).toBeTruthy();
    });

    it("returns false otherwise", () => {
      expect(
        shouldRenderLoadingScreen({ receivedNodeHealthResponse: true })
      ).toBeFalsy();
    });
  });
});
