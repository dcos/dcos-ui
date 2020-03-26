import * as React from "react";
import { Trans } from "@lingui/macro";

import {
  QuotaFieldLabels,
  quotaFields,
  QuotaFields,
  QuotaFieldUnit,
} from "#PLUGINS/services/src/js/types/Quota";
import {
  GroupFormData,
  GroupFormErrors,
} from "#PLUGINS/services/src/js/types/GroupForm";
import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import ServiceValidatorUtil from "#PLUGINS/services/src/js/utils/ServiceValidatorUtil";

import * as ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { OvercommittedQuotaResource } from "#PLUGINS/services/src/js/data/errors/OvercommitQuotaError";

export function emptyGroupFormData(): GroupFormData {
  return {
    id: "",
    enforceRole: true,
    quota: {
      force: false,
      cpus: "",
      mem: "",
      disk: "",
      gpus: "",
    },
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
      gpus: gpus !== undefined ? gpus + "" : "",
    },
  };
}

export function getPathFromGroupId(id: string): string {
  if (id.startsWith("/")) {
    return id;
  }
  return `/${id}`;
}

function addFormError(
  errors: GroupFormErrors,
  formError: JSX.Element
): GroupFormErrors {
  if (!errors.form) {
    errors.form = [];
  }
  errors.form.push(formError);
  return errors;
}

function setQuotaError(
  errors: GroupFormErrors,
  field: QuotaFields,
  error: JSX.Element
): GroupFormErrors {
  if (!errors.quota) {
    errors.quota = {};
  }
  errors.quota[field] = error;
  return errors;
}

export function validateGroupFormData(
  data: GroupFormData,
  isEdit: boolean
): void | {} {
  let errors: GroupFormErrors = {};
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
        errors,
        <Trans>
          Group name must be at least 1 character and may only contain digits
          (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may
          not begin or end with a dash or dot.
        </Trans>
      );
    }
  }

  // Validate Quota values
  for (const field of quotaFields) {
    const value = (data.quota[field] + "").trim();
    if (ValidatorUtil.isEmpty(value)) {
      continue;
    }
    if (!ValidatorUtil.isNumber(value)) {
      errors = setQuotaError(errors, field, <Trans>Must be a number</Trans>);
      addFormError(
        errors,
        <Trans>{QuotaFieldLabels[field]} must be a number</Trans>
      );
    } else {
      const numberValue = parseFloat(value);
      if (numberValue < 0) {
        errors = setQuotaError(
          errors,
          field,
          <Trans>Must be bigger than or equal to 0</Trans>
        );
        addFormError(
          errors,
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

export function errorsFromOvercommitData(
  data: OvercommittedQuotaResource[] | null
): GroupFormErrors {
  if (data === null) {
    return {
      form: [
        <Trans key="quotaOvercommit">
          Quota value(s) exceed currently consumed resources. Please save again
          to force Quota limits.
        </Trans>,
      ],
    };
  }
  let result: GroupFormErrors = {};
  data.forEach((resource) => {
    const resourceName = resource.resourceName as QuotaFields;
    result = addFormError(
      result,
      <Trans key={`resourceOvercommit-${resourceName}`}>
        {QuotaFieldLabels[resourceName]} exceeds limit. Press save again to
        force {QuotaFieldLabels[resourceName]} limit.
      </Trans>
    );
    const { consumed, requestedLimit } = resource;
    const unit = QuotaFieldUnit[resourceName];
    result = setQuotaError(
      result,
      resourceName,
      <Trans>
        Exceeds limit ({requestedLimit} of {consumed} {unit})
      </Trans>
    );
  });

  return result;
}
