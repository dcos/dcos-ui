import React from "react";
import { shallow } from "enzyme";

jest.mock("#SRC/js/stores/DCOSStore");

const DCOSStore = require("#SRC/js/stores/DCOSStore");
const EditServiceModal = require("../EditServiceModal").default;

describe("EditServiceModal", function() {
  it("renders an empty modal if no service is found", function() {
    DCOSStore.serviceTree = {
      findItemById() {
        return null;
      }
    };

    const wrapper = shallow(
      <EditServiceModal params={{ id: "/my-non-existant-service" }} />
    );
    expect(wrapper.type().name).toBe("FullScreenModal");
  });

  it("renders an edit modal if the service has been created", function() {
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
