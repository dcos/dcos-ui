import { i18nMark } from "@lingui/react";

import {
  SERVER_HEALTHY,
  SERVER_NA,
  SERVER_UNHEALTHY,
  SERVER_WARN
} from "./UnitHealthTypes";

/**
 * sortingValue = Order health types by it's label and number value
 * This will depend on the sorting method/function
 * suggested use is ascending 0 meaning ((top of the list)) more important
 * visibility and 3 meaning least important (bottom of the order)
 */
const UnitHealthStatus = {
  [SERVER_HEALTHY]: {
    title: i18nMark("Healthy"),
    key: "HEALTHY",
    classNames: "text-success",
    sortingValue: 3,
    value: SERVER_HEALTHY
  },
  [SERVER_UNHEALTHY]: {
    title: i18nMark("Unhealthy"),
    key: "UNHEALTHY",
    classNames: "text-danger",
    sortingValue: 0,
    value: SERVER_UNHEALTHY
  },
  [SERVER_WARN]: {
    title: i18nMark("Warning"),
    key: "WAR",
    classNames: "text-warning",
    sortingValue: 2,
    value: SERVER_WARN
  },
  [SERVER_NA]: {
    title: i18nMark("N/A"),
    key: "NA",
    classNames: "text-mute",
    sortingValue: 1,
    value: SERVER_NA
  }
};

module.exports = UnitHealthStatus;
