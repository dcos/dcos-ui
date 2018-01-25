const MarathonAppValidators = require("../MarathonAppValidators");
const {
  PROP_MISSING_ONE,
  SYNTAX_ERROR
} = require("../../constants/ServiceErrorTypes");

const APPCONTAINERID_ERRORS = [
  {
    path: ["container", "appc", "id"],
    message: "AppContainer id should start with 'sha512-'",
    type: "STRING_PATTERN",
    variables: {
      pattern: "^sha512-"
    }
  }
];
const CMDORDOCKERIMAGE_ERRORS = [
  {
    path: ["cmd"],
    message: "You must specify a command, an argument or a container",
    type: "PROP_MISSING_ONE",
    variables: {
      names: "cmd, args, container.docker.image"
    }
  },
  {
    path: ["args"],
    message: "You must specify a command, an argument or a container",
    type: "PROP_MISSING_ONE",
    variables: {
      names: "cmd, args, container.docker.image"
    }
  },
  {
    path: ["container", "docker", "image"],
    message: "You must specify a command, an argument or a container",
    type: "PROP_MISSING_ONE",
    variables: {
      names: "cmd, args, container.docker.image"
    }
  }
];

const MUSTCONTAINIMAGEONDOCKER_ERRORS = [
  {
    path: ["container", "docker", "image"],
    message: 'Must be specified when using the Docker Engine runtime. You can change runtimes under "Advanced Settings"',
    type: "PROP_IS_MISSING",
    variables: {}
  }
];

const NOTBOTHCMDARGS_ERRORS = [
  {
    path: ["cmd"],
    message: "Please specify only one of `cmd` or `args`",
    type: "PROP_CONFLICT",
    variables: {
      feature1: "cmd",
      feature2: "args"
    }
  },
  {
    path: ["args"],
    message: "Please specify only one of `cmd` or `args`",
    type: "PROP_CONFLICT",
    variables: {
      feature1: "cmd",
      feature2: "args"
    }
  }
];

