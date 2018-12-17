import { i18nMark } from "@lingui/react";

const Parameters = {
  type: "object",
  title: i18nMark("Docker Parameters"),
  description: i18nMark("Add runtime parameters to a docker job run."),
  properties: {
    items: {
      type: "array",
      duplicable: true,
      addLabel: i18nMark("Add Parameter"),
      getter(job) {
        return job.getParameters() || [];
      },
      itemShape: {
        properties: {
          key: {
            title: i18nMark("Parameter Name"),
            type: "string"
          },
          value: {
            title: i18nMark("Parameter Value"),
            type: "string"
          }
        }
      }
    }
  }
};

module.exports = Parameters;
