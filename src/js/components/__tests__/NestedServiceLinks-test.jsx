import NestedServiceLinks from "../NestedServiceLinks";

const React = require("react");
const enzyme = require("enzyme");

describe("NestedServiceLinks", () => {
  const id = "foo";

  describe("#Service", () => {
    const serviceLink = `/services/detail/${id}`;
    const component = enzyme.shallow(
      <NestedServiceLinks
        serviceLink={serviceLink}
        serviceID={id}
        className="service-breadcrumb"
        majorLinkClassName="service-breadcrumb-service-id"
        minorLinkWrapperClassName="service-breadcrumb-crumb"
      />
    );

    it("major link navigates to detail", () => {
      const result = component.find(".table-cell-link-primary").props().to;

      expect(result).toEqual(serviceLink);
    });

    it("minor link navigates to services", () => {
      const result = component.find(".table-cell-link-secondary").props().to;

      expect(result).toEqual("/services");
    });
  });

  describe("#Group", () => {
    const groupServiceLink = `/services/overview/${id}`;
    const component = enzyme.shallow(
      <NestedServiceLinks
        serviceLink={groupServiceLink}
        serviceID={id}
        className="service-breadcrumb"
        majorLinkClassName="service-breadcrumb-service-id"
        minorLinkWrapperClassName="service-breadcrumb-crumb"
      />
    );

    it("major link navigates to overview", () => {
      const result = component.find(".table-cell-link-primary").props().to;

      expect(result).toEqual(groupServiceLink);
    });

    it("minor link navigates to services", () => {
      const result = component.find(".table-cell-link-secondary").props().to;

      expect(result).toEqual("/services");
    });
  });

  describe("#Group multi level", () => {
    const id = "group/foo";
    const groupLevelLink = `/services/detail/${id}`;
    const component = enzyme.shallow(
      <NestedServiceLinks
        serviceLink={groupLevelLink}
        serviceID={id}
        className="service-breadcrumb"
        majorLinkClassName="service-breadcrumb-service-id"
        minorLinkWrapperClassName="service-breadcrumb-crumb"
      />
    );

    it("major link navigates to overview", () => {
      const result = component.find(".table-cell-link-primary").props().to;

      expect(result).toEqual(groupLevelLink);
    });

    it("first minor link navigates to services", () => {
      const result = component.find(".table-cell-link-secondary");

      expect(result.first().props().to).toEqual("/services");
      expect(result.last().props().to).toEqual("/services/overview/group");
    });

    it("last minor link navigates to group", () => {
      const result = component.find(".table-cell-link-secondary");

      expect(result.first().props().to).toEqual("/services");
      expect(result.last().props().to).toEqual("/services/overview/group");
    });
  });
});
