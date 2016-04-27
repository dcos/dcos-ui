import React from 'react';

class CosmosErrorMessage extends React.Component {
  getHeader() {
    let {header, headerClass} = this.props;
    if (!header) {
      return null;
    }

    return (
      <span className={headerClass}>
        {header}
      </span>
    );
  }
  getMessage() {
    let {type, message} = this.props.error;

    switch (type) {
      // Specific uninstall errors
      case 'IncompleteUninstall':
      case 'UninstallNonExistentAppForPackage':
        if (!message) {
          message = 'Unable to uninstall package. Please check your connection and try again.';
        }
        break;

      // // Specific install errors
      case 'PackageAlreadyInstalled':
      case 'PackageNotInstalled':
      case 'PackageNotFound':
      case 'VersionNotFound':
        if (!message) {
          message = 'Unable to install package. Please check configuration of the package and try again.';
        }
        break;

      // Repository related errors that can occur at any request to Cosmos
      case 'EmptyPackageImport':
      case 'IndexNotFound':
      case 'PackageFileMissing':
      case 'PackageFileNotJson':
      case 'RepositoryNotPresent':
      case 'RepositoryUriConnection':
      case 'RepositoryUriSyntax':
        if (!message) {
          message = 'The URL for a repository is not valid, or its host did not resolve. You might need to change the URL of this repository.';
        }
        message = this.appendRepositoryLink(message);
        break;
    }

    return message;
  }

  appendRepositoryLink(message) {
    return (
      <span>
        {`${message} You can got to the `}
        <a href="/#/system/overview/repositories/">Repositories Settings</a>
        {' page to change installed repositories.'}
      </span>
    );
  }

  render() {
    return (
      <div className={this.props.wrapperClass}>
        {this.getHeader()}
        <div className={this.props.className}>
          {this.getMessage()}
        </div>
      </div>
    );
  }
};

CosmosErrorMessage.defaultProps = {
  className: 'text-overflow-break-word column-small-8 column-small-offset-2 column-medium-6 column-medium-offset-3',
  error: {message: 'An error occured.'},
  header: 'An Error Occured',
  headerClass: 'h3 text-align-center flush-top',
  wrapperClass: 'row'
};

CosmosErrorMessage.propTypes = {
  className: React.PropTypes.string,
  error: React.PropTypes.shape({
    message: React.PropTypes.string,
    type: React.PropTypes.string
  }),
  header: React.PropTypes.string,
  headerClass: React.PropTypes.string,
  wrapperClass: React.PropTypes.string
}

module.exports = CosmosErrorMessage;
