jest.dontMock("../ContainerUtil");

const ContainerUtil = require("../ContainerUtil");

describe("#adjustActionErrors", function() {
  let actionErrors = ContainerUtil.adjustActionErrors({}, "foo", "error");

  it("should correctly set error key", function() {
    expect(actionErrors).toEqual({ foo: "error" });
  });

  it("should correctly add to error keys", function() {
    actionErrors = ContainerUtil.adjustActionErrors(
      actionErrors,
      "bar",
      "newError"
    );

    expect(actionErrors).toEqual({ foo: "error", bar: "newError" });
  });

  it("should correctly alter existing keys", function() {
    actionErrors = ContainerUtil.adjustActionErrors(actionErrors, "foo", null);

    expect(actionErrors).toEqual({ foo: null, bar: "newError" });
  });
});

describe("#adjustPendingActions", function() {
  let pendingActions = ContainerUtil.adjustPendingActions({}, "foo", true);

  it("should correctly set pending action key", function() {
    expect(pendingActions).toEqual({ foo: true });
  });

  it("should correctly add to pending action keys", function() {
    pendingActions = ContainerUtil.adjustPendingActions(
      pendingActions,
      "bar",
      false
    );

    expect(pendingActions).toEqual({ foo: true, bar: false });
  });

  it("should correctly alter existing keys", function() {
    pendingActions = ContainerUtil.adjustPendingActions(
      pendingActions,
      "foo",
      false
    );

    expect(pendingActions).toEqual({ foo: false, bar: false });
  });
});
