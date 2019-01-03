/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { i18nMark, withI18n } from "@lingui/react";
import JobValidatorUtil from "../../utils/JobValidatorUtil";
import ValidatorUtil from "../../utils/ValidatorUtil";
import MesosConstants from "../../../../plugins/services/src/js/constants/MesosConstants";
import JobResources from "../../constants/JobResources";

const General = {
  title: i18nMark("General"),
  description: i18nMark("Configure your job settings"),
  type: "object",
  properties: {
    id: {
      focused: true,
      title: i18nMark("ID"),
      description: i18nMark("The job ID"),
      type: "string",
      getter(job) {
        return job.getId();
      },
      externalValidator({ general }, definition) {
        if (!JobValidatorUtil.isValidJobID(general.id)) {
          definition.showError = i18nMark(`ID must not be empty, must not contain 
            whitespace, and should not contain any other characters than 
            lowercase letters, digits, hyphens, ".", and ".."`);

          return false;
        }

        return true;
      }
    },
    description: {
      title: i18nMark("Description"),
      description: i18nMark("Job description"),
      type: "string",
      getter(job) {
        return job.getDescription();
      }
    },
    resources: {
      type: "group",
      properties: {
        cpus: {
          title: i18nMark("CPUs"),
          default: JobResources.DEFAULT_CPUS,
          description: i18nMark("The amount of CPUs the job requires"),
          type: "number",
          getter(job) {
            return `${job.getCpus()}`;
          },
          externalValidator({ general }, definition) {
            if (
              !ValidatorUtil.isNumberInRange(general.cpus, {
                min: MesosConstants.MIN_CPUS
              })
            ) {
              definition.showError = i18nMark(
                "CPUs must be a number at least equal to " +
                  MesosConstants.MIN_CPUS
              );

              return false;
            }

            return true;
          }
        },
        mem: {
          title: i18nMark("Mem (MiB)"),
          default: JobResources.DEFAULT_MEM,
          type: "number",
          getter(job) {
            return `${job.getMem()}`;
          },
          externalValidator({ general }, definition) {
            if (
              !ValidatorUtil.isNumberInRange(general.mem, {
                min: MesosConstants.MIN_MEM
              })
            ) {
              definition.showError =
                i18nMark("Mem must be a number and at least ") +
                MesosConstants.MIN_MEM +
                " MiB";

              return false;
            }

            return true;
          }
        },
        disk: {
          title: i18nMark("Disk (MiB)"),
          default: JobResources.DEFAULT_DISK,
          type: "number",
          getter(job) {
            return `${job.getDisk()}`;
          },
          externalValidator({ general }, definition) {
            if (
              ValidatorUtil.isDefined(general.disk) &&
              !ValidatorUtil.isNumberInRange(general.disk)
            ) {
              definition.showError = i18nMark("Disk must be a positive number");

              return false;
            }

            return true;
          }
        }
      }
    },
    cmd: {
      title: i18nMark("Command"),
      description: i18nMark("The command executed by the service"),
      type: "string",
      multiLine: true,
      getter(job) {
        return job.getCommand();
      }
    }
  },
  required: ["id"]
};

module.exports = withI18n()(General);
