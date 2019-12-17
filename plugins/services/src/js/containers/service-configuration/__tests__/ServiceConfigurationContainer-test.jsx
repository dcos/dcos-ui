import * as React from "react";
import { mount } from "enzyme";
import JestUtil from "#SRC/js/utils/JestUtil";

import Application from "../../../structs/Application";
import ServiceConfigurationContainer from "../ServiceConfigurationContainer";
import ServiceConfigDisplay from "../../../service-configuration/ServiceConfigDisplay";

let thisInstance;

describe("ServiceConfigurationContainer", () => {
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

  beforeEach(() => {
    const WrappedComponent = JestUtil.withI18nProvider(
      ServiceConfigurationContainer
    );
    thisInstance = mount(
      <WrappedComponent onEditClick={() => {}} service={service} />
    );
  });

  describe("#render", () => {
    it("renders correct id", () => {
      const serviceSpecView = thisInstance.find(ServiceConfigDisplay);

      expect(serviceSpecView.exists()).toBeTruthy();
    });
  });
});
