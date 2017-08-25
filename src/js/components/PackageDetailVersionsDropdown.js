import React, { Component } from "react";

import { FormGroup, FieldSelect } from "#SRC/js/components/form";

const METHODS_TO_BIND = ["handleVersionChange"];

class PackageDetailVersionsDropdown extends Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleVersionChange(event) {
    const packageVersion = event.target.value;
    const originalPath = global.location.hash.split("?")[0];
    const selectedVersion = `${originalPath}?version=${packageVersion}`;

    global.location.replace(selectedVersion);
  }

  render() {
    const { cosmosPackage, cosmosPackageVersions } = this.props;
    const currentVersion = cosmosPackage.getCurrentVersion();
    const packageVersions = cosmosPackageVersions.getAllVersions();
    const sortedPackageVersions = Object.keys(packageVersions).sort();

    return (
      <FormGroup className="column-5">
        <FieldSelect
          name="packageVersions"
          value={currentVersion}
          onChange={this.handleVersionChange}
        >
          {sortedPackageVersions.map(function(version, i) {
            return <option key={i} value={version}>{version}</option>;
          })}
        </FieldSelect>
      </FormGroup>
    );
  }
}

PackageDetailVersionsDropdown.propTypes = {
  cosmosPackage: React.PropTypes.object.isRequired,
  cosmosPackageVersions: React.PropTypes.object.isRequired
};

module.exports = PackageDetailVersionsDropdown;
