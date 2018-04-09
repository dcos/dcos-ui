import React from "react";
import { shallow, mount } from "enzyme";

jest.mock("#SRC/js/stores/DCOSStore");

const DCOSStore = require("#SRC/js/stores/DCOSStore");
const EditServiceModal = require("../EditServiceModal").default;

describe("EditServiceModal", function() {
  it("renders an empty modal if the service is loaded", function() {
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

  it("renders an error if the service could not be found", function() {
    DCOSStore.serviceDataReceived = true;
    DCOSStore.serviceTree = {
      findItemById() {
        return null;
      }
    };

    const wrapper = mount(
      <EditServiceModal params={{ id: "/my-non-existant-service" }} />
    );

    expect(wrapper.text()).toContain(
      "This service does not exist, you can not edit it"
    );
  });

  it("renders an edit modal if the service has been created", function() {
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

  it("renders a create modal if the service has not been created", function() {
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
    );
    expect(wrapper.type().name).toBe("CreateServiceModal");
  });
});
