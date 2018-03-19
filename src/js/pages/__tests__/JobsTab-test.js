/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { mount } from "enzyme";

jest.mock("#SRC/js/stores/DCOSStore");

const JestUtil = require("../../utils/JestUtil");

const DCOSStore = require("#SRC/js/stores/DCOSStore");
const AlertPanel = require("../../components/AlertPanel");
const MetronomeUtil = require("../../utils/MetronomeUtil");
const JobsTab = require("../jobs/JobsTab");
const JobTree = require("../../structs/JobTree");
const JobsTable = require("../../pages/jobs/JobsTable");

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
        JestUtil.stubRouterContext(JobsTab, { params: { id: "/" } })
      );

      expect(wrapper.find(JobsTable).exists());
    });

    it("renders loading screen", function() {
      DCOSStore.jobDataReceived = false;
      const wrapper = mount(
        JestUtil.stubRouterContext(JobsTab, { params: { id: "/" } })
      );

      expect(wrapper.find(".ball-scale").exists());
    });

    it("renders correct empty panel", function() {
      const wrapper = mount(
        JestUtil.stubRouterContext(JobsTab, { params: { id: "/" } })
      );

      expect(wrapper.find(AlertPanel).exists());
    });
  });
});
