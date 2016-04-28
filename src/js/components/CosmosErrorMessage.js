import React from 'react';

const REPOSITORY_ERRORS = [
  'EmptyPackageImport',
  'IndexNotFound',
  'InvalidRepositoryUri',
  'PackageFileMissing',
  'PackageFileNotJson',
  'RepositoryNotPresent',
  'RepositoryUriConnection',
  'RepositoryUriSyntax'
];

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

    // Append reference to repository page, since repository related errors
    // can occur at any request to Cosmos
    if (REPOSITORY_ERRORS.includes(type)) {
      message = this.appendRepositoryLink(message);
    }

    return message;
  }

  appendRepositoryLink(message) {
    return (
      <span>
        {`${message} You can go to the `}
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
  error: {message: 'Please try again.'},
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
