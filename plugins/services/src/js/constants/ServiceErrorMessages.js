import { i18nMark } from "@lingui/react";
import DefaultErrorMessages from "#SRC/js/constants/DefaultErrorMessages";

const ServiceErrorMessages = [
  {
    path: /^id$/,
    type: "PROP_IS_MISSING",
    message: i18nMark("Must be defined")
  },
  {
    path: /^id$/,
    type: "ALREADY_EXISTS",
    message: i18nMark("Already exists")
  },
  {
    path: /^id$/,
    type: "STRING_PATTERN",
    message: i18nMark(
      "May only contain digits (0-9), dashes (-), dots (.),lowercase letters (a-z), and slashes (/) e.g. /group/my-service"
    )
  },
  {
    path: /^id$/,
    type: "GENERIC",
    message: i18nMark(
      "May only contain digits (0-9), dashes (-), dots (.),lowercase letters (a-z), and slashes (/) e.g. /group/my-service"
    )
  },
  {
    path: /^container.docker.image$/,
    type: "PROP_IS_MISSING",
    message: i18nMark(
      'Must be specified when using the Docker Engine runtime. You can change runtimes under "Advanced Settings"'
    )
  },
  {
    path: /.*/,
    type: "SERVICE_DEPLOYING",
    message: i18nMark(
      "The service is currently locked by one or more deployments. Press again to force this operation"
    )
  },
  {
    path: /^container\.docker\.portMappings\.[0-9]+\.name$/,
    type: "STRING_PATTERN",
    message: i18nMark(
      "May only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server"
    )
  },
  {
    path: /^portDefinitions\.[0-9]+\.name$/,
    type: "STRING_PATTERN",
    message: i18nMark(
      "May only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server. The name may not begin or end with a dash"
    )
  },
  {
    path: /^container\.portMappings\.[0-9]+\.name$/,
    type: "STRING_PATTERN",
    message: i18nMark(
      "May only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server. The name may not begin or end with a dash"
    )
  },
  {
    path: /^containers\.[0-9]+\.endpoints\.[0-9]+\.name/,
    type: "STRING_PATTERN",
    message: i18nMark(
      "May only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server. The name may not begin or end with a dash"
    )
  },
  // for multi-container instances
  {
    path: /^scaling\.instances/,
    type: "GENERIC",
    message: i18nMark("Must be bigger than or equal to 0")
  },
  {
    path: /^containers$/,
    type: "ITEMS_MIN",
    message: i18nMark("Must contain at least one item")
  },
  {
    path: /^containers\.[0-9]+\.endpoints\.[0-9]+\.protocol/,
    type: "ITEMS_MIN",
    message: i18nMark("Must be selected")
  },
  {
    path: /^containers\.[0-9]+\.volumeMounts\.[0-9]+\.name/,
    type: "STRING_PATTERN",
    message: i18nMark(
      "May only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server. The name may not begin or end with a dash"
    )
  },
  {
    path: /^environment\./,
    type: "GENERIC",
    message: i18nMark("Must be defined")
  }
].concat(DefaultErrorMessages);

module.exports = ServiceErrorMessages;
