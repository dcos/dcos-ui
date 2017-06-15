jest.dontMock("../../../../../../src/js/components/CollapsingString");
jest.dontMock("../../../../../../src/js/mixins/InternalStorageMixin");
jest.dontMock("../NodesGridView");
jest.dontMock("../../../../../../src/js/stores/MesosStateStore");
jest.dontMock("../../../../../../src/js/utils/Util");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

var CompositeState = require("../../../../../../src/js/structs/CompositeState");
var NodesGridView = require("../NodesGridView");
var MesosStateStore = require("../../../../../../src/js/stores/MesosStateStore");
var NodesList = require("../../../../../../src/js/structs/NodesList");

MesosStateStore.addChangeListener = function() {};

describe("NodesGridView", function() {
  describe("#getActiveServiceIds", function() {
    beforeEach(function() {
      MesosStateStore.processStateSuccess({
        frameworks: [
          { id: "a", tasks: [], completed_tasks: [] },
          { id: "b", tasks: [], completed_tasks: [] },
          { id: "c", tasks: [], completed_tasks: [] },
          { id: "d", tasks: [], completed_tasks: [] },
          { id: "e", tasks: [], completed_tasks: [] },
          { id: "f", tasks: [], completed_tasks: [] },
          { id: "g", tasks: [], completed_tasks: [] },
          { id: "z", tasks: [], completed_tasks: [] }
        ]
      });
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
      this.container = global.document.createElement("div");
      this.instance = ReactDOM.render(
        <NodesGridView
          selectedResource={"mem"}
          hosts={this.hosts.getItems()}
          services={CompositeState.getServiceList().getItems()}
        />,
        this.container
      );
    });
    afterEach(function() {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it("should return a list of unique framework_ids", function() {
      var list = this.instance.getActiveServiceIds(this.hosts.getItems());

      expect(list).toEqual(["a", "b", "c", "d", "e", "f", "g", "z"]);
    });
  });
});
