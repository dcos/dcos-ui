import { i18nMark } from "@lingui/react";

import { ConstraintOperator } from "./JobFormData";

interface OperatorData {
  requiresValue: boolean;
  requiresEmptyValue: boolean;
  stringNumberValue: boolean;
  tooltipContent: string | React.ReactNode | null;
  name: string;
  description: string;
}

export const OperatorTypes: { [key in ConstraintOperator]: OperatorData } = {
  [ConstraintOperator.Is]: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: i18nMark("Is"),
    description: i18nMark(
      "Run job on nodes having attribute ID with a specific value"
    )
  },
  [ConstraintOperator.Like]: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: i18nMark("Like"),
    description: i18nMark("Run job on a particular set of attribute IDs")
  },
  [ConstraintOperator.Unlike]: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: i18nMark("Unlike"),
    description: i18nMark("Don't run job on a particular set of attribute IDs")
  }
};
