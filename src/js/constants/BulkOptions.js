/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";

const BulkOptions = {
  user: {
    delete: {
      dropdownOption: (
        <Trans render="span" className="text-danger">
          Delete
        </Trans>
      ),
      title: i18nMark("Are you sure?"),
      actionPhrase: i18nMark("will be deleted")
    }
  }
};

export default BulkOptions;
