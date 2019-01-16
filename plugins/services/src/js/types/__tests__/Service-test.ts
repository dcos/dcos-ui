import { Service, compare } from "#PLUGINS/services/src/js/types/Service";

describe("Service", () => {
  describe("#compare", () => {
    it("returns true for same service", () => {
      const serviceA: Service = {
        name: "/my_service",
        plans: []
      };
      const serviceB: Service = {
        name: "/my_service",
        plans: []
      };

      expect(compare(serviceA, serviceB)).toEqual(true);
    });

    it("return false if services don't match", () => {
      const serviceA: Service = {
        name: "/my_service",
        plans: []
      };
      const serviceB: Service = {
        name: "/my-other-service",
        plans: []
      };

      expect(compare(serviceA, serviceB)).toEqual(false);
    });
  });
});
