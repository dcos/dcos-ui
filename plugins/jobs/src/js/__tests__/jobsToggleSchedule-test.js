import { Observable } from "rxjs";
import "rxjs/add/observable/of";

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

describe("JobsToggleSchedule", function() {
  describe("#jobsToggleSchedule", function() {
    describe("label", function() {
      it("Enable Schedule if job is disabled", function() {
        const label = jobsToggleSchedule(disabledJob).label;

        expect(label).toEqual("Enable Schedule");
      });

      it("Disable Schedule if job is enabled", function() {
        const label = jobsToggleSchedule(enabledJob).label;

        expect(label).toEqual("Disable Schedule");
      });
    });

    describe("onItemSelect", function() {
      it("triggers a graphql mutation to disable schedule", function() {
        graphqlObservable.mockReturnValue(Observable.of("response"));
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

      it("triggers a graphql mutation to enable schedule", function() {
        graphqlObservable.mockReturnValue(Observable.of("response"));
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
