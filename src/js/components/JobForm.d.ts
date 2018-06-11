import * as PropTypes from "prop-types";

import SchemaForm, { DataTriple } from "./SchemaForm";

interface JobFormProps {
  className?: string;
  defaultTab?: string;
  isEdit?: boolean;
  onChange?: (event: { model: object }) => void;
  onTabChange?: (tab: string) => void;
  getTriggerSubmit: (submitFunction: () => DataTriple) => any;
  model: object | null;
  schema?: object;
}

export default class JobForm extends SchemaForm<JobFormProps> {
  shouldUpdateDefinition(
    changes: object,
    eventType: string,
    fieldName: string
  ): boolean;
  handleFormChange(changes: object, eventObj: object): void;
  validateForm(): boolean;
  getNewDefinition(model: object): object;
}
