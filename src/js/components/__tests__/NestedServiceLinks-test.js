const React = require("react");
const enzyme = require("enzyme");

const NestedServiceLinks = require("../NestedServiceLinks");

describe("NestedServiceLinks", function() {
  const id = "foo";

  describe("#Service", function() {
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

    it("major link navigates to detail", function() {
      const result = component.find(".table-cell-link-primary").props().to;

      expect(result).toEqual(serviceLink);
    });

    it("minor link navigates to services", function() {
      const result = component.find(".table-cell-link-secondary").props().to;

      expect(result).toEqual("/services");
    });
  });

  describe("#Group", function() {
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

    it("major link navigates to overview", function() {
      const result = component.find(".table-cell-link-primary").props().to;

      expect(result).toEqual(groupServiceLink);
    });

    it("minor link navigates to services", function() {
      const result = component.find(".table-cell-link-secondary").props().to;

      expect(result).toEqual("/services");
    });
  });

  describe("#Group multi level", function() {
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

    it("major link navigates to overview", function() {
      const result = component.find(".table-cell-link-primary").props().to;

      expect(result).toEqual(groupLevelLink);
    });

    it("first minor link navigates to services", function() {
      const result = component.find(".table-cell-link-secondary");

      expect(result.first().props().to).toEqual("/services");
      expect(result.last().props().to).toEqual("/services/overview/group");
    });

    it("last minor link navigates to group", function() {
      const result = component.find(".table-cell-link-secondary");

      expect(result.first().props().to).toEqual("/services");
      expect(result.last().props().to).toEqual("/services/overview/group");
    });
  });
});
