import { Observable } from "rxjs";
import "rxjs/add/observable/of";
import { updateSchedule } from "#SRC/js/events/MetronomeClient";
import jobsToggleSchedule from "../jobsToggleSchedule";

jest.mock("#SRC/js/events/MetronomeClient", () => ({
  updateSchedule: jest.fn()
}));

const enabledJob = {
  id: "enabled",
  schedules: [{ enabled: true }]
};

const disabledJob = {
  id: "disabled",
  schedules: [{ enabled: false }]
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
        updateSchedule.mockReturnValue(Observable.of("response"));
        jobsToggleSchedule(enabledJob).onItemSelect();

        expect(updateSchedule).toBeCalledWith("enabled", {
          enabled: false
        });
      });

      it("triggers a graphql mutation to enable schedule", function() {
        updateSchedule.mockReturnValue(Observable.of("response"));
        jobsToggleSchedule(disabledJob).onItemSelect();

        expect(updateSchedule).toBeCalledWith("disabled", {
          enabled: true
        });
      });
    });
  });
});
