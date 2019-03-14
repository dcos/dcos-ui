import {
  jobSpecToOutputParser,
  jobSpecToFormOutputParser
} from "../JobParsers";
import { JobSpec, Container } from "../JobFormData";
import { getDefaultDocker, getDefaultContainer } from "../DefaultFormData";

describe("JobParsers", () => {
  describe("#jobSpecToOutputParser", () => {
    it("returns object without docker, ucr, or gpus if cmdOnly true", () => {
      const input = {
        cmdOnly: true,
        job: {
          run: {
            docker: {},
            ucr: {},
            gpus: 0
          }
        }
      };

      const parsed = jobSpecToOutputParser(input as JobSpec);
      expect(parsed.job.run.docker).toBe(undefined);
      expect(parsed.job.run.ucr).toBe(undefined);
      expect(parsed.job.run.gpus).toBe(undefined);
    });

    it("returns object with only container property indicated by `container` if cmdOnly false", () => {
      const input = {
        cmdOnly: false,
        container: Container.Docker,
        job: {
          run: {
            docker: {},
            ucr: {}
          }
        }
      };

      const parsed = jobSpecToOutputParser(input as JobSpec);
      expect(parsed.job.run.docker).toEqual({});
      expect(parsed.job.run.ucr).toBe(undefined);
    });

    it("returns object with only docker and no gpus if `container` is docker and cmdOnly is false", () => {
      const input = {
        cmdOnly: false,
        container: Container.Docker,
        job: {
          run: {
            docker: {},
            ucr: {},
            gpus: 0
          }
        }
      };

      const parsed = jobSpecToOutputParser(input as JobSpec);
      expect(parsed.job.run.docker).toEqual({});
      expect(parsed.job.run.ucr).toBe(undefined);
      expect(parsed.job.run.gpus).toBe(undefined);
    });
  });

  describe("#jobSpecToFormOutputParser", () => {
    const input = {
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

    const output = {
      jobId: "id",
      description: "desc",
      cmdOnly: true,
      container: Container.Docker,
      cmd: "foo",
      containerImage: "",
      cpus: 1,
      gpus: 0,
      mem: 32,
      disk: 0,
      dockerParams: [],
      args: [],
      grantRuntimePrivileges: undefined,
      imageForcePull: undefined
    };

    it("transforms JobSpec to FormOutput", () => {
      expect(jobSpecToFormOutputParser(input as JobSpec)).toEqual(output);
    });
  });
});
