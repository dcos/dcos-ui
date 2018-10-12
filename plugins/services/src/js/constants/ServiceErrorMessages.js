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
    path: /.*/,
    type: "SERVICE_DEPLOYING",
    message: i18nMark(
      "The service is currently locked by one or more deployments. Press again to force this operation."
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
      "May only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server"
    )
  }
].concat(DefaultErrorMessages);

module.exports = ServiceErrorMessages;
