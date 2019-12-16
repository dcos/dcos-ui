import React from "react";
import { shallow, mount } from "enzyme";

import DCOSStore from "#SRC/js/stores/DCOSStore";

jest.mock("#SRC/js/stores/DCOSStore");

const pushMock = jest.fn();
jest.setMock("react-router", {
  hashHistory: {
    push: pushMock
  }
});

const EditServiceModal = require("../EditServiceModal").default;

describe("EditServiceModal", () => {
  it("renders an empty modal if the service is loaded", () => {
    DCOSStore.serviceDataReceived = false;
    DCOSStore.serviceTree = {
      findItemById() {
        return null;
      }
    };

    const wrapper = shallow(
      <EditServiceModal params={{ id: "/my-service" }} />
    );
    expect(wrapper.type().name).toBe("FullScreenModal");
  });

  it("renders an error if the service could not be found", () => {
    DCOSStore.serviceDataReceived = true;
    DCOSStore.serviceTree = {
      findItemById() {
        return null;
      }
    };

    mount(<EditServiceModal params={{ id: "/my-non-existant-service" }} />);

    expect(pushMock).toHaveBeenCalled();
  });

  it("renders an edit modal if the service has been created", () => {
    DCOSStore.serviceDataReceived = true;
    DCOSStore.serviceTree = {
      findItemById() {
        return {
          getLabels() {
            return { DCOS_PACKAGE_DEFINITION: "some-value" };
          }
        };
      }
    };

    const wrapper = shallow(
      <EditServiceModal params={{ id: "/my-created-service" }} />
    );
    expect(wrapper.type().name).toBe("EditFrameworkConfiguration");
  });

  it("renders a create modal if the service has not been created", () => {
    DCOSStore.serviceDataReceived = true;
    DCOSStore.serviceTree = {
      findItemById() {
        return {
          getLabels() {
            return { DCOS_PACKAGE_DEFINITION: null };
          }
        };
      }
    };

    const wrapper = shallow(
      <EditServiceModal params={{ id: "/my-new-service" }} />
    )
      .dive()
      .dive();
    expect(wrapper.type().name).toBe("CreateServiceModal");
  });
});
