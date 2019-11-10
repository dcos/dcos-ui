import { of } from "rxjs";

import { graphqlObservable } from "@dcos/data-service";
import jobsToggleSchedule from "../jobsToggleSchedule";

jest.mock("@dcos/data-service", () => ({
  graphqlObservable: jest.fn()
}));

const enabledJob = {
  id: "enabled",
  schedules: { nodes: [{ enabled: true }] }
};

const disabledJob = {
  id: "disabled",
  schedules: { nodes: [{ enabled: false }] }
};

describe("JobsToggleSchedule", () => {
  describe("#jobsToggleSchedule", () => {
    describe("label", () => {
      it("Enable Schedule if job is disabled", () => {
        const label = jobsToggleSchedule(disabledJob).label;

        expect(label).toEqual("Enable Schedule");
      });

      it("Disable Schedule if job is enabled", () => {
        const label = jobsToggleSchedule(enabledJob).label;

        expect(label).toEqual("Disable Schedule");
      });
    });

    describe("onItemSelect", () => {
      it("triggers a graphql mutation to disable schedule", () => {
        graphqlObservable.mockReturnValue(of("response"));
        jobsToggleSchedule(enabledJob).onItemSelect();

        expect(graphqlObservable).toBeCalledWith(
          expect.anything(),
          expect.anything(),
          {
            jobId: "enabled",
            data: { enabled: false }
          }
        );
      });

      it("triggers a graphql mutation to enable schedule", () => {
        graphqlObservable.mockReturnValue(of("response"));
        jobsToggleSchedule(disabledJob).onItemSelect();

        expect(graphqlObservable).toBeCalledWith(
          expect.anything(),
          expect.anything(),
          {
            jobId: "disabled",
            data: { enabled: true }
          }
        );
      });
    });
  });
});
