import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import React from "react";

const OperatorTypes = {
  UNIQUE: {
    requiresValue: false,
    requiresEmptyValue: true,
    stringNumberValue: false,
    tooltipContent: (
      <Trans render="span">The unique operator does not accept a value.</Trans>
    ),
    name: i18nMark("Unique"),
    description: i18nMark("Run each app task on a unique attribute ID")
  },
  CLUSTER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: i18nMark("Cluster"),
    description: i18nMark(
      "Run app tasks on nodes that share a certain attribute ID"
    )
  },
  GROUP_BY: {
    requiresValue: false,
    requiresEmptyValue: false,
    stringNumberValue: true,
    tooltipContent: null,
    name: i18nMark("Group By"),
    description: i18nMark(
      "Run app tasks evenly distributed across a certain attribute"
    )
  },
  IS: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: i18nMark("Is"),
    description: i18nMark(
      "Run app tasks on nodes having attribute ID with a specific value"
    )
  },
  LIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: i18nMark("Like"),
    description: i18nMark("Run app tasks on a particular set of attribute IDs")
  },
  UNLIKE: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: false,
    tooltipContent: null,
    name: i18nMark("Unlike"),
    description: i18nMark(
      "Don't run app tasks on a particular set of attribute IDs"
    )
  },
  MAX_PER: {
    requiresValue: true,
    requiresEmptyValue: false,
    stringNumberValue: true,
    tooltipContent: null,
    name: i18nMark("Max Per"),
    description: i18nMark("Run max number of app tasks on each attribute ID")
  }
};

export default OperatorTypes;
