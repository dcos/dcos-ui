/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import StringUtil from "../utils/StringUtil";
import UserActions from "./UserActions";

const BulkOptions = {
  user: {
    delete: {
      dropdownOption: (
        <span className="text-danger">
          {StringUtil.capitalize(UserActions.DELETE)}
        </span>
      ),
      title: "Are you sure?",
      actionPhrase: `will be ${UserActions.DELETED}`
    }
  }
};

module.exports = BulkOptions;
