import { Trans } from "@lingui/macro";
import * as React from "react";
import Batch from "#SRC/js/structs/Batch";

import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldError from "#SRC/js/components/form/FieldError";
import BatchContainer from "#SRC/js/components/BatchContainer";
import DataValidatorUtil from "#SRC/js/utils/DataValidatorUtil";
import { Tooltip } from "reactjs-components";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import {
  JSONReducer,
  JSONParser,
} from "#PLUGINS/services/src/js/reducers/serviceForm/JSONReducers/Constraints";
import { combineReducers } from "#SRC/js/utils/ReducerUtil";
import { combineParsers } from "#SRC/js/utils/ParserUtil";
import { FormReducer } from "#PLUGINS/services/src/js/reducers/serviceForm/FormReducers/Constraints";
import CreateServiceModalFormUtil from "#PLUGINS/services/src/js/utils/CreateServiceModalFormUtil";
import MarathonAppValidators from "#PLUGINS/services/src/js/validators/MarathonAppValidators";

import PlacementValidators from "#PLUGINS/services/src/js/validators/PlacementsValidators";

import {
  augmentConstraintsReducer,
  singleContainerJSONParser,
} from "../reducers/constraints";
import PlacementFormPartial from "./PlacementFormPartial";

const jsonReducer = combineReducers(
  augmentConstraintsReducer({ constraints: JSONReducer })
);
const formReducer = combineReducers(
  augmentConstraintsReducer({ constraints: FormReducer })
);
const jsonParser = combineParsers([JSONParser, singleContainerJSONParser]);

export function PlacementSchemaZoneField(props) {
  return <PlacementSchemaField {...props} renderRegion={false} />;
}

const JsonField = (props: {
  fieldName: string;
  label: string;
  json: {};
  replacer?: () => void;
  space?: number;
}) => (
  <div>
    <FieldLabel>{props.label}</FieldLabel>
    <pre>{JSON.stringify(props.json, props.replacer, props.space)}</pre>
    <FieldError>
      <Trans render="span" id="Unable to edit {0}">
        Unable to edit {props.fieldName}
      </Trans>
    </FieldError>
  </div>
);

JsonField.defaultProps = {
  space: 2,
};

export class PlacementSchemaField extends React.Component<{
  errorMessage: React.ReactNode;
  fieldProps: {
    formData: unknown;
    onChange: (a: unknown) => void;
    schema: unknown;
  };
  label: string;
  renderRegion: boolean;
  schema: {};
}> {
  static defaultProps = {
    renderRegion: true,
    onChange() {},
  };

  constructor(props) {
    super(props);

    this.state = {
      batch: new Batch(),
      formData: this.props.fieldProps.formData,
    };
    this.state.batch = this.generateBatchFromInput();
  }

  handleBatchChange = (batch) => {
    const { onChange, schema } = this.props.fieldProps;
    const { constraints } = batch.reduce(jsonReducer, []);

    const formData =
      schema?.type === "string" ? JSON.stringify(constraints) : constraints;

    this.setState({ batch, formData }, () => {
      onChange(formData);
    });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.fieldProps.formData !== this.state.formData) {
      const batch = this.generateBatchFromInput(nextProps);

      this.setState({ batch, formData: nextProps.fieldProps.formData });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChanged =
      nextProps.fieldProps.formData !== this.props.fieldProps.formData;
    const stateChanged = nextState.batch !== this.state.batch;

    return propsChanged || stateChanged;
  }

  generateBatchFromInput(props = this.props) {
    const { formData } = props.fieldProps;

    let json;
    try {
      json = JSON.parse(formData);
    } catch (error) {
      return this.state.batch || new Batch();
    }

    const parsedInput = CreateServiceModalFormUtil.stripEmptyProperties(json);

    return jsonParser({ constraints: parsedInput }).reduce(
      (batch, item) => batch.add(item),
      new Batch()
    );
  }

  render() {
    const { errorMessage, renderRegion, fieldProps, label } = this.props;
    const { batch } = this.state;

    const appendToList = (memo, transaction) => memo.concat(transaction);
    const hasBatchErrors = !PlacementValidators.validateNoBatchError(
      batch.reduce(appendToList, [])
    );

    if (hasBatchErrors) {
      const fieldName = this.props.fieldProps.name;
      const fieldValue = this.props.fieldProps.formData;
      const json = { [fieldName]: fieldValue };

      return <JsonField label={label} fieldName={fieldName} json={json} />;
    }

    const data = batch.reduce(formReducer, []);
    const errors = DataValidatorUtil.errorArrayToMap(
      MarathonAppValidators.validateConstraints(batch.reduce(jsonReducer))
    );
    const isRequired = fieldProps.required ? "*" : "";

    return (
      <div className="pod flush-left flush-right flush-top">
        <h2>
          <Trans render="span">Placement</Trans> {isRequired}
          <Tooltip
            content={fieldProps.schema.description}
            interactive={true}
            maxWidth={300}
            wrapText={true}
          >
            <InfoTooltipIcon />
          </Tooltip>
        </h2>
        <BatchContainer batch={batch} onChange={this.handleBatchChange}>
          <PlacementFormPartial
            errors={errors}
            data={data}
            renderRegion={renderRegion}
          />
        </BatchContainer>
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }
}
