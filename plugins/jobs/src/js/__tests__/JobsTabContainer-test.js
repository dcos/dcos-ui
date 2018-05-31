/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { mount } from "enzyme";

jest.mock("#SRC/js/stores/DCOSStore");
jest.mock("#SRC/js/events/MetronomeActions", () => ({
  fetchJobs: jest.fn()
}));

const JestUtil = require("#SRC/js/utils/JestUtil");

const DCOSStore = require("#SRC/js/stores/DCOSStore");
const AlertPanel = require("#SRC/js/components/AlertPanel");
const MetronomeUtil = require("#SRC/js/utils/MetronomeUtil");
const JobsTabContainer = require("../JobsTabContainer");
const JobTree = require("#SRC/js/structs/JobTree");
const JobsTable = require("../components/JobsTable");

describe("JobsTab", function() {
  beforeEach(function() {
    DCOSStore.jobTree = new JobTree(
      MetronomeUtil.parseJobs([
        {
          id: "/test"
        }
      ])
    );
    DCOSStore.jobDataReceived = true;
  });

  describe("#render", function() {
    it("renders the job table", function() {
      const wrapper = mount(
        JestUtil.stubRouterContext(JobsTabContainer, { params: { id: "/" } })
      );

      expect(wrapper.find(JobsTable).exists());
    });

    it("renders loading screen", function() {
      DCOSStore.jobDataReceived = false;
      const wrapper = mount(
        JestUtil.stubRouterContext(JobsTabContainer, { params: { id: "/" } })
      );

      expect(wrapper.find(".ball-scale").exists());
    });

    it("renders correct empty panel", function() {
      const wrapper = mount(
        JestUtil.stubRouterContext(JobsTabContainer, { params: { id: "/" } })
      );

      expect(wrapper.find(AlertPanel).exists());
    });
  });
});
