import { MetronomeSpecValidators } from "../MetronomeJobValidators";
import { JobOutput } from "../JobFormData";

const JOBID_ERRORS = [
  {
    path: ["job", "id"],
    message:
      "ID must be at least 1 character and may only contain digits (`0-9`), dashes (`-`), and lowercase letters (`a-z`). The ID may not begin or end with a dash."
  }
];
const CMDARGSERROR = [
  {
    path: ["job", "run", "cmd"],
    message: "Please specify only one of `cmd` or `args`."
  },
  {
    path: ["job", "run", "args"],
    message: "Please specify only one of `cmd` or `args`."
  }
];

const CMDARGSCONTAINERERROR = [
  {
    path: ["job", "run", "cmd"],
    message:
      "You must specify a command, an argument or a container with an image."
  },
  {
    path: ["job", "run", "args"],
    message:
      "You must specify a command, an argument or a container with an image."
  },
  {
    path: [],
    message:
      "You must specify a command, an argument or a container with an image."
  }
];

const MUSTCONTAINIMAGEFORDOCKER = [
  {
    path: ["job", "run", "docker", "image"],
    message: "Must be specified when using the Docker Engine runtime."
  }
];

const MUSTCONTAINIMAGEFORUCR = [
  {
    path: ["job", "run", "ucr", "image", "id"],
    message: "Must be specified when using UCR."
  }
];

const GPUSERROR = [
  {
    path: ["job", "run", "gpus"],
    message: "GPUs are only available with UCR."
  }
];

const IDMISSINGERROR = [
  {
    path: ["job", "id"],
    message: "ID is required."
  }
];

const CPUSMISSINGERROR = [
  {
    path: ["job", "run", "cpus"],
    message: "CPUs is required."
  }
];

const DISKMISSINGERROR = [
  {
    path: ["job", "run", "disk"],
    message: "Disk is required."
  }
];

const MEMMISSINGERROR = [
  {
    path: ["job", "run", "mem"],
    message: "Mem is required."
  }
];

const CPURANGEERROR = [
  {
    path: ["job", "run", "cpus"],
    message: "Minimum value is 0.01."
  }
];

const MEMRANGEERROR = [
  {
    path: ["job", "run", "mem"],
    message: "Minimum value is 32."
  }
];

const DISKRANGEERROR = [
  {
    path: ["job", "run", "disk"],
    message: "Minimum value is 0."
  }
];

const GPURANGEERROR = [
  {
    path: ["job", "run", "gpus"],
    message: "Minimum value is 0."
  }
];

const PARAMEMPTYVALUEERROR = [
  {
    path: ["job", "run", "docker", "parameters", "0", "value"],
    message: "Value cannot be empty."
  }
];

const PARAMEMPTYKEYERROR = [
  {
    path: ["job", "run", "docker", "parameters", "0", "key"],
    message: "Key cannot be empty."
  }
];

const EMPTYARGGERROR = [
  {
    path: ["job", "run", "args", "0"],
    message: "Arg cannot be empty."
  }
];

const ARGSARRAYERROR = [
  {
    path: ["job", "run", "args"],
    message: "Args must be an array."
  }
];

const ARGSWITHOUTDOCKERERROR = [
  {
    path: ["job", "run", "args"],
    message: "Args can only be used with Docker."
  }
];

const UCRANDDOCKERERROR = [
  {
    path: ["job", "run", "docker"],
    message: "Only one of UCR or Docker is allowed."
  },
  {
    path: ["job", "run", "ucr"],
    message: "Only one of UCR or Docker is allowed."
  }
];

