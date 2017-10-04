const ServiceTree = require("../../structs/ServiceTree");
const Application = require("../../structs/Application");
const Framework = require("../../structs/Framework");
const ServiceTreeUtil = require("../ServiceTreeUtil");

describe("#isGroupWithServices", function() {
  it("returns false if the service is not a group", function() {
    const service = new Framework({ id: "a" });
    expect(ServiceTreeUtil.isGroupWithServices(service)).toEqual(false);
  });
  it("returns true if is is a group with services", function() {
    const service = new ServiceTree({
      id: "/group",
      items: [
        {
          id: "group/test",
          items: []
        },
        new Application({ id: "a" }),
        new Framework({ id: "b" })
      ]
    });
    expect(ServiceTreeUtil.isGroupWithServices(service)).toEqual(true);
  });
  it("returns false if is is an empty group", function() {
    const service = new ServiceTree({
      id: "/group"
    });
    expect(ServiceTreeUtil.isGroupWithServices(service)).toEqual(false);
  });
});
