import {
  jobSecretsReducers,
  jobResponseToSpec,
  jobJsonReducers,
  jobSpecToOutput
} from "../JobSecrets";

const Spec = () => ({
  job: {
    run: {
      secrets: [
        {
          exposureType: "envVar",
          exposureValue: "name",
          key: "secret0",
          secretPath: "secret"
        }
      ]
    }
  }
});
const passedReducerFn = jest.fn();

describe("JobSecrets", () => {
  describe("#jobSecretsReducers", () => {
    describe("SET", () => {
      it("sets the name of the correct secret", () => {
        const newName = "newname";
        expect(jobSecretsReducers.SET(newName, Spec(), ["name", 0])).toEqual({
          job: {
            run: {
              secrets: [
                {
                  exposureType: "envVar",
                  exposureValue: newName,
                  key: "secret0",
                  secretPath: "secret"
                }
              ]
            }
          }
        });
      });

      it("sets the name of the correct secret", () => {
        const newSecret = "newSecret";
        expect(
          jobSecretsReducers.SET(newSecret, Spec(), ["secret", 0])
        ).toEqual({
          job: {
            run: {
              secrets: [
                {
                  exposureType: "envVar",
                  exposureValue: "name",
                  key: "secret0",
                  secretPath: newSecret
                }
              ]
            }
          }
        });
      });
    });

    describe("ADD_ARRAY_ITEM", () => {
      it("adds an item to the secrets array", () => {
        expect(jobSecretsReducers.ADD_ARRAY_ITEM("", Spec())).toEqual({
          job: {
            run: {
              secrets: [
                {
                  exposureType: "envVar",
                  exposureValue: "name",
                  key: "secret0",
                  secretPath: "secret"
                },
                {
                  exposureType: "",
                  exposureValue: "",
                  key: "secret1",
                  secretPath: ""
                }
              ]
            }
          }
        });
      });
    });

    describe("REMOVE_ARRAY_ITEM", () => {
      it("adds an item to the secrets array", () => {
        expect(jobSecretsReducers.REMOVE_ARRAY_ITEM(0, Spec())).toEqual({
          job: {
            run: {
              secrets: []
            }
          }
        });
      });
    });
  });

  describe("#jobResponseToSpec", () => {
    it("adds env secrets to spec", () => {
      const spec = {
        job: {
          run: {
            env: [
              ["notSecret", "foo"],
              ["test", { secret: "secret0" }]
            ]
          }
        }
      };
      const secret = {
        exposureType: "envVar",
        exposureValue: "test",
        key: "secret0",
        secretPath: ""
      };
      expect(jobResponseToSpec(spec).job.run.secrets).toEqual([secret]);
    });

    it("adds volume secrets to spec", () => {
      const spec = {
        job: {
          run: {
            volumes: [
              {
                containerPath: "test",
                secret: "secret0"
              }
            ]
          }
        }
      };
      const secret = {
        exposureType: "file",
        exposureValue: "test",
        key: "secret0",
        secretPath: ""
      };
      expect(jobResponseToSpec(spec).job.run.secrets).toEqual([secret]);
    });

    it("removes env secrets from spec env", () => {
      const spec = {
        job: {
          run: {
            env: [
              ["notSecret", "foo"],
              ["test", { secret: "secret0" }]
            ]
          }
        }
      };
      expect(jobResponseToSpec(spec).job.run.env).toEqual([
        spec.job.run.env[0]
      ]);
    });

    it("transforms secrets to spec", () => {
      const spec = {
        job: {
          run: {
            secrets: {
              secret0: {
                source: "foo"
              }
            }
          }
        }
      };
      const secret = {
        exposureType: "",
        exposureValue: "",
        key: "secret0",
        secretPath: "foo"
      };
      expect(jobResponseToSpec(spec).job.run.secrets).toEqual([secret]);
    });

    it("associates env secrets with secrets in spec output", () => {
      const spec = {
        job: {
          run: {
            secrets: {
              secret0: {
                source: "foo"
              }
            },
            env: [
              ["notSecret", "bar"],
              ["test", { secret: "secret0" }]
            ]
          }
        }
      };

      const secret = {
        exposureType: "envVar",
        exposureValue: "test",
        key: "secret0",
        secretPath: "foo"
      };
      expect(jobResponseToSpec(spec).job.run.secrets).toEqual([secret]);
    });
  });

  describe("#jobJsonReducers", () => {
    describe("OVERRIDE", () => {
      it("calls the passed function", () => {
        passedReducerFn.mockReturnValueOnce(Spec());
        const reducerFn = jobJsonReducers(passedReducerFn);
        reducerFn.OVERRIDE(Spec(), Spec(), []);
        expect(passedReducerFn).toHaveBeenCalled();
      });

      it("returns state with array secrets from env", () => {
        const spec = {
          job: {
            run: {
              env: {
                a: "b",
                test: {
                  secret: "secret0"
                }
              }
            }
          }
        };
        const returnValue = {
          job: {
            run: {
              env: [
                ["a", "b"],
                ["test", { secret: "secret0" }]
              ]
            }
          }
        };
        const output = {
          job: {
            run: {
              env: [["a", "b"]],
              secrets: [
                {
                  exposureType: "envVar",
                  exposureValue: "test",
                  key: "secret0",
                  secretPath: ""
                }
              ]
            }
          }
        };
        passedReducerFn.mockReturnValueOnce(returnValue);
        const reducerFn = jobJsonReducers(passedReducerFn);
        const reducerOutput = reducerFn.OVERRIDE(spec, Spec(), []);
        expect(reducerOutput).toEqual(output);
      });

      it("returns state with array secrets from secrets", () => {
        const spec = {
          job: {
            run: {
              secrets: {
                secret0: {
                  source: "foo"
                }
              }
            }
          }
        };
        const output = {
          job: {
            run: {
              secrets: [
                {
                  exposureType: "",
                  exposureValue: "",
                  key: "secret0",
                  secretPath: "foo"
                }
              ]
            }
          }
        };
        passedReducerFn.mockReturnValueOnce(spec);
        const reducerFn = jobJsonReducers(passedReducerFn);
        const reducerOutput = reducerFn.OVERRIDE(spec, Spec(), []);
        expect(reducerOutput).toEqual(output);
      });

      it("returns state with array secrets from env and secrets", () => {
        const spec = {
          job: {
            run: {
              secrets: {
                secret0: {
                  source: "foo"
                }
              },
              env: [
                ["a", "b"],
                ["test", { secret: "secret0" }]
              ]
            }
          }
        };
        const output = {
          job: {
            run: {
              secrets: [
                {
                  exposureType: "envVar",
                  exposureValue: "test",
                  key: "secret0",
                  secretPath: "foo"
                }
              ],
              env: [["a", "b"]]
            }
          }
        };
        passedReducerFn.mockReturnValueOnce(spec);
        const reducerFn = jobJsonReducers(passedReducerFn);
        const reducerOutput = reducerFn.OVERRIDE(spec, Spec(), []);
        expect(reducerOutput).toEqual(output);
      });
    });
  });

  describe("#jobSpecToOutput", () => {
    it("adds env secrets to env object", () => {
      const spec = {
        run: {
          secrets: [
            {
              exposureType: "envVar",
              exposureValue: "test",
              key: "secret0",
              secretPath: ""
            }
          ]
        }
      };
      const output = {
        run: {
          env: {
            test: {
              secret: "secret0"
            }
          }
        }
      };
      expect(jobSpecToOutput(spec)).toEqual(output);
    });

    it("transforms secrets", () => {
      const spec = {
        run: {
          secrets: [
            {
              exposureValue: "",
              key: "secret0",
              secretPath: "foo"
            }
          ]
        }
      };
      const output = {
        run: {
          secrets: {
            secret0: {
              source: "foo"
            }
          }
        }
      };
      expect(jobSpecToOutput(spec)).toEqual(output);
    });

    it("transforms env secrets and source secrets", () => {
      const spec = {
        run: {
          secrets: [
            {
              exposureType: "",
              exposureValue: "",
              key: "secret0",
              secretPath: "foo"
            },
            {
              exposureType: "envVar",
              exposureValue: "test",
              key: "secret1",
              secretPath: ""
            },
            {
              exposureType: "envVar",
              exposureValue: "joined",
              key: "secret2",
              secretPath: "bar"
            }
          ]
        }
      };
      const output = {
        run: {
          secrets: {
            secret0: {
              source: "foo"
            },
            secret2: {
              source: "bar"
            }
          },
          env: {
            test: {
              secret: "secret1"
            },
            joined: {
              secret: "secret2"
            }
          }
        }
      };
      expect(jobSpecToOutput(spec)).toEqual(output);
    });
  });
});
