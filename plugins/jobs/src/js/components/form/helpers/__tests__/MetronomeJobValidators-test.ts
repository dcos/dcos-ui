import {
  MetronomeSpecValidators,
  validateSpec,
  constraintsAreComplete,
} from "../MetronomeJobValidators";
import { JobOutput } from "../JobFormData";

const JOBID_ERRORS = [
  {
    path: ["id"],
    message:
      "ID must be at least 1 character and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash",
  },
];
const CMDARGSERROR = [
  {
    path: ["run", "cmd"],
    message: "Please specify only one of `cmd` or `args`",
  },
  {
    path: ["run", "args"],
    message: "Please specify only one of `cmd` or `args`",
  },
];

const CMDARGSCONTAINERERROR = [
  {
    path: ["run", "cmd"],
    message:
      "You must specify a command, an argument or a container with an image",
  },
  {
    path: ["run", "args"],
    message:
      "You must specify a command, an argument or a container with an image",
  },
  {
    path: [],
    message:
      "You must specify a command, an argument or a container with an image",
  },
];

const MUSTCONTAINIMAGEFORDOCKER = [
  {
    path: ["run", "docker", "image"],
    message: "Must be specified when using the Docker Engine runtime",
  },
];

const MUSTCONTAINIMAGEFORUCR = [
  {
    path: ["run", "ucr", "image", "id"],
    message: "Must be specified when using UCR",
  },
];

const GPUSERROR = [
  {
    path: ["run", "gpus"],
    message: "GPUs are only available with UCR",
  },
];

const CPURANGEERROR = [
  {
    path: ["run", "cpus"],
    message: "Minimum value is 0.01",
  },
];

const MEMRANGEERROR = [
  {
    path: ["run", "mem"],
    message: "Minimum value is 32",
  },
];

const DISKRANGEERROR = [
  {
    path: ["run", "disk"],
    message: "Minimum value is 0",
  },
];

const GPURANGEERROR = [
  {
    path: ["run", "gpus"],
    message: "Minimum value is 0",
  },
];

const EMPTYARGGERROR = [
  {
    path: ["run", "args", "0"],
    message: "Arg cannot be empty",
  },
];

const ARGSWITHOUTDOCKERERROR = [
  {
    path: ["run", "args"],
    message: "Args can only be used with Docker",
  },
];

const UCRANDDOCKERERROR = [
  {
    path: ["run", "docker"],
    message: "Only one of UCR or Docker is allowed",
  },
  {
    path: ["run", "ucr"],
    message: "Only one of UCR or Docker is allowed",
  },
];

const SCHEDULEIDERROR = [
  {
    path: ["schedules", "0", "id"],
    message: "ID is required",
  },
];

const SCHEDULEIDREGEXERROR = [
  {
    path: ["schedules", "0", "id"],
    message:
      "ID must be at least 2 characters and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash",
  },
];

const CRONERROR = [
  {
    path: ["schedules", "0", "cron"],
    message: "CRON schedule is required",
  },
];

const STARTINGDEADLINETYPEERROR = [
  {
    path: ["schedules", "0", "startingDeadlineSeconds"],
    message: "Starting deadline must be a number",
  },
];

const STARTINGDEADLINEVALUEERROR = [
  {
    path: ["schedules", "0", "startingDeadlineSeconds"],
    message: "Minimum value is 1",
  },
];

const validJobSpec = (): JobOutput => ({
  id: "id",
  run: {
    cpus: 1,
    mem: 128,
    disk: 32,
  },
});

