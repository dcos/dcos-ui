/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

var NodesGridView = require("../NodesGridView");
var MesosStateStore = require("#SRC/js/stores/MesosStateStore");
var NodesList = require("#SRC/js/structs/NodesList");
const ServicesList = require("../../../../../services/src/js/structs/ServicesList");

describe("NodesGridView", function() {
  describe("#getActiveServiceIds", function() {
    beforeEach(function() {
      this.storeChangeListener = MesosStateStore.addChangeListener;
      MesosStateStore.addChangeListener = function() {};

      this.hosts = new NodesList({
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
      this.services = new ServicesList({
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

      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <NodesGridView
          onShowServices={function() {}}
          resourcesByFramework={{}}
          serviceColors={{}}
          selectedResource={"mem"}
          hosts={this.hosts.getItems()}
          services={this.services.getItems()}
        />,
        this.container
      );
    });
    afterEach(function() {
      MesosStateStore.addChangeListener = this.storeChangeListener;
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("returns a list of unique framework_ids", function() {
      var list = this.instance.getActiveServiceIds(this.hosts.getItems());

      expect(list).toEqual(["a", "b", "c", "d", "e", "f", "g", "z"]);
    });
  });
});
