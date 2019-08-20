import * as React from "react";
import { Trans } from "@lingui/macro";

import {
  QuotaFieldLabels,
  quotaFields,
  QuotaFields
} from "#PLUGINS/services/src/js/types/Quota";
import {
  GroupFormData,
  GroupFormErrors
} from "#PLUGINS/services/src/js/types/GroupForm";
import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import ServiceValidatorUtil from "#PLUGINS/services/src/js/utils/ServiceValidatorUtil";

import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

export function emptyGroupFormData(): GroupFormData {
  return {
    id: "",
    enforceRole: true,
    quota: {
      force: false,
      cpus: "",
      mem: "",
      disk: "",
      gpus: ""
    }
  };
}

export function groupFormDataFromGraphql(data: ServiceGroup): GroupFormData {
  const quota = data.quota;
  const enforceRole = findNestedPropertyInObject(quota, "enforced");
  const cpus = findNestedPropertyInObject(quota, "cpus.limit");
  const mem = findNestedPropertyInObject(quota, "memory.limit");
  const disk = findNestedPropertyInObject(quota, "disk.limit");
  const gpus = findNestedPropertyInObject(quota, "gpus.limit");
  return {
    id: data.id || "",
    enforceRole: enforceRole !== undefined ? enforceRole : true,
    quota: {
      force: false,
      cpus: cpus !== undefined ? cpus + "" : "",
      mem: mem !== undefined ? mem + "" : "",
      disk: disk !== undefined ? disk + "" : "",
      gpus: gpus !== undefined ? gpus + "" : ""
    }
  };
}

export function getPathFromGroupId(id: string): string {
  if (id.startsWith("/")) {
    return id;
  }
  return `/${id}`;
}

export function validateGroupFormData(
  data: GroupFormData,
  isEdit: boolean
): void | {} {
  const errors: GroupFormErrors = {};
  const addFormError = (error: JSX.Element) => {
    if (!errors.form) {
      errors.form = [];
    }
    errors.form.push(error);
  };
  if (!isEdit) {
    // Validate Name
    if (!ServiceValidatorUtil.isValidGroupID(data.id)) {
      errors.id = (
        <Trans>
          Name must be at least 1 character and may only contain digits (0-9),
          dashes (-), dots (.), and lowercase letters (a-z). The name may not
          begin or end with a dash or dot.
        </Trans>
      );
      addFormError(
        <Trans>
          Group name must be at least 1 character and may only contain digits
          (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may
          not begin or end with a dash or dot.
        </Trans>
      );
    }
  }

  //Validate Quota values
  const setQuotaError = (field: QuotaFields, error: JSX.Element) => {
    if (!errors.quota) {
      errors.quota = {};
    }
    errors.quota[field] = error;
  };
  for (const field of quotaFields) {
    const value = (data.quota[field] + "").trim();
    if (ValidatorUtil.isEmpty(value)) {
      continue;
    }
    if (!ValidatorUtil.isNumber(value)) {
      setQuotaError(field, <Trans>Must be a number</Trans>);
      addFormError(<Trans>{QuotaFieldLabels[field]} must be a number</Trans>);
    } else {
      const numberValue = parseFloat(value);
      if (numberValue < 0) {
        setQuotaError(field, <Trans>Must be bigger than or equal to 0</Trans>);
        addFormError(
          <Trans>
            {QuotaFieldLabels[field]} must be bigger than or equal to 0
          </Trans>
        );
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }
}
