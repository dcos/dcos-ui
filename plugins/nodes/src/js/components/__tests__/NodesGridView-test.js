/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

var NodesGridView = require("../NodesGridView");
var MesosStateStore = require("#SRC/js/stores/MesosStateStore");
var NodesList = require("#SRC/js/structs/NodesList");
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
      var list = thisInstance.getActiveServiceIds(thisHosts.getItems());

      expect(list).toEqual(["a", "b", "c", "d", "e", "f", "g", "z"]);
    });
  });
});
