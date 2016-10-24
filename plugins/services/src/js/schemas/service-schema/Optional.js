/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

let Optional = {
  title: 'Optional',
  type: 'object',
  properties: {
    executor: {
      title: 'Executor',
      type: 'string',
      description: 'Executor must be the string \'//cmd\', a string ' +
      'containing only single slashes (\'/\'), or blank.',
      getter(service) {
        return service.getExecutor();
      }
    },
    uris: {
      title: 'URIs',
      type: 'string',
      description: 'Comma-separated list of valid URIs',
      getter(service) {
        if (!service.getFetch()) {
          return null;
        }
        return service.getFetch().map(function (item) {
          return item.uri;
        }).join(', ');
      }
    },
    constraints: {
      title: 'Constraints',
      type: 'string',
      description: 'Comma-separated list of valid constraints. Valid ' +
      'constraint format is "field:operator[:value]".',
      getter(service) {
        return service.getConstraints() && service.getConstraints()
            .map(function (item) {
              return item.join(':');
            }).join(',');
      }
    },
    acceptedResourceRoles: {
      title: 'Accepted Resource Roles',
      type: 'string',
      description: 'Comma-separated list of resource roles. Marathon ' +
      'considers only resource offers with roles in this list for ' +
      'launching tasks of this app.',
      getter(service) {
        return service.getAcceptedResourceRoles() &&
          service.getAcceptedResourceRoles().join(', ');
      }
    },
    user: {
      title: 'User',
      type: 'string',
      getter(service) {
        return service.getUser();
      }
    }
  }
};

module.exports = Optional;
