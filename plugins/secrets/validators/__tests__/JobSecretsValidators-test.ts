import {
  JobSecretsValidators,
  JobSpecValidator
} from "../JobSecretsValidators";

describe("JobSecretsValidators", () => {
  describe("JobSecretsValidator", () => {
    describe("#envHasMatchingSecret", () => {
      it("returns error when env secret doesn't have matching secret", () => {
        const spec = {
          run: {
            env: {
              var: {
                secret: "secret0"
              }
            }
          }
        };
        expect(JobSecretsValidators.envHasMatchingSecret(spec)).toEqual([
          {
            path: ["run", "secrets", "secret0"],
            message: "The secret cannot be empty"
          }
        ]);
      });

      it("does not return error when env secret has matching secret", () => {
        const spec = {
          run: {
            env: {
              var: {
                secret: "secret0"
              }
            },
            secrets: {
              secret0: {
                source: "foo"
              }
            }
          }
        };
        expect(JobSecretsValidators.envHasMatchingSecret(spec)).toEqual([]);
      });

      it("does not return error when there are no env secrets", () => {
        const spec = {
          run: {
            env: {
              a: "b"
            }
          }
        };
        expect(JobSecretsValidators.envHasMatchingSecret(spec)).toEqual([]);
      });

      it("does not return error when there are is no env", () => {
        const spec = {
          run: {}
        };
        expect(JobSecretsValidators.envHasMatchingSecret(spec)).toEqual([]);
      });
    });

    describe("#volumeHasMatchingSecret", () => {
      it("returns error when volume secret doesn't have matching secret", () => {
        const spec = {
          run: {
            volumes: [
              {
                secret: "secret0"
              }
            ]
          }
        };
        expect(JobSecretsValidators.volumeHasMatchingSecret(spec)).toEqual([
          {
            path: ["run", "secrets", "secret0"],
            message: "The secret cannot be empty"
          }
        ]);
      });

      it("does not return error when volume secret has matching secret", () => {
        const spec = {
          run: {
            volumes: [
              {
                secret: "secret0"
              }
            ],
            secrets: {
              secret0: {
                source: "foo"
              }
            }
          }
        };
        expect(JobSecretsValidators.volumeHasMatchingSecret(spec)).toEqual([]);
      });

      it("does not return error when there are no volume secrets", () => {
        const spec = {
          run: {
            volumes: [
              {
                containerPath: "b",
                hostPath: "c",
                mode: "RW"
              }
            ]
          }
        };
        expect(JobSecretsValidators.volumeHasMatchingSecret(spec)).toEqual([]);
      });

      it("does not return error when there are is no volumes", () => {
        const spec = {
          run: {}
        };
        expect(JobSecretsValidators.volumeHasMatchingSecret(spec)).toEqual([]);
      });
    });

    describe("#namedSecretsAreProvided", () => {
      it("returns error if a secret is not provided", () => {
        const spec = {
          run: {
            secrets: {
              secret0: {
                source: "foo"
              }
            }
          }
        };
        expect(JobSecretsValidators.namedSecretsAreProvided(spec)).toEqual([
          {
            path: ["run", "secrets", "secret0"],
            message:
              "Secret must be provided as an environment variable or file"
          }
        ]);
      });

      it("does not return error if secret is provided as an env var", () => {
        const spec = {
          run: {
            secrets: {
              secret0: {
                source: "foo"
              }
            },
            env: {
              bar: {
                secret: "secret0"
              }
            }
          }
        };
        expect(JobSecretsValidators.namedSecretsAreProvided(spec)).toEqual([]);
      });

      it("does not return error if secret is provided as a file", () => {
        const spec = {
          run: {
            secrets: {
              secret0: {
                source: "foo"
              }
            },
            volumes: [
              {
                secret: "secret0"
              }
            ]
          }
        };
        expect(JobSecretsValidators.namedSecretsAreProvided(spec)).toEqual([]);
      });
    });

    describe("#envSecretsAreStrings", () => {
      it("returns error if env secret is not a string", () => {
        const spec = {
          run: {
            env: {
              foo: {
                secret: 123
              }
            }
          }
        };
        expect(JobSecretsValidators.envSecretsAreStrings(spec)).toEqual([
          {
            path: ["run", "env", "foo"],
            message: "Secret must be a non-empty string"
          }
        ]);
      });

      it("returns error if env secret is an empty string", () => {
        const spec = {
          run: {
            env: {
              foo: {
                secret: ""
              }
            }
          }
        };
        expect(JobSecretsValidators.envSecretsAreStrings(spec)).toEqual([
          {
            path: ["run", "env", "foo"],
            message: "Secret must be a non-empty string"
          }
        ]);
      });

      it("does not return error if env secret is a string", () => {
        const spec = {
          run: {
            env: {
              foo: {
                secret: "123"
              }
            }
          }
        };
        expect(JobSecretsValidators.envSecretsAreStrings(spec)).toEqual([]);
      });
    });
  });

  describe("JobSpecValidator", () => {
    it("returns error if secret variable names are duplicated", () => {
      const spec = {
        job: {
          run: {
            secrets: [
              {
                exposureType: "envVar",
                exposureValue: "a",
                key: "key",
                secretPath: "secret"
              },
              {
                exposureType: "envVar",
                exposureValue: "a",
                key: "key2",
                secretPath: "secret2"
              }
            ]
          }
        }
      };
      expect(JobSpecValidator([], spec)).toEqual([
        {
          path: ["run", "secrets", "0"],
          message: "Cannot have duplicate variable names"
        },
        {
          path: ["run", "secrets", "1"],
          message: "Cannot have duplicate variable names"
        }
      ]);
    });
  });
});
