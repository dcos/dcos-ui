jest.dontMock("../ContainerValidatorUtil");

const ContainerValidatorUtil = require("../ContainerValidatorUtil");

describe("ContainerValidatorUtil", function() {
  describe("#isValidDockerImage", function() {
    it("should properly handle empty strings", function() {
      expect(ContainerValidatorUtil.isValidDockerImage("")).toBe(false);
    });

    it("should properly handle undefined values", function() {
      expect(ContainerValidatorUtil.isValidDockerImage()).toBe(false);
    });

    it("should properly handle white spaces", function() {
      expect(ContainerValidatorUtil.isValidDockerImage("white space")).toBe(
        false
      );
    });

    it("should verify that the images are well-formed", function() {
      expect(
        ContainerValidatorUtil.isValidDockerImage("docker/image-name")
      ).toBe(true);
      expect(
        ContainerValidatorUtil.isValidDockerImage("docker/imageName:latest")
      ).toBe(true);
      expect(
        ContainerValidatorUtil.isValidDockerImage(
          "docker/image-name:v1.2.0-RC5"
        )
      ).toBe(true);
      expect(
        ContainerValidatorUtil.isValidDockerImage(
          "docker/Image_name:v1.2.0-RC5"
        )
      ).toBe(true);
    });
  });
});