describe("MetronomeSpecValidators", () => {
  describe("#jobIdIsValid", () => {
    it("returns error if id is not a string", () => {
      const spec: any = validJobSpec();
      spec.id = 123;

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        path: ["id"],
        message: "Must be a string",
      });
    });

    it("returns error if id contains special characters", () => {
      const spec: any = validJobSpec();
      spec.id = "test$";

      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        JOBID_ERRORS
      );
    });

    it("returns error if id contains uppercase letters", () => {
      const spec = {
        id: "Test",
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        JOBID_ERRORS
      );
    });

    it("returns error if id starts with a dash", () => {
      const spec = {
        id: "-test",
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        JOBID_ERRORS
      );
    });

    it("returns error if id ends with a dash", () => {
      const spec = {
        id: "test-",
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        JOBID_ERRORS
      );
    });

    it("does not return error for id with lowercase letters and dashes", () => {
      const spec = {
        id: "test-1",
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        []
      );
    });
  });

  describe("#containsCmdArgsOrContainer", () => {
    it("returns no errors if `cmd` defined", () => {
      const spec = {
        run: {
          cmd: "sleep 100",
        },
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns no errors if `args` defined", () => {
      const spec = {
        run: {
          args: ["sleep 100"],
        },
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns no errors if `run.docker.image` defined", () => {
      const spec = {
        run: {
          docker: {
            image: "foo",
          },
        },
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns no errors if `run.ucr.image.id` defined", () => {
      const spec = {
        run: {
          ucr: {
            image: {
              id: "foo",
            },
          },
        },
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if both `args` and `cmd` are defined", () => {
      const spec = {
        run: {
          args: ["sleep 100"],
          cmd: "sleep 100",
        },
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual(CMDARGSERROR);
    });

    it("returns all errors if neither is defined", () => {
      const spec = { run: {} };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual(CMDARGSCONTAINERERROR);
    });
  });

  describe("#mustContainImageOnDockerOrUCR", () => {
    it("returns error if runtime is docker but image is missing", () => {
      const spec = {
        run: {
          docker: {},
        },
      };
      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual(MUSTCONTAINIMAGEFORDOCKER);
    });

    it("returns an error if docker is present but is not an object", () => {
      const spec: any = validJobSpec();
      spec.run.docker = "not an object";
      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be an object",
        path: ["run", "docker"],
      });
    });

    it("returns an error if ucr is present but is not an object", () => {
      const spec: any = validJobSpec();
      spec.run.ucr = "not an object";

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be an object",
        path: ["run", "ucr"],
      });
    });

    it("does not return error if runtime docker and image is specified", () => {
      const spec: any = validJobSpec();
      spec.run.docker = { image: "foo" };
      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec)
      ).toEqual([]);
    });

    it("returns error if runtime is ucr but image is missing", () => {
      const spec: any = validJobSpec();
      spec.run.ucr = {};

      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual(MUSTCONTAINIMAGEFORUCR);
    });

    it("returns error if runtime is ucr but image.id is missing", () => {
      const spec: any = validJobSpec();
      spec.run.ucr = { image: {} };

      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual(MUSTCONTAINIMAGEFORUCR);
    });

    it("does not return error if runtime is ucr and image.id is specified", () => {
      const spec: any = validJobSpec();
      spec.run.ucr = { image: { id: "foo" } };

      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual([]);
    });
  });

  describe("#gpusOnlyWithUCR", () => {
    it("returns no errors when gpus are used with ucr", () => {
      const spec = {
        run: {
          gpus: 0,
          ucr: {
            image: {
              id: "foo",
            },
          },
        },
      };
      expect(
        MetronomeSpecValidators.gpusOnlyWithUCR(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error when gpus are used with docker", () => {
      const spec = {
        run: {
          gpus: 0,
          docker: {
            image: "foo",
          },
        },
      };
      expect(
        MetronomeSpecValidators.gpusOnlyWithUCR(spec as JobOutput)
      ).toEqual(GPUSERROR);
    });

    it("does not return error when gpus are used without explicit container", () => {
      const spec = {
        run: {
          gpus: 0,
        },
      };
      expect(
        MetronomeSpecValidators.gpusOnlyWithUCR(spec as JobOutput)
      ).toEqual([]);
    });
  });

  describe("#validate", () => {
    it("does not return error if base required fields are all specified", () => {
      const spec = validJobSpec();
      expect(MetronomeSpecValidators.validate(spec)).toEqual([]);
    });

    it("returns error if id is not specified", () => {
      const spec = validJobSpec();
      delete spec.id;
      expect(MetronomeSpecValidators.validate(spec)).toEqual([
        { message: "Must be present", path: ["id"] },
      ]);
    });

    it("returns error if cpus is not specified", () => {
      const spec = validJobSpec();
      delete spec.run.cpus;
      expect(MetronomeSpecValidators.validate(spec)).toEqual([
        { message: "Must be present", path: ["run", "cpus"] },
      ]);
    });

    it("returns error if mem is not specified", () => {
      const spec = validJobSpec();
      delete spec.run.mem;
      expect(MetronomeSpecValidators.validate(spec)).toEqual([
        { message: "Must be present", path: ["run", "mem"] },
      ]);
    });

    it("returns error if disk is not specified", () => {
      const spec = validJobSpec();
      delete spec.run.disk;
      expect(MetronomeSpecValidators.validate(spec)).toEqual([
        { message: "Must be present", path: ["run", "disk"] },
      ]);
    });

    it("returns all errors if no base required fields are specified", () => {
      const spec = { run: {} };

      expect(MetronomeSpecValidators.validate(spec as any)).toEqual([
        { message: "Must be present", path: ["id"] },
        { message: "Must be present", path: ["run", "cpus"] },
        { message: "Must be present", path: ["run", "disk"] },
        { message: "Must be present", path: ["run", "mem"] },
      ]);
    });
  });

  describe("#valuesAreWithinRange", () => {
    it("does not return error if values are all within acceptable range", () => {
      const spec = {
        id: "id",
        run: {
          cpus: 1,
          mem: 32,
          disk: 0,
        },
      };
      expect(MetronomeSpecValidators.valuesAreWithinRange(spec)).toEqual([]);
    });

    it("returns error if cpus is not within range", () => {
      const spec = {
        run: {
          cpus: 0,
        },
      };
      expect(
        MetronomeSpecValidators.valuesAreWithinRange(spec as JobOutput)
      ).toEqual(CPURANGEERROR);
    });

    it("returns error if mem is not within range", () => {
      const spec = {
        run: {
          mem: 0,
        },
      };
      expect(
        MetronomeSpecValidators.valuesAreWithinRange(spec as JobOutput)
      ).toEqual(MEMRANGEERROR);
    });

    it("returns error if disk is not within range", () => {
      const spec = {
        run: {
          disk: -1,
        },
      };
      expect(
        MetronomeSpecValidators.valuesAreWithinRange(spec as JobOutput)
      ).toEqual(DISKRANGEERROR);
    });

    it("returns all errors if no base required fields are specified", () => {
      const spec = {
        run: {
          disk: -1,
          cpus: 0,
          mem: 0,
        },
      };
      expect(
        MetronomeSpecValidators.valuesAreWithinRange(spec as JobOutput)
      ).toEqual([...CPURANGEERROR, ...MEMRANGEERROR, ...DISKRANGEERROR]);
    });
  });

  describe("#gpusWithinRange", () => {
    it("does not return error if gpus >= 0", () => {
      const spec = {
        id: "id",
        run: {
          gpus: 0,
        },
      };
      expect(
        MetronomeSpecValidators.gpusWithinRange(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if gpus not present", () => {
      const spec = {
        id: "id",
        run: {},
      };
      expect(
        MetronomeSpecValidators.gpusWithinRange(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if gpus < 0", () => {
      const spec = {
        run: {
          gpus: -1,
        },
      };
      expect(
        MetronomeSpecValidators.gpusWithinRange(spec as JobOutput)
      ).toEqual(GPURANGEERROR);
    });
  });

  describe("#parametersHaveStringKeyAndValue", () => {
    it("does not return error if parameters have both key and value", () => {
      const spec = validJobSpec();
      spec.run.docker = {
        image: "",
        parameters: [{ key: "key", value: "value" }],
      };
      expect(MetronomeSpecValidators.validate(spec)).toEqual([]);
    });

    it("does not return error if there are no parameters", () => {
      const spec = validJobSpec();
      spec.run.docker = undefined;
      expect(MetronomeSpecValidators.validate(spec)).toEqual([]);
    });

    it("does not return error if parameters are an empty array", () => {
      const spec = {
        id: "id",
        run: {
          docker: {
            parameters: [],
          },
        },
      };

      expect(MetronomeSpecValidators.validate(spec as any)).not.toContainEqual({
        message: "Must be present",
        path: ["run", "docker", "parameters", "0", "value"],
      });
    });

    it("returns error if a parameters has an empty key", () => {
      const spec = {
        id: "id",
        run: {
          docker: {
            parameters: [
              {
                key: "",
                value: "value",
              },
            ],
          },
        },
      };
      expect(
        MetronomeSpecValidators.validate(spec as JobOutput)
      ).toContainEqual({
        message: "Must be present",
        path: ["run", "docker", "parameters", "0", "key"],
      });
    });

    it("returns error if a parameters has an empty value", () => {
      const spec = {
        id: "id",
        run: {
          docker: {
            parameters: [
              {
                key: "key",
                value: "",
              },
            ],
          },
        },
      };

      expect(
        MetronomeSpecValidators.validate(spec as JobOutput)
      ).toContainEqual({
        message: "Must be present",
        path: ["run", "docker", "parameters", "0", "value"],
      });
    });
  });

  describe("#noEmptyArgs", () => {
    it("does not return error if no args are empty", () => {
      const spec = {
        id: "id",
        run: {
          args: ["arg"],
        },
      };
      expect(MetronomeSpecValidators.noEmptyArgs(spec as JobOutput)).toEqual(
        []
      );
    });

    it("does not return error if there are no args", () => {
      const spec = {
        id: "id",
        run: {},
      };
      expect(MetronomeSpecValidators.noEmptyArgs(spec as JobOutput)).toEqual(
        []
      );
    });

    it("returns error if an arg is an empty string", () => {
      const spec = {
        id: "id",
        run: {
          args: [""],
        },
      };
      expect(MetronomeSpecValidators.noEmptyArgs(spec as JobOutput)).toEqual(
        EMPTYARGGERROR
      );
    });
  });

  describe("#argsUsedOnlyWithDocker", () => {
    it("does not return error if args are used with docker", () => {
      const spec = {
        id: "id",
        run: {
          args: [],
          docker: {},
        },
      };
      expect(
        MetronomeSpecValidators.argsUsedOnlyWithDocker(spec as any)
      ).toEqual([]);
    });

    it("does not return error if there are no args", () => {
      const spec = {
        id: "id",
        run: {},
      };
      expect(
        MetronomeSpecValidators.argsUsedOnlyWithDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if args are used without docker", () => {
      const spec = {
        id: "id",
        run: {
          args: ["arg"],
        },
      };
      expect(
        MetronomeSpecValidators.argsUsedOnlyWithDocker(spec as JobOutput)
      ).toEqual(ARGSWITHOUTDOCKERERROR);
    });
  });

  describe("#oneOfUcrOrDocker", () => {
    it("does not return error if neither docker or ucr are present", () => {
      const spec = {
        id: "id",
        run: {
          cmd: "cmd",
        },
      };
      expect(
        MetronomeSpecValidators.oneOfUcrOrDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if only ucr is present", () => {
      const spec = {
        id: "id",
        run: {
          ucr: {},
        },
      };
      expect(
        MetronomeSpecValidators.oneOfUcrOrDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if only docker is present", () => {
      const spec = {
        id: "id",
        run: {
          docker: {},
        },
      };
      expect(
        MetronomeSpecValidators.oneOfUcrOrDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if both ucr and docker are present", () => {
      const spec = {
        id: "id",
        run: {
          docker: {},
          ucr: {},
        },
      };
      expect(
        MetronomeSpecValidators.oneOfUcrOrDocker(spec as JobOutput)
      ).toEqual(UCRANDDOCKERERROR);
    });
  });

  describe("#noDuplicateParams", () => {
    it("does not return error if there are no params", () => {
      const spec = {
        id: "id",
        run: {
          docker: {},
        },
      };
      expect(
        MetronomeSpecValidators.noDuplicateParams(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if there is one param", () => {
      const spec = {
        id: "id",
        run: {
          docker: {
            parameters: [{ key: "key", value: "value" }],
          },
        },
      };
      expect(
        MetronomeSpecValidators.noDuplicateParams(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if there are no duplicate params", () => {
      const spec = {
        id: "id",
        run: {
          docker: {
            parameters: [
              { key: "key", value: "value" },
              { key: "key2", value: "value" },
            ],
          },
        },
      };
      expect(
        MetronomeSpecValidators.noDuplicateParams(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns an error if there are duplicate params", () => {
      const spec = {
        id: "id",
        run: {
          docker: {
            parameters: [
              { key: "key", value: "value" },
              { key: "key", value: "value" },
            ],
          },
        },
      };
      const errors = [
        {
          path: ["run", "docker", "parameters", "0"],
          message: "No duplicate parameters",
        },
        {
          path: ["run", "docker", "parameters", "1"],
          message: "No duplicate parameters",
        },
      ];
      expect(
        MetronomeSpecValidators.noDuplicateParams(spec as JobOutput)
      ).toEqual(errors);
    });
  });

  describe("#noDuplicateArgs", () => {
    it("does not return error if there are no args", () => {
      const spec = {
        id: "id",
        run: {},
      };
      expect(
        MetronomeSpecValidators.noDuplicateArgs(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if there is one param", () => {
      const spec = {
        id: "id",
        run: {
          args: ["arg"],
        },
      };
      expect(
        MetronomeSpecValidators.noDuplicateArgs(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if there are no duplicate params", () => {
      const spec = {
        id: "id",
        run: {
          args: ["arg1", "arg2"],
        },
      };
      expect(
        MetronomeSpecValidators.noDuplicateArgs(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns an error if there are duplicate params", () => {
      const spec = {
        id: "id",
        run: {
          args: ["arg", "arg"],
        },
      };
      const errors = [
        {
          path: ["run", "args", "0"],
          message: "No duplicate args",
        },
        {
          path: ["run", "args", "1"],
          message: "No duplicate args",
        },
      ];
      expect(
        MetronomeSpecValidators.noDuplicateArgs(spec as JobOutput)
      ).toEqual(errors);
    });
  });

  describe("#checkTypesOfJobRunProps", () => {
    it("returns error if cmd is not a string", () => {
      const spec = validJobSpec() as any;
      spec.run.cmd = 123;

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a string",
        path: ["run", "cmd"],
      });
    });

    it("returns error if cpus is not a number", () => {
      const spec = validJobSpec() as any;
      spec.run.cpus = "123";

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a number",
        path: ["run", "cpus"],
      });
    });

    it("returns error if disk is not a number", () => {
      const spec = validJobSpec() as any;
      spec.run.disk = "123";

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a number",
        path: ["run", "disk"],
      });
    });

    it("returns error if mem is not a number", () => {
      const spec = validJobSpec() as any;
      spec.run.mem = "123";

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a number",
        path: ["run", "mem"],
      });
    });
  });

  describe("#isString", () => {
    it("returns error if image is not a string", () => {
      const spec = validJobSpec() as any;
      spec.run.docker = { image: 123 };

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a string",
        path: ["run", "docker", "image"],
      });
    });

    it("returns error if forcePullImage is not a boolean", () => {
      const spec = validJobSpec() as any;
      spec.run.docker = { forcePullImage: 123 };

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a boolean",
        path: ["run", "docker", "forcePullImage"],
      });
    });

    it("returns error if privileged is not a boolean", () => {
      const spec = validJobSpec() as any;
      spec.run.docker = { privileged: 123 };

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a boolean",
        path: ["run", "docker", "privileged"],
      });
    });
  });

  describe("#checkTypesOfUcrProps", () => {
    it("does not return error if ucr properties have correc type", () => {
      const spec = {
        run: {
          ucr: {
            image: {
              id: "image",
              kind: "docker",
              forcePull: true,
            },
            privileged: false,
          },
        },
      };
      expect(MetronomeSpecValidators.checkTypesOfUcrProps(spec as any)).toEqual(
        []
      );
    });

    it("does not return error if no ucr", () => {
      const spec = {
        run: {},
      };
      expect(MetronomeSpecValidators.checkTypesOfUcrProps(spec as any)).toEqual(
        []
      );
    });

    it("returns error if image is not an object", () => {
      const spec = validJobSpec() as any;
      spec.run.ucr = { image: 123 };

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be an object",
        path: ["run", "ucr", "image"],
      });
    });

    it("returns error if privileged is not a boolean", () => {
      const spec = validJobSpec() as any;
      spec.run.ucr = { privileged: 123 };

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a boolean",
        path: ["run", "ucr", "privileged"],
      });
    });

    it("returns error if id is not a string", () => {
      const spec = validJobSpec() as any;
      spec.run.ucr = { image: { id: 123 } };

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a string",
        path: ["run", "ucr", "image", "id"],
      });
    });

    it("returns error if kind is not `docker` or `appc`", () => {
      const spec = {
        run: {
          ucr: {
            image: {
              kind: 123,
            },
          },
        },
      };
      expect(MetronomeSpecValidators.checkTypesOfUcrProps(spec as any)).toEqual(
        [
          {
            path: ["run", "ucr", "image", "kind"],
            message: "Image kind must be one of `docker` or `appc`",
          },
        ]
      );
    });

    it("returns error if forcePull is not a boolean", () => {
      const spec = validJobSpec() as any;
      spec.run.ucr = { image: { forcePull: 123 } };

      expect(MetronomeSpecValidators.validate(spec)).toContainEqual({
        message: "Must be a boolean",
        path: ["run", "ucr", "image", "forcePull"],
      });
    });
  });

  describe("#scheduleHasId", () => {
    it("does not return error if there is no schedule", () => {
      const spec = {
        id: "id",
        run: {
          cmd: "cmd",
        },
      };
      expect(MetronomeSpecValidators.scheduleHasId(spec as JobOutput)).toEqual(
        []
      );
    });

    it("returns error if schedule present without id", () => {
      const spec = {
        id: "id",
        run: {
          ucr: {},
        },
        schedules: [{}],
      };
      expect(MetronomeSpecValidators.scheduleHasId(spec as JobOutput)).toEqual(
        SCHEDULEIDERROR
      );
    });
  });

  describe("#scheduleIdIsValid", () => {
    it("does not return error if there is no schedule", () => {
      const spec = {
        id: "id",
        run: {
          cmd: "cmd",
        },
      };
      expect(
        MetronomeSpecValidators.scheduleIdIsValid(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if schedule id is invalid", () => {
      const spec = {
        id: "-id",
        run: {
          ucr: {},
        },
        schedules: [{}],
      };
      expect(
        MetronomeSpecValidators.scheduleIdIsValid(spec as JobOutput)
      ).toEqual(SCHEDULEIDREGEXERROR);
    });
  });

  describe("#scheduleHasCron", () => {
    it("does not return error if there is no schedule", () => {
      const spec = {
        id: "id",
        run: {
          cmd: "cmd",
        },
      };
      expect(
        MetronomeSpecValidators.scheduleHasCron(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if schedule is present without cron", () => {
      const spec = {
        id: "-id",
        run: {
          ucr: {},
        },
        schedules: [{}],
      };
      expect(
        MetronomeSpecValidators.scheduleHasCron(spec as JobOutput)
      ).toEqual(CRONERROR);
    });
  });

  describe("#scheduleStartingDeadlineIsValid", () => {
    it("does not return error if there is no schedule", () => {
      const spec = {
        id: "id",
        run: {
          cmd: "cmd",
        },
      };
      expect(
        MetronomeSpecValidators.scheduleStartingDeadlineIsValid(
          spec as JobOutput
        )
      ).toEqual([]);
    });

    it("does not return error if starting deadline is number > 0", () => {
      const spec = {
        id: "id",
        run: {
          cmd: "cmd",
        },
        schedules: [
          {
            startingDeadlineSeconds: 1,
          },
        ],
      };
      expect(
        MetronomeSpecValidators.scheduleStartingDeadlineIsValid(
          spec as JobOutput
        )
      ).toEqual([]);
    });

    it("returns error if starting deadline is number less than 1", () => {
      const spec = {
        id: "-id",
        run: {
          ucr: {},
        },
        schedules: [
          {
            startingDeadlineSeconds: 0,
          },
        ],
      };
      expect(
        MetronomeSpecValidators.scheduleStartingDeadlineIsValid(
          spec as JobOutput
        )
      ).toEqual(STARTINGDEADLINEVALUEERROR);
    });

    it("returns error if starting deadline is not a number", () => {
      const spec = {
        id: "-id",
        run: {
          ucr: {},
        },
        schedules: [
          {
            startingDeadlineSeconds: "not a number",
          },
        ],
      };
      expect(
        MetronomeSpecValidators.scheduleStartingDeadlineIsValid(spec as any)
      ).toEqual(STARTINGDEADLINETYPEERROR);
    });
  });

  describe("#constraintsAreArray", () => {
    it("does not return error if constraints are array", () => {
      const spec = {
        job: {
          run: {
            placement: {
              constraints: [],
            },
          },
        },
      };
      expect(MetronomeSpecValidators.constraintsAreArray(spec as any)).toEqual(
        []
      );
    });

    it("does not return error if no constraints present", () => {
      const spec = {
        job: {
          run: {
            placement: {},
          },
        },
      };
      expect(MetronomeSpecValidators.constraintsAreArray(spec as any)).toEqual(
        []
      );
    });

    it("does not return error if no placement present", () => {
      const spec = {
        job: {
          run: {},
        },
      };
      expect(MetronomeSpecValidators.constraintsAreArray(spec as any)).toEqual(
        []
      );
    });

    it("returns error if constraints are not an array", () => {
      const spec = {
        job: {
          run: {
            placement: {
              constraints: {},
            },
          },
        },
      };
      expect(MetronomeSpecValidators.constraintsAreArray(spec as any)).toEqual([
        {
          path: ["run", "placement", "constraints"],
          message: "Constraints must be an array",
        },
      ]);
    });
  });
});

describe("#constraintsAreComplete", () => {
  it("does not return error if no constraints present", () => {
    const spec = {
      job: {
        run: {
          placement: {},
        },
      },
    };
    expect(constraintsAreComplete(spec as any)).toEqual([]);
  });

  it("does not return error if no placement present", () => {
    const spec = {
      job: {
        run: {},
      },
    };
    expect(constraintsAreComplete(spec as any)).toEqual([]);
  });

  it("does not return error if constraints are complete", () => {
    const spec = {
      job: {
        run: {
          placement: {
            constraints: [
              {
                attribute: "a",
                operator: "IS",
                value: "c",
              },
            ],
          },
        },
      },
    };
    expect(constraintsAreComplete(spec as any)).toEqual([]);
  });

  it("returns error if value is required and missing", () => {
    const spec = {
      job: {
        run: {
          placement: {
            constraints: [
              {
                attribute: "a",
                operator: "IS",
              },
            ],
          },
        },
      },
    };
    expect(constraintsAreComplete(spec as any)).toEqual([
      {
        path: ["run", "placement", "constraints", "0", "value"],
        message: "Value is required",
      },
    ]);
  });

  it("returns error if attribute is missing", () => {
    const spec = {
      job: {
        run: {
          placement: {
            constraints: [
              {
                operator: "IS",
                value: "b",
              },
            ],
          },
        },
      },
    };
    expect(constraintsAreComplete(spec as any)).toEqual([
      {
        path: ["run", "placement", "constraints", "0", "attribute"],
        message: "Field is required",
      },
    ]);
  });

  it("returns error if operator is missing", () => {
    const spec = {
      job: {
        run: {
          placement: {
            constraints: [
              {
                value: "b",
                attribute: "a",
              },
            ],
          },
        },
      },
    };
    expect(constraintsAreComplete(spec as any)).toEqual([
      {
        path: ["run", "placement", "constraints", "0", "operator"],
        message: "Operator is required",
      },
    ]);
  });
});

describe("validateSpec", () => {
  describe("for labels", () => {
    it("does not return error if labels are not present", () => {
      const spec = { job: {} };

      expect(validateSpec(spec as any)).toEqual([]);
    });

    it("does not return error if labels contain no duplicate keys", () => {
      const spec = {
        job: {
          labels: [
            ["a", "b"],
            ["c", "d"],
          ],
        },
      };

      expect(validateSpec(spec as any)).toEqual([]);
    });

    it("returns error if labels contain duplicate keys", () => {
      const spec = {
        job: {
          labels: [
            ["a", "b"],
            ["a", "d"],
          ],
        },
      };
      const message = "Cannot have multiple labels with the same key";

      expect(validateSpec(spec as any)).toEqual([
        { path: ["labels"], message },
        { path: ["labels", "0"], message },
        { path: ["labels", "1"], message },
      ]);
    });
  });
  describe("for env vars", () => {
    it("does not return error if vars are not present", () => {
      const spec = { job: {} };

      expect(validateSpec(spec as any)).toEqual([]);
    });

    it("does not return error if env vars contain no duplicate keys", () => {
      const spec = {
        job: {
          run: {
            env: [
              ["a", "b"],
              ["c", "d"],
            ],
          },
        },
      };

      expect(validateSpec(spec as any)).toEqual([]);
    });

    it("returns error if env vars contain duplicate keys", () => {
      const spec = {
        job: {
          run: {
            env: [
              ["a", "b"],
              ["a", "d"],
            ],
          },
        },
      };
      const message =
        "Cannot have multiple environment variables with the same key";

      expect(validateSpec(spec as any)).toEqual([
        { path: ["run", "env", "0"], message },
        { path: ["run", "env", "1"], message },
      ]);
    });
  });
});
