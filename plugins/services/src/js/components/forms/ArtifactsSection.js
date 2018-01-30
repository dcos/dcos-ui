import PropTypes from "prop-types";
import React, { Component } from "react";
import { Tooltip } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import Icon from "#SRC/js/components/Icon";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import MetadataStore from "#SRC/js/stores/MetadataStore";

class ArtifactsSection extends Component {
  getArtifactsLabel() {
    const tooltipContent = (
      <span>
        {
          "If your service requires additional files and/or archives of files, enter their URIs to download and, if necessary, extract these resources. "
        }
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/creating-services/"
          )}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <FieldLabel>
        {"Artifact URI "}
        <Tooltip
          content={tooltipContent}
          interactive={true}
          maxWidth={300}
          wrapText={true}
        >
          <Icon color="grey" id="circle-question" size="mini" />
        </Tooltip>
      </FieldLabel>
    );
  }

  getArtifactsInputs() {
    const { data, errors, path } = this.props;

    if (data.length === 0) {
      return (
        <FormRow>
          <FormGroup className="column-10">
            {this.getArtifactsLabel()}
          </FormGroup>
        </FormRow>
      );
    }

    return data.map((item, index) => {
      const error = findNestedPropertyInObject(errors, `${index}.uri`);
      let label = null;
      if (index === 0) {
        label = this.getArtifactsLabel();
      }

      return (
        <FormRow key={`${path}.${index}`}>
          <FormGroup className="column-12" showError={Boolean(error)}>
            {label}
            <FieldAutofocus>
              <FieldInput
                name={`${path}.${index}.uri`}
                placeholder="http://example.com"
                value={item.uri}
              />
            </FieldAutofocus>
            <FieldError>{error}</FieldError>
          </FormGroup>
          <FormGroup hasNarrowMargins={true} applyLabelOffset={index === 0}>
            <DeleteRowButton
              onClick={this.props.onRemoveItem.bind(this, {
                path,
                value: index
              })}
            />
          </FormGroup>
        </FormRow>
      );
    });
  }

  render() {
    const { path } = this.props;

    return (
      <div className="form-section">
        {this.getArtifactsInputs()}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                path
              })}
            >
              Add Artifact
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

ArtifactsSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      uri: PropTypes.string
    })
  ),
  path: PropTypes.string
};

module.exports = ArtifactsSection;
