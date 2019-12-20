import UniversePackage from "#SRC/js/structs/UniversePackage";
import { getFirstTabAndField } from "../FrameworkConfigurationUtil";

describe("FrameworkConfigurationUtil", () => {
  describe("#getFirstTabAndField", () => {
    describe("with valid schema", () => {
      const packageDetails = new UniversePackage({
        config: {
          type: "object",
          properties: {
            service: {
              type: "object",
              description: "DC/OS service configuration properties",
              properties: {
                name: {
                  description: "Confluent Kafka",
                  type: "string",
                  default: "confluent-kafka"
                }
              }
            }
          }
        }
      });

      it("returns activeTab and focusField", () => {
        expect(getFirstTabAndField(packageDetails)).toEqual({
          activeTab: "service",
          focusField: "name"
        });
      });
    });

    describe("with invalid schema", () => {
      const packageDetails = new UniversePackage({
        config: {
          type: "object"
        }
      });

      it("does not throw", () => {
        expect(() => {
          getFirstTabAndField(packageDetails);
        }).not.toThrow();
      });

      it("returns empty Object", () => {
        expect(getFirstTabAndField(packageDetails)).toEqual({});
      });
    });
  });
});
