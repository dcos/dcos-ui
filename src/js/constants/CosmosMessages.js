/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

const repositoryLink = (
  <span>
    {` You can do that on the `}
    <a href="/#/system/overview/repositories/">Repositories Settings</a>
    {` page, uninstall it, and add the correct URL.`}
  </span>
);

const CosmosMessages = {
  PackageAlreadyInstalled: {
    header: 'Name Already Exists',
    getMessage: function (packageName = 'this package') {
      return `You have an instance of ${packageName} running using the same name. Please change the name and try again.`;
    }
  },
  RepositoryUriSyntax: {
    header: 'Issue with registered repositories',
    getMessage: function (repository = 'a repository') {
      return (
        <span>
          {`The URL for ${repository} (repository) is not valid, or its host did not resolve. You might need to change the URL of ${repository}.`}
          {repositoryLink}
        </span>
      );
    }
  },
  RepositoryUriConnection: {
    header: 'Issue with registered repositories',
    getMessage: function (repository = 'a repository') {
      return (
        <span>
          {`The URL for ${repository} (repository) is not valid, or its host did not resolve. You might need to change the URL of ${repository}.`}
          {repositoryLink}
        </span>
      );
    }
  },
  IndexNotFound: {
    header: 'Issue with registered repositories',
    getMessage: function (repository = 'a repository') {
      return (
        <span>
          {`The index file is missing in ${repository} (repository). You might need to change the URL of ${repository}.`}
          {repositoryLink}
        </span>
      );
    }
  },
  PackageFileMissing: {
    header: 'Issue with registered repositories',
    getMessage: function (repository = 'a repository') {
      return (
        <span>
          {`The package file is missing in ${repository} (repository). You might need to change the URL of ${repository}.`}
          {repositoryLink}
        </span>
      );
    }
  },
  default: {
    header: 'Unable to Install',
    getMessage: function () {
      return 'Please check your system and configuration. Then try again.';
    }
  }
};

module.exports = CosmosMessages;
