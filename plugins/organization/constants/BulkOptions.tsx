import { Trans } from "@lingui/macro";

import * as React from "react";

const BulkOptions = {
  group: {
    add: {
      dropdownOption: <Trans render="span">Add to Group</Trans>,
      title: <Trans render="span">Add User To Group</Trans>,
      actionPhrase: <Trans render="span">Selected Group is</Trans>,
      phraseFirst: true
    },
    remove: {
      dropdownOption: <Trans render="span">Remove from Group</Trans>,
      title: <Trans render="span">Remove User From Group</Trans>,
      actionPhrase: <Trans render="span">Selected Group is</Trans>,
      phraseFirst: true
    },
    delete: {
      dropdownOption: (
        <Trans render="span" className="text-danger">
          Delete
        </Trans>
      ),
      title: <Trans render="span">Delete Group</Trans>,
      actionPhrase: <Trans render="span">group will be deleted</Trans>
    }
  },
  serviceAccount: {
    add: {
      dropdownOption: <Trans render="span">Add to Group</Trans>,
      title: <Trans render="span">Add To Group</Trans>,
      actionPhrase: <Trans render="span">Selected Service is</Trans>,
      phraseFirst: true
    },
    remove: {
      dropdownOption: <Trans render="span">Remove from Group</Trans>,
      title: <Trans render="span">Remove From Group</Trans>,
      actionPhrase: <Trans render="span">Selected Service is</Trans>,
      phraseFirst: true
    },
    delete: {
      dropdownOption: (
        <Trans render="span" className="text-danger">
          Delete
        </Trans>
      ),
      title: <Trans render="span">Delete Service Account</Trans>,
      actionPhrase: <Trans render="span">service account will be deleted</Trans>
    }
  },
  user: {
    add: {
      dropdownOption: <Trans render="span">Add To Group</Trans>,
      title: <Trans render="span">Add User to Group</Trans>,
      actionPhrase: <Trans render="span">Selected User is</Trans>,
      phraseFirst: true
    },
    remove: {
      dropdownOption: <Trans render="span">Remove From Group</Trans>,
      title: <Trans render="span">Remove User From Group</Trans>,
      actionPhrase: <Trans render="span">Selected User is</Trans>,
      phraseFirst: true
    },
    delete: {
      dropdownOption: (
        <Trans render="span" className="text-danger">
          Delete
        </Trans>
      ),
      title: <Trans render="span">Delete User</Trans>,
      actionPhrase: <Trans render="span">user will be deleted</Trans>
    }
  }
};

export default BulkOptions;
