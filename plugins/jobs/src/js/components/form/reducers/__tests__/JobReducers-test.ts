import { jobFormOutputToSpecReducer } from "../JobReducers";
import {
  getDefaultDocker,
  getDefaultContainer
} from "../../helpers/DefaultFormData";
import {
  JobFormActionType,
  Container,
  UcrImageKind
} from "../../helpers/JobFormData";

const state = {
  cmdOnly: true,
  container: Container.Docker,
  job: {
    id: "id",
    description: "desc",
    run: {
      cmd: "foo",
      cpus: 1,
      disk: 0,
      mem: 32,
      gpus: 0,
      docker: getDefaultDocker(),
      ucr: getDefaultContainer()
    }
  }
};

const stateWithContainer = {
  cmdOnly: false,
  container: Container.Docker,
  job: {
    id: "id",
    description: "desc",
    run: {
      cmd: "foo",
      cpus: 1,
      disk: 0,
      mem: 32,
      gpus: 0,
      docker: getDefaultDocker(),
      ucr: getDefaultContainer()
    }
  }
};

describe("JobReducers", () => {
  describe("JSON reducers", () => {
    describe("Override action", () => {
      it("overrides current state with JSON value while maintaining container options", () => {
        const jsonValue = {
          job: {
            id: "newId",
            description: "desc",
            run: {
              cmd: "foo",
              cpus: 1,
              disk: 0,
              mem: 32,
              gpus: 0
            }
          }
        };
        const expected = {
          cmdOnly: true,
          container: Container.Docker,
          job: {
            id: "newId",
            description: "desc",
            run: {
              cmd: "foo",
              cpus: 1,
              disk: 0,
              mem: 32,
              gpus: 0,
              docker: getDefaultDocker(),
              ucr: getDefaultContainer()
            }
          }
        };
        const action = {
          type: JobFormActionType.Override,
          path: "json",
          value: jsonValue
        };

        expect(jobFormOutputToSpecReducer(action, state)).toEqual(expected);
      });

      it("adds container image value to both container objects in job spec if present", () => {
        const jsonValue = {
          job: {
            id: "newId",
            description: "desc",
            run: {
              cmd: "foo",
              cpus: 1,
              disk: 0,
              mem: 32,
              gpus: 0,
              docker: {
                image: "bar"
              }
            }
          }
        };
        const expected = {
          cmdOnly: false,
          container: Container.Docker,
          job: {
            id: "newId",
            description: "desc",
            run: {
              cmd: "foo",
              cpus: 1,
              disk: 0,
              mem: 32,
              gpus: 0,
              docker: {
                image: "bar"
              },
              ucr: {
                image: {
                  id: "bar",
                  kind: UcrImageKind.Docker
                }
              }
            }
          }
        };
        const action = {
          type: JobFormActionType.Override,
          path: "json",
          value: jsonValue
        };

        expect(jobFormOutputToSpecReducer(action, state)).toEqual(expected);
      });
    });
  });

  describe("containerImage reducers", () => {
    describe("Set action", () => {
      it("tracks containerImage changes in both ucr and docker objects on change", () => {
        const action = {
          type: JobFormActionType.Set,
          path: "containerImage",
          value: "image"
        };
        const expected = {
          cmdOnly: false,
          container: Container.Docker,
          job: {
            id: "id",
            description: "desc",
            run: {
              cmd: "foo",
              cpus: 1,
              disk: 0,
              mem: 32,
              gpus: 0,
              docker: {
                image: "image"
              },
              ucr: {
                image: {
                  id: "image",
                  kind: UcrImageKind.Docker
                }
              }
            }
          }
        };

        expect(jobFormOutputToSpecReducer(action, stateWithContainer)).toEqual(
          expected
        );
      });
    });
  });

  describe("cmdOnly reducers", () => {
    describe("Set action", () => {
      it("sets cmdOnly to a boolean value", () => {
        const action = {
          type: JobFormActionType.Set,
          path: "cmdOnly",
          value: "true"
        };
        expect(jobFormOutputToSpecReducer(action, stateWithContainer)).toEqual(
          state
        );
      });
    });
  });

  describe("default reducer", () => {
    describe("Set action", () => {
      it("sets a JobSpec property according to a given nested path", () => {
        const action = {
          type: JobFormActionType.Set,
          path: "job.id",
          value: "newId"
        };
        const expected = {
          cmdOnly: true,
          container: Container.Docker,
          job: {
            id: "newId",
            description: "desc",
            run: {
              cmd: "foo",
              cpus: 1,
              disk: 0,
              mem: 32,
              gpus: 0,
              docker: getDefaultDocker(),
              ucr: getDefaultContainer()
            }
          }
        };

        expect(jobFormOutputToSpecReducer(action, state)).toEqual(expected);
      });
    });
  });
});