describe("MetronomeSpecValidators", () => {
  describe("#jobIdIsValid", () => {
    it("returns error if id contains special characters", () => {
      const spec = {
        job: {
          id: "test$"
        }
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        JOBID_ERRORS
      );
    });

    it("returns error if id contains uppercase letters", () => {
      const spec = {
        job: {
          id: "Test"
        }
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        JOBID_ERRORS
      );
    });

    it("returns error if id starts with a dash", () => {
      const spec = {
        job: {
          id: "-test"
        }
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        JOBID_ERRORS
      );
    });

    it("returns error if id ends with a dash", () => {
      const spec = {
        job: {
          id: "test-"
        }
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        JOBID_ERRORS
      );
    });

    it("does not return error for id with lowercase letters and dashes", () => {
      const spec = {
        job: {
          id: "test-1"
        }
      };
      expect(MetronomeSpecValidators.jobIdIsValid(spec as JobOutput)).toEqual(
        []
      );
    });
  });

  describe("#containsCmdArgsOrContainer", () => {
    it("returns no errors if `cmd` defined", () => {
      const spec = {
        job: {
          run: {
            cmd: "sleep 100"
          }
        }
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns no errors if `args` defined", () => {
      const spec = {
        job: {
          run: {
            args: ["sleep 100"]
          }
        }
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns no errors if `run.docker.image` defined", () => {
      const spec = {
        job: {
          run: {
            docker: {
              image: "foo"
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns no errors if `run.ucr.image.id` defined", () => {
      const spec = {
        job: {
          run: {
            ucr: {
              image: {
                id: "foo"
              }
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if both `args` and `cmd` are defined", () => {
      const spec = {
        job: {
          run: {
            args: ["sleep 100"],
            cmd: "sleep 100"
          }
        }
      };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual(CMDARGSERROR);
    });

    it("returns all errors if neither is defined", () => {
      const spec = { job: { run: {} } };
      expect(
        MetronomeSpecValidators.containsCmdArgsOrContainer(spec as JobOutput)
      ).toEqual(CMDARGSCONTAINERERROR);
    });
  });

  describe("#mustContainImageOnDockerOrUCR", () => {
    it("returns error if runtime is docker but image is missing", () => {
      const spec = {
        job: {
          run: {
            docker: {}
          }
        }
      };
      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual(MUSTCONTAINIMAGEFORDOCKER);
    });

    it("does not return error if runtime docker and image is specified", () => {
      const spec = {
        job: {
          run: {
            docker: {
              image: "foo"
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if runtime is ucr but image is missing", () => {
      const spec = {
        job: {
          run: {
            ucr: {}
          }
        }
      };
      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual(MUSTCONTAINIMAGEFORUCR);
    });

    it("returns error if runtime is ucr but image.id is missing", () => {
      const spec = {
        job: {
          run: {
            ucr: {
              image: {}
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual(MUSTCONTAINIMAGEFORUCR);
    });

    it("does not return error if runtime is ucr and image.id is specified", () => {
      const spec = {
        job: {
          run: {
            ucr: {
              image: {
                id: "foo"
              }
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.mustContainImageOnDockerOrUCR(spec as JobOutput)
      ).toEqual([]);
    });
  });

  describe("#gpusOnlyWithUCR", () => {
    it("returns no errors when gpus are used with ucr", () => {
      const spec = {
        job: {
          run: {
            gpus: 0,
            ucr: {
              image: {
                id: "foo"
              }
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.gpusOnlyWithUCR(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error when gpus are used with docker", () => {
      const spec = {
        job: {
          run: {
            gpus: 0,
            docker: {
              image: "foo"
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.gpusOnlyWithUCR(spec as JobOutput)
      ).toEqual(GPUSERROR);
    });

    it("returns error when gpus are used without docker or ucr", () => {
      const spec = {
        job: {
          run: {
            gpus: 0
          }
        }
      };
      expect(
        MetronomeSpecValidators.gpusOnlyWithUCR(spec as JobOutput)
      ).toEqual(GPUSERROR);
    });
  });

  describe("#hasMinimumRequiredFields", () => {
    it("does not return error if base required fields are all specified", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            cpus: 1,
            mem: 32,
            disk: 0
          }
        }
      };
      expect(MetronomeSpecValidators.hasMinimumRequiredFields(spec)).toEqual(
        []
      );
    });

    it("returns error if id is not specified", () => {
      const spec = {
        job: {
          run: {
            cpus: 1,
            mem: 32,
            disk: 0
          }
        }
      };
      expect(
        MetronomeSpecValidators.hasMinimumRequiredFields(spec as JobOutput)
      ).toEqual(IDMISSINGERROR);
    });

    it("returns error if cpus is not specified", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            mem: 32,
            disk: 0
          }
        }
      };
      expect(
        MetronomeSpecValidators.hasMinimumRequiredFields(spec as JobOutput)
      ).toEqual(CPUSMISSINGERROR);
    });

    it("returns error if mem is not specified", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            cpus: 1,
            disk: 0
          }
        }
      };
      expect(
        MetronomeSpecValidators.hasMinimumRequiredFields(spec as JobOutput)
      ).toEqual(MEMMISSINGERROR);
    });

    it("returns error if disk is not specified", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            cpus: 1,
            mem: 32
          }
        }
      };
      expect(
        MetronomeSpecValidators.hasMinimumRequiredFields(spec as JobOutput)
      ).toEqual(DISKMISSINGERROR);
    });

    it("returns all errors if no base required fields are specified", () => {
      const spec = {
        job: {
          run: {}
        }
      };
      expect(
        MetronomeSpecValidators.hasMinimumRequiredFields(spec as JobOutput)
      ).toEqual([
        ...IDMISSINGERROR,
        ...CPUSMISSINGERROR,
        ...MEMMISSINGERROR,
        ...DISKMISSINGERROR
      ]);
    });
  });

  describe("#valuesAreWithinRange", () => {
    it("does not return error if values are all within acceptable range", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            cpus: 1,
            mem: 32,
            disk: 0
          }
        }
      };
      expect(MetronomeSpecValidators.valuesAreWithinRange(spec)).toEqual([]);
    });

    it("returns error if cpus is not within range", () => {
      const spec = {
        job: {
          run: {
            cpus: 0
          }
        }
      };
      expect(
        MetronomeSpecValidators.valuesAreWithinRange(spec as JobOutput)
      ).toEqual(CPURANGEERROR);
    });

    it("returns error if mem is not within range", () => {
      const spec = {
        job: {
          run: {
            mem: 0
          }
        }
      };
      expect(
        MetronomeSpecValidators.valuesAreWithinRange(spec as JobOutput)
      ).toEqual(MEMRANGEERROR);
    });

    it("returns error if disk is not within range", () => {
      const spec = {
        job: {
          run: {
            disk: -1
          }
        }
      };
      expect(
        MetronomeSpecValidators.valuesAreWithinRange(spec as JobOutput)
      ).toEqual(DISKRANGEERROR);
    });

    it("returns all errors if no base required fields are specified", () => {
      const spec = {
        job: {
          run: {
            disk: -1,
            cpus: 0,
            mem: 0
          }
        }
      };
      expect(
        MetronomeSpecValidators.valuesAreWithinRange(spec as JobOutput)
      ).toEqual([...CPURANGEERROR, ...MEMRANGEERROR, ...DISKRANGEERROR]);
    });
  });

  describe("#gpusWithinRange", () => {
    it("does not return error if gpus >= 0", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            gpus: 0
          }
        }
      };
      expect(
        MetronomeSpecValidators.gpusWithinRange(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if gpus not present", () => {
      const spec = {
        job: {
          id: "id",
          run: {}
        }
      };
      expect(
        MetronomeSpecValidators.gpusWithinRange(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if gpus < 0", () => {
      const spec = {
        job: {
          run: {
            gpus: -1
          }
        }
      };
      expect(
        MetronomeSpecValidators.gpusWithinRange(spec as JobOutput)
      ).toEqual(GPURANGEERROR);
    });
  });

  describe("#parametersHaveKeyAndValue", () => {
    it("does not return error if parameters have both key and value", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            docker: {
              parameters: [
                {
                  key: "key",
                  value: "value"
                }
              ]
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.parametersHaveKeyAndValue(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if there are no parameters", () => {
      const spec = {
        job: {
          id: "id",
          run: {}
        }
      };
      expect(
        MetronomeSpecValidators.parametersHaveKeyAndValue(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if parameters are an empty array", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            docker: {
              parameters: []
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.parametersHaveKeyAndValue(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if a parameters has an empty key", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            docker: {
              parameters: [
                {
                  key: "",
                  value: "value"
                }
              ]
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.parametersHaveKeyAndValue(spec as JobOutput)
      ).toEqual(PARAMEMPTYKEYERROR);
    });

    it("returns error if a parameters has an empty value", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            docker: {
              parameters: [
                {
                  key: "key",
                  value: ""
                }
              ]
            }
          }
        }
      };
      expect(
        MetronomeSpecValidators.parametersHaveKeyAndValue(spec as JobOutput)
      ).toEqual(PARAMEMPTYVALUEERROR);
    });
  });

  describe("#noEmptyArgs", () => {
    it("does not return error if no args are empty", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            args: ["arg"]
          }
        }
      };
      expect(MetronomeSpecValidators.noEmptyArgs(spec as JobOutput)).toEqual(
        []
      );
    });

    it("does not return error if there are no args", () => {
      const spec = {
        job: {
          id: "id",
          run: {}
        }
      };
      expect(MetronomeSpecValidators.noEmptyArgs(spec as JobOutput)).toEqual(
        []
      );
    });

    it("returns error if an arg is an empty string", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            args: [""]
          }
        }
      };
      expect(MetronomeSpecValidators.noEmptyArgs(spec as JobOutput)).toEqual(
        EMPTYARGGERROR
      );
    });
  });

  describe("#argsAreArray", () => {
    it("does not return error if args are array", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            args: ["arg"]
          }
        }
      };
      expect(MetronomeSpecValidators.argsAreArray(spec as JobOutput)).toEqual(
        []
      );
    });

    it("does not return error if there are no args", () => {
      const spec = {
        job: {
          id: "id",
          run: {}
        }
      };
      expect(MetronomeSpecValidators.argsAreArray(spec as JobOutput)).toEqual(
        []
      );
    });

    it("returns error if args is not an array", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            args: "string"
          }
        }
      };
      expect(MetronomeSpecValidators.argsAreArray(spec as JobOutput)).toEqual(
        ARGSARRAYERROR
      );
    });
  });

  describe("#argsUsedOnlyWithDocker", () => {
    it("does not return error if args are used with docker", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            args: [],
            docker: {}
          }
        }
      };
      expect(
        MetronomeSpecValidators.argsUsedOnlyWithDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if there are no args", () => {
      const spec = {
        job: {
          id: "id",
          run: {}
        }
      };
      expect(
        MetronomeSpecValidators.argsUsedOnlyWithDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if args are used without docker", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            args: ["arg"]
          }
        }
      };
      expect(
        MetronomeSpecValidators.argsUsedOnlyWithDocker(spec as JobOutput)
      ).toEqual(ARGSWITHOUTDOCKERERROR);
    });
  });

  describe("#oneOfUcrOrDocker", () => {
    it("does not return error if neither docker or ucr are present", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            cmd: "cmd"
          }
        }
      };
      expect(
        MetronomeSpecValidators.oneOfUcrOrDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if only ucr is present", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            ucr: {}
          }
        }
      };
      expect(
        MetronomeSpecValidators.oneOfUcrOrDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("does not return error if only docker is present", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            docker: {}
          }
        }
      };
      expect(
        MetronomeSpecValidators.oneOfUcrOrDocker(spec as JobOutput)
      ).toEqual([]);
    });

    it("returns error if both ucr and docker are present", () => {
      const spec = {
        job: {
          id: "id",
          run: {
            docker: {},
            ucr: {}
          }
        }
      };
      expect(
        MetronomeSpecValidators.oneOfUcrOrDocker(spec as JobOutput)
      ).toEqual(UCRANDDOCKERERROR);
    });
  });
});
