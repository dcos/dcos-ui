import React from "react";
import { mount } from "enzyme";
import JestUtil from "#SRC/js/utils/JestUtil";

const Application = require("../../../structs/Application");
const ServiceConfigurationContainer = require("../ServiceConfigurationContainer");
const ServiceConfigDisplay = require("../../../service-configuration/ServiceConfigDisplay");

jest.mock("#SRC/js/events/MetronomeActions", () => ({
  fetchJobs: jest.fn()
}));

let thisInstance;

describe("ServiceConfigurationContainer", function() {
  const service = new Application({
    id: "/test",
    healthChecks: [{ path: "", protocol: "HTTP" }],
    cpus: 1,
    cmd: "sleep 999",
    mem: 2048,
    version: "2016-05-02T16:07:32.583Z",
    versionInfo: {
      lastConfigChangeAt: "2016-03-22T10:46:07.354Z",
      lastScalingAt: "2016-03-22T10:46:07.354Z"
    },
    versions: new Map([
      [
        "2016-05-02T16:07:32.583Z",
        {
          id: "/test",
          container: {
            volumes: [
              {
                containerPath: "/mnt/volume",
                external: {
                  name: "someVolume",
                  provider: "dvdi",
                  options: {
                    "dvdi/driver": "rexray"
                  }
                },
                mode: "RW"
              }
            ]
          }
        }
      ]
    ])
  });

  beforeEach(function() {
    const WrappedComponent = JestUtil.withI18nProvider(
      ServiceConfigurationContainer
    );
    thisInstance = mount(
      <WrappedComponent onEditClick={function() {}} service={service} />
    );
  });

  describe("#render", function() {
    it("renders correct id", function() {
      const serviceSpecView = thisInstance.find(ServiceConfigDisplay);

      expect(serviceSpecView.exists()).toBeTruthy();
    });
  });
});
