import * as React from "react";
import { Trans } from "@lingui/macro";
import FormRow from "./FormRow";
import DeleteRowButton from "./DeleteRowButton";
import FormGroup from "./FormGroup";
import AddButton from "./AddButton";
import FieldInput from "./FieldInput";
import FieldError from "./FieldError";
import FieldLabel from "./FieldLabel";
import FormGroupHeading from "./FormGroupHeading";
import FormGroupHeadingContent from "./FormGroupHeadingContent";

// adds a [key, value]-tuple to an object as a prop and returns the object
// tslint:disable-next-line:prefer-object-spread
const zipAssign = (obj, [key, value]) => Object.assign(obj, { [key]: value });
const noop = () => {};

const onInput = (fn) => (e) => {
  e.preventDefault();
  e.stopPropagation();
  fn(e?.currentTarget?.value);
};

const emptyKey = <Trans id="The key cannot be empty." />;

type KVData = Array<[string, string]>;
const renderObjForm = (
  // imagine someone writes a key that already exists, we want to preserve that line. thus our internal model is an array.
  data: KVData,
  onChange: (a: KVData) => void,
  errors: Record<number, string | undefined>
) =>
  data.map(([key = "", value = ""], index) => {
    const update = (i) => (x) => {
      data[index][i] = x;
      // tslint:disable-next-line:prefer-object-spread
      onChange(Object.assign([], data, { [index]: data[index] }));
    };
    const removeRow = () => onChange(data.filter((_, i) => i !== index));

    return (
      <FormRow key={index}>
        <FormGroup className="column-6" showError={!key && !!value}>
          <FieldInput value={key} onChange={onInput(update(0))} />
          <FieldError>{emptyKey}</FieldError>
          <span className="emphasis form-colon">:</span>
        </FormGroup>
        <FormGroup className="column-6" showError={!!errors[index]}>
          <FieldInput value={value} onChange={onInput(update(1))} />
          <FieldError>{errors[index]}</FieldError>
        </FormGroup>
        <FormGroup hasNarrowMargins={true}>
          <DeleteRowButton onClick={removeRow} />
        </FormGroup>
      </FormRow>
    );
  });

const Heading = ({ children }) => (
  <FormGroup className="column-6 short-bottom">
    <FieldLabel>
      <FormGroupHeading>
        <FormGroupHeadingContent primary={true}>
          {children}
        </FormGroupHeadingContent>
      </FormGroupHeading>
    </FieldLabel>
  </FormGroup>
);

export default function KVForm(props: {
  data: Record<string, string>;
  onChange: (a: Record<string, string>) => void;
  errors: Record<number, string | undefined>;
  label: React.ReactNode;
}) {
  const { label, data, onChange, errors } = props;
  const [state, setState] = React.useState<KVData>(Object.entries(data || {}));
  const [prevData, setPrevData] = React.useState(data);
  if (data !== prevData) {
    setPrevData(data);
    setState(Object.entries(data));
  }
  const update = (model: KVData) => {
    setState(model);
    Object.keys(data).forEach((k) => delete data[k]);
    // it's important to use data here, to not trigger the resetting mechanism above.
    onChange(model.reduce(zipAssign, data));
  };

  const onAdd = () => update(state.concat([["", ""]]));
  return (
    <div>
      <label>{label}</label>
      {state.length ? (
        <FormRow>
          <Heading>
            <Trans render="span">Key</Trans>
          </Heading>
          <Heading>
            <Trans render="span">Value</Trans>
          </Heading>
          {/* add a fake-button here, so flexbox calculates the widths of the labels above like it does on the following rows */}
          <div style={{ visibility: "hidden", height: "0" }}>
            <DeleteRowButton onClick={noop} />
          </div>
        </FormRow>
      ) : null}
      {renderObjForm(state, update, errors)}
      <FormRow>
        <FormGroup className="column-12">
          <AddButton onClick={onAdd}>
            <Trans id="Add entry" />
          </AddButton>
        </FormGroup>
      </FormRow>
    </div>
  );
}
