import CompositeState from '../structs/CompositeState';
import Node from '../structs/Node';
import StringUtil from './StringUtil';

const DefaultResourceTypes = {
  cpus: {label: 'CPU', colorID: 0},
  mem: {label: 'Memory', colorID: 6},
  disk: {label: 'Disk', colorID: 3}
};

// Let's create an instance of a Node with our default resources
let fakeUsedResources = Object.keys(DefaultResourceTypes)
.reduce(function (memo, resource) {
  memo[resource] = 0;

  return memo;
}, {});
let fakeNode = new Node({used_resources: fakeUsedResources});

const usedColors = Object.keys(DefaultResourceTypes)
.map(function (resource) {
  return DefaultResourceTypes[resource].colorID;
});
const availableColors = Array(9).fill().map(function (value, index) {
  return index;
}).filter(function (value) {
  return usedColors.indexOf(value) === -1;
});

function getAvailableColors() {
  let colors = availableColors.slice(0);

  // Concat the array twice. In case there's many resources.
  // Unlikely that there will more than 4 anyways.
  return colors.concat(colors);
}

const ResourcesUtil = {
  getDefaultResources: function () {
    return Object.keys(DefaultResourceTypes);
  },

  getAvailableResources: function (excludeList = []) {
    let item = CompositeState.getNodesList().getItems()[0];

    if (!item) {
      item = CompositeState.getServiceList().getItems()[0];

      if (!item) {
        item = fakeNode;
      }
    }

    let resources = Object.keys(item.get('used_resources'));

    if (excludeList.length > 0) {
      resources = resources.filter(function (resource) {
        // If it's not in the exclude list, we want it
        return excludeList.indexOf(resource) === -1;
      });
    }

    return resources;
  },

  getAdditionalResources: function () {
    let rest = this.getAvailableResources(this.getDefaultResources());
    // We sort so we get the same color in future calls to this method
    rest.sort();

    return rest;
  },

  getResourceLabel: function (resource) {
    if (DefaultResourceTypes[resource]) {
      return DefaultResourceTypes[resource].label;
    }

    // If the resource name is 3 characters or less, let's uppercase it all
    // otherwise we only capitalize the first letter.
    if (resource.length <= 3) {
      return resource.toUpperCase();
    } else {
      return StringUtil.capitalize(resource.toLowerCase());
    }
  },

  getResourceLabels: function () {
    let resources = this.getAvailableResources();

    return resources.reduce((memo, resource) => {
      memo[resource] = this.getResourceLabel(resource);

      return memo;
    }, {});
  },

  getResourceColor: function (resource, opts = {}) {
    if (DefaultResourceTypes[resource]) {
      return DefaultResourceTypes[resource].colorID;
    }

    if (!opts.availableColors) {
      opts.availableColors = getAvailableColors();
    }
    if (!opts.resourceList) {
      // We only want the ones for which there are no defaults, that way
      // we're not skipping colors down below when we just grab an index
      // of the available colors.
      opts.resourceList = this.getAdditionalResources();
    }

    let index = opts.resourceList.indexOf(resource);

    return opts.availableColors[index];
  },

  getResourceColors: function () {
    // Map the default ones first
    let map = this.getDefaultResources().reduce((memo, resource) => {
      memo[resource] = this.getResourceColor(resource);

      return memo;
    }, {});

    let rest = this.getAdditionalResources();

    // Map the rest
    return rest.reduce((memo, resource) => {
      memo[resource] = this.getResourceColor(resource, {
        resourceList: rest
      });

      return memo;
    }, map);
  }
};

module.exports = ResourcesUtil;
