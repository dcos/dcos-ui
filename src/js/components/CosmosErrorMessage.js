import React from "react";

import Alert from "./Alert";
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
      return "An unknown error occurred";
    }

    // Append reference to repository page, since repository related errors
    // can occur at any request to Cosmos
    const { type, message } = error;

    if (REPOSITORY_ERRORS.includes(type)) {
      return this.appendRepositoryLink(message);
    }

    return message;
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
        <strong>{`${message}. `}</strong><br />
        {"You can go to the "}
        <a href="/#/settings/repositories/">Repositories Settings</a>
        {" page to change installed repositories."}
      </span>
    );
  }

  render() {
    return (
      <Alert flushBottom={this.props.flushBottom}>
        {this.getMessage()}
        <div className="pod pod-narrower-left pod-shorter-top flush-bottom">
          <ul className="short flush-bottom">
            {this.getDetails()}
          </ul>
        </div>
      </Alert>
    );
  }
}

CosmosErrorMessage.defaultProps = {
  error: { message: "Please try again." },
  flushBottom: false
};

CosmosErrorMessage.propTypes = {
  error: React.PropTypes.shape({
    message: React.PropTypes.node,
    type: React.PropTypes.string,
    data: React.PropTypes.object
  }),
  flushBottom: React.PropTypes.bool
};

module.exports = CosmosErrorMessage;
