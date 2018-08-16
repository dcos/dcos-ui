const ContainerUtil = require("../ContainerUtil");

describe("#adjustActionErrors", function() {
  let actionErrors = ContainerUtil.adjustActionErrors({}, "foo", "error");

  it("sets error key", function() {
    expect(actionErrors).toEqual({ foo: "error" });
  });

  it("adds to error keys", function() {
    actionErrors = ContainerUtil.adjustActionErrors(
      actionErrors,
      "bar",
      "newError"
    );

    expect(actionErrors).toEqual({ foo: "error", bar: "newError" });
  });

  it("alters existing keys", function() {
    actionErrors = ContainerUtil.adjustActionErrors(actionErrors, "foo", null);

    expect(actionErrors).toEqual({ foo: null, bar: "newError" });
  });
});

describe("#adjustPendingActions", function() {
  let pendingActions = ContainerUtil.adjustPendingActions({}, "foo", true);

  it("sets pending action key", function() {
    expect(pendingActions).toEqual({ foo: true });
  });

  it("adds to pending action keys", function() {
    pendingActions = ContainerUtil.adjustPendingActions(
      pendingActions,
      "bar",
      false
    );

    expect(pendingActions).toEqual({ foo: true, bar: false });
  });

  it("alters existing keys", function() {
    pendingActions = ContainerUtil.adjustPendingActions(
      pendingActions,
      "foo",
      false
    );

    expect(pendingActions).toEqual({ foo: false, bar: false });
  });
});

describe("#getNewContainerName", function() {
  const newState = [
    { name: "container-1", resources: { cpus: 0.1, mem: 128, disk: "" } },
    { name: "container-3", resources: { cpus: 0.1, mem: 128, disk: "" } }
  ];
  const newName = ContainerUtil.getNewContainerName(newState.length, newState);

  it("does not return a duplicate name", function() {
    const dupeNames = newState.filter(item => {
      return item.name === newName;
    });
    expect(dupeNames.length).toBe(0);
  });

  it("increases container number", function() {
    expect(parseInt(newName.split("-")[1], 10)).toBeGreaterThan(
      newState.length
    );
  });
});
