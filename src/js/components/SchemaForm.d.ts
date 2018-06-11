import mixin from "reactjs-mixin";
import { ReactElement, Component } from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

type SchemaDefinition = any[];

interface SchemaFormProps {
  getTriggerSubmit: (handler: () => void) => void;
  schema: object;
  packageIcon: string;
  packageName: string;
  packageVersion: string;
}
export interface DataTriple {
  isValidated: boolean;
  model: object;
  definition: object[];
}

export default class SchemaForm<SchemaFormProps> extends Component<
  SchemaFormProps
> {
  handleFormChange(formData: object, eventObj: object): void;
  handleExternalSubmit(): DataTriple;
  handleRemoveRow(definition: SchemaDefinition, prop: string, id: Number): void;
  handleTabClick(): void;
  handleAddRow(
    prop: string,
    definition: SchemaDefinition,
    newDefinition: SchemaDefinition,
    index: Number
  ): void;
  getAddNewRowButton(
    prop: string,
    generalDefinition: SchemaDefinition,
    definition: SchemaDefinition,
    labelText: string
  ): ReactElement<any>;
  getIndexFromDefinition(definition: SchemaDefinition): Number;
  getRemoveRowButton(
    generalDefinition: SchemaDefinition,
    prop: string,
    id: Number,
    title?: string
  ): ReactElement<any>;
  getDataTriple(): DataTriple;
  getNewDefinition(model: object): object;
  getTriggerTabFormSubmit(submitTrigger: () => void): void;
  validateForm(): boolean;
  getSubHeader(
    name: string,
    description: string,
    levelsDeep: Number
  ): ReactElement<any>;
  getLabel(
    description: string,
    label: string,
    fieldType: string
  ): ReactElement<any>;
  getFormHeader(): ReactElement<any>;
}
