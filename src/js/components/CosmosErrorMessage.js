import React from 'react';
import ErrorPaths from '../constants/ErrorPaths';

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
    let {type, message, data} = this.props.error;
    let children = [];

    // Append reference to repository page, since repository related errors
    // can occur at any request to Cosmos
    if (REPOSITORY_ERRORS.includes(type)) {
      message = this.appendRepositoryLink(message);
    }

    // The message is always there
    children.push(
        <h4 className="text-align-center text-danger flush-top">
          {message}
        </h4>
      );

    // Check if we should additionally append
    // the error details as an unordered list
    if (data && data.errors) {

      // Get an array of array of errors for every individual path
      let errorsDetails = data.errors.map(function ({path, errors}) {
        return errors.map(function (error) {
          let key = (ErrorPaths[path] || path)+'.'+error;
          return (
              <li key={key}>{ErrorPaths[path] || path}: {error}</li>
            );
        });
      });

      // Flatten elemens array
      errorsDetails = errorsDetails.reduce(function (a, b) {
        return a.concat(b);
      });

      // Append an error details <ul> to the childrens
      children.push(
          <ul className="error-list-small">
            {errorsDetails}
          </ul>
        );

    }

    // Return collected items
    return (
        <div className="text-danger">
          {children}
        </div>
      );

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
    type: React.PropTypes.string,
    data: React.PropTypes.object
  }),
  header: React.PropTypes.string,
  headerClass: React.PropTypes.string,
  wrapperClass: React.PropTypes.string
};

module.exports = CosmosErrorMessage;