describe("MarathonAppValidators", function() {
  describe("#containsCmdArgsOrContainer", function() {
    it("returns no errors if `cmd` defined", function() {
      const spec = { cmd: "foo" };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        []
      );
    });

    it("returns no errors if `args` defined", function() {
      const spec = { args: ["foo"] };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        []
      );
    });

    it("returns no errors if `container.docker.image` defined", function() {
      const spec = { container: { docker: { image: "foo" } } };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        []
      );
    });

    it("returns no errors if `container.appc.image` defined", function() {
      const spec = { container: { appc: { image: "foo" } } };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        []
      );
    });

    it("returns error if both `args` and `cmd` are defined", function() {
      const spec = { args: ["foo"], cmd: "bar" };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        NOTBOTHCMDARGS_ERRORS
      );
    });

    it("returns all errors if neither is defined", function() {
      const spec = {};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        CMDORDOCKERIMAGE_ERRORS
      );
    });

    it("returns errors if `cmd` is null", function() {
      const spec = { cmd: null };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        CMDORDOCKERIMAGE_ERRORS
      );
    });

    it("returns errors if `cmd` is {}", function() {
      const spec = { cmd: {} };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        CMDORDOCKERIMAGE_ERRORS
      );
    });

    it("returns errors if `cmd` is []", function() {
      const spec = { cmd: [] };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        CMDORDOCKERIMAGE_ERRORS
      );
    });

    it("returns errors if `cmd` is empty string", function() {
      const spec = { cmd: "" };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        CMDORDOCKERIMAGE_ERRORS
      );
    });

    it("returns errors if `container` is empty", function() {
      const spec = { container: {} };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        CMDORDOCKERIMAGE_ERRORS
      );
    });

    it("returns errors if `container.docker` is empty", function() {
      const spec = { container: { docker: {} } };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        CMDORDOCKERIMAGE_ERRORS
      );
    });

    it("returns errors if `container.appc` is empty", function() {
      const spec = { container: { appc: {} } };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        CMDORDOCKERIMAGE_ERRORS
      );
    });

    it('returns errors if `container.appc.id` does not start with "sha512-"', function() {
      const spec = { container: { appc: { image: "foo", id: "sha256-test" } } };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        APPCONTAINERID_ERRORS
      );
    });

    it("does not return errors if `container.appc` correctly defined", function() {
      const spec = { container: { appc: { image: "foo", id: "sha512-test" } } };
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual(
        []
      );
    });
  });

  describe("#mustContainImageOnDocker", function() {
    it("returns error if runtime is docker but image is missing", function() {
      const spec = {
        container: {
          type: "DOCKER"
        }
      };
      expect(MarathonAppValidators.mustContainImageOnDocker(spec)).toEqual(
        MUSTCONTAINIMAGEONDOCKER_ERRORS
      );
    });

    it("does not return error if runtime is not docker and image is missing", function() {
      const spec = {
        container: {
          type: "MESOS"
        }
      };
      expect(MarathonAppValidators.mustContainImageOnDocker(spec)).toEqual([]);
    });

    it("does not return error if runtime docker and image is specified", function() {
      const spec = {
        container: {
          type: "DOCKER",
          docker: {
            image: "foo"
          }
        }
      };
      expect(MarathonAppValidators.mustContainImageOnDocker(spec)).toEqual([]);
    });
  });

  describe("#validateConstraints", function() {
    it("returns no errors when there is no constraints", function() {
      expect(MarathonAppValidators.validateConstraints({})).toEqual([]);
    });

    it("returns no errors when all constraints are correctly defined", function() {
      const spec = {
        constraints: [["hostname", "UNIQUE"], ["CPUS", "MAX_PER", "123"]]
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([]);
    });

    it("returns an error when constraints is not an array", function() {
      const spec = {
        constraints: ":)"
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([
        {
          path: ["constraints"],
          message: "constraints needs to be an array of 2 or 3 element arrays",
          type: "TYPE_NOT_ARRAY"
        }
      ]);
    });

    it("returns an error when a constraint is not an array", function() {
      const spec = {
        constraints: [":)"]
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([
        {
          path: ["constraints", 0],
          message: "Must be an array",
          type: "TYPE_NOT_ARRAY"
        }
      ]);
    });

    it("returns an error when a constraint definition is wrong", function() {
      const spec = {
        constraints: [["CPUS", "LIKE"]]
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([
        {
          path: ["constraints", 0, "value"],
          message: "You must specify a value for operator LIKE",
          type: PROP_MISSING_ONE,
          variables: { name: "value" }
        }
      ]);
    });

    it("returns an error when empty parameter is required", function() {
      const spec = {
        constraints: [["CPUS", "UNIQUE", "foo"]]
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([
        {
          path: ["constraints", 0, "value"],
          message: "Value must be empty for operator UNIQUE",
          type: SYNTAX_ERROR,
          variables: { name: "value" }
        }
      ]);
    });

    it("returns an error when wrong characters are applied", function() {
      const spec = {
        constraints: [["CPUS", "GROUP_BY", "2foo"]]
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([
        {
          path: ["constraints", 0, "value"],
          message: "Must only contain characters between 0-9 for operator GROUP_BY",
          type: SYNTAX_ERROR,
          variables: { name: "value" }
        }
      ]);
    });

    it("doesn't return an error for empty optional fields", function() {
      const spec = {
        constraints: [["hostname", "GROUP_BY"]]
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([]);
    });

    it("returns an error when wrong characters are applied", function() {
      const spec = {
        constraints: [["CPUS", "MAX_PER", "foo"]]
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([
        {
          path: ["constraints", 0, "value"],
          message: "Must only contain characters between 0-9 for operator MAX_PER",
          type: SYNTAX_ERROR,
          variables: { name: "value" }
        }
      ]);
    });

    it("accepts number strings for number-string fields", function() {
      const spec = {
        constraints: [["CPUS", "MAX_PER", "2"]]
      };
      expect(MarathonAppValidators.validateConstraints(spec)).toEqual([]);
    });
  });

  describe("#validateLabels", function() {
    it("does not return error if labels are not specified", function() {
      const spec = {};
      expect(MarathonAppValidators.validateLabels(spec)).toEqual([]);
    });

    it("does not return error if label keys do not start or end with spaces", function() {
      const spec = {
        labels: {
          foo: "bar",
          bar: "baz"
        }
      };
      expect(MarathonAppValidators.validateLabels(spec)).toEqual([]);
    });

    it("returns errors if any label key starts with a space", function() {
      const spec = {
        labels: {
          " foo": "bar",
          bar: "baz"
        }
      };
      expect(MarathonAppValidators.validateLabels(spec)).toEqual([
        {
          message: "Keys must not start or end with whitespace characters",
          path: ["labels. foo"],
          type: SYNTAX_ERROR,
          variables: {
            name: "labels"
          }
        }
      ]);
    });

    it("returns errors if any label key ends with a space", function() {
      const spec = {
        labels: {
          "foo ": "bar",
          bar: "baz"
        }
      };
      expect(MarathonAppValidators.validateLabels(spec)).toEqual([
        {
          message: "Keys must not start or end with whitespace characters",
          path: ["labels.foo "],
          type: SYNTAX_ERROR,
          variables: {
            name: "labels"
          }
        }
      ]);
    });
  });
});
