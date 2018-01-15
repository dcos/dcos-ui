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
