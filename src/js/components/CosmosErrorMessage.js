import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import PropTypes from "prop-types";
import React from "react";
import { Icon, InfoBoxInline } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import ErrorPaths from "../../../plugins/services/src/js/constants/ErrorPaths";

const REPOSITORY_ERRORS = [
  "EmptyPackageImport",
  "IndexNotFound",
  "InvalidRepositoryUri",
  "PackageFileMissing",
  "PackageFileNotJson",
  "RepositoryNotPresent",
  "RepositoryUriConnection",
  "RepositoryUriSyntax"
];

class CosmosErrorMessage extends React.Component {
  getMessage() {
    const { error } = this.props;
    if (!error) {
      return <Trans render="span">An unknown error occurred</Trans>;
    }

    // Append reference to repository page, since repository related errors
    // can occur at any request to Cosmos
    const { type, message } = error;

    if (REPOSITORY_ERRORS.includes(type)) {
      return this.appendRepositoryLink(message);
    }

    // make "Package is already installed error" better
    if (error.type === "PackageAlreadyInstalled") {
      return (
        <Trans render="span" className="cosmosErrorMsg">
          A service with the same name already exists. Try a different name.
        </Trans>
      );
    }

    return <Trans id={message} render="span" />;
  }

  getDetails() {
    const { error } = this.props;
    if (!error) {
      return null;
    }

    // Return early if we have some well-known or an unknown type
    if (typeof error === "string") {
      return [error];
    }
    if (typeof error !== "object") {
      return null;
    }

    // Return early if important fields are missing, or they are not
    // in the expected format
    if (!error.data || !error.data.errors) {
      return null;
    }
    if (!Array.isArray(error.data.errors)) {
      return [String(error.data.errors)];
    }

    // Get an array of array of errors for every individual path
    const errorsDetails = error.data.errors.map(function(errorDetail) {
      // Return early on unexpected error object format
      if (!errorDetail) {
        return [];
      }
      if (typeof errorDetail !== "object") {
        return [String(errorDetail)];
      }

      // Extract details
      const { path = "/", errors = [] } = errorDetail;
      if (!errors || !Array.isArray(errors)) {
        return [];
      }

      return errors.map(function(error) {
        return (ErrorPaths[path] || path) + "." + error;
      });
    });

    // Flatten elements in array and return
    return errorsDetails.reduce(function(a, b) {
      return a.concat(b);
    });
  }

  appendRepositoryLink(message) {
    return (
      <span>
        <Trans id={message} render="strong" />.
        <br />
        <Trans render="span">
          You can go to the{" "}
          <a href="/#/settings/repositories/">Repositories Settings</a> page to
          change installed repositories.
        </Trans>
      </span>
    );
  }

  render() {
    return (
      <div className="infoBoxWrapper">
        <InfoBoxInline
          appearance="danger"
          message={
            <div>
              <div className="flex">
                <div>
                  <Icon
                    shape={SystemIcons.Yield}
                    size={iconSizeXs}
                    color="currentColor"
                  />
                </div>
                <div className="errorsAlert-message">{this.getMessage()}</div>
              </div>

              {this.getDetails() && (
                <div className="pod pod-narrower-left pod-shorter-top flush-bottom">
                  <ul className="short flush-bottom">{this.getDetails()}</ul>
                </div>
              )}
            </div>
          }
        />
      </div>
    );
  }
}

CosmosErrorMessage.defaultProps = {
  error: { message: i18nMark("Please try again.") },
  flushBottom: false
};

CosmosErrorMessage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.node,
    type: PropTypes.string,
    data: PropTypes.object
  }),
  flushBottom: PropTypes.bool
};

module.exports = CosmosErrorMessage;
