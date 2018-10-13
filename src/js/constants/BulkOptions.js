/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { i18nMark } from "@lingui/react";

const BulkOptions = {
  user: {
    delete: {
      dropdownOption: {
        content: i18nMark("Delete"),
        element: "span",
        className: "text-danger"
      },
      title: i18nMark("Are you sure?"),
      actionPhrase: i18nMark("will be deleted")
    }
  }
};

module.exports = BulkOptions;
