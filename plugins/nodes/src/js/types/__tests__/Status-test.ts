import { Status } from "../Status";
import Node from "#SRC/js/structs/Node";

const drainInfo = (state: string) => ({
  drain_info: { config: {}, state },
  deactivated: true
});

describe("#fromNode", () => {
  it("handles active nodes correctly", () => {
    [
      new Node({ active: true }),
      new Node({ active: true, deactivated: false }),
      // according to the mesos folks an agent can't have drain_info if it's not deactivated - so we preserve that intention here for states that look invalid.
      new Node({ ...drainInfo("UNKNOWN"), deactivated: false }),
      new Node({ ...drainInfo("DRAINED"), deactivated: false }),
      new Node({ ...drainInfo("DRAINING"), deactivated: false })
    ].forEach(n => {
      expect(Status.fromNode(n).displayName).toBe("Active");
    });
  });
  it("handles deactivated nodes correctly", () => {
    expect(
      Status.fromNode(new Node({ active: false, deactivated: true }))
        .displayName
    ).toBe("Deactivated");
  });
  it("handles nodes with drain_info correctly", () => {
    expect(Status.fromNode(new Node(drainInfo("UNKNOWN"))).displayName).toBe(
      "Unknown"
    );

    expect(Status.fromNode(new Node(drainInfo("DRAINING"))).displayName).toBe(
      "Draining"
    );

    expect(Status.fromNode(new Node(drainInfo("DRAINED"))).displayName).toBe(
      "Drained"
    );
  });
});
