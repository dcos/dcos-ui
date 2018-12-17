import { i18nMark } from "@lingui/react";

const Labels = {
  type: "object",
  title: i18nMark("Labels"),
  description: i18nMark(
    "Attach metadata to jobs to expose additional information to other jobs."
  ),
  properties: {
    items: {
      type: "array",
      duplicable: true,
      addLabel: i18nMark("Add Label"),
      getter(job) {
        const labels = job.getLabels() || {};

        return Object.keys(labels).map(function(key) {
          return {
            key,
            value: labels[key]
          };
        });
      },
      itemShape: {
        properties: {
          key: {
            title: i18nMark("Label Name"),
            type: "string"
          },
          value: {
            title: i18nMark("Label Value"),
            type: "string"
          }
        }
      }
    }
  }
};

module.exports = Labels;
