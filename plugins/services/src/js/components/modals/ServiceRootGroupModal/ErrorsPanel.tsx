import * as React from "react";
import { Trans } from "@lingui/macro";
import { Icon, InfoBoxInline } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

interface ErrorsPanelProps {
  errors?: JSX.Element[];
}

export default (props: ErrorsPanelProps): JSX.Element | null => {
  const { errors } = props;
  if (!errors || errors.length === 0) {
    return null;
  }

  const errorItems = errors.map((element, index) => {
    const itemKey = element.props.key ? element.props.key : index;
    return (
      <li key={itemKey} className="errorsAlert-listItem">
        {element}
      </li>
    );
  });
  return (
    <div className="infoBoxWrapper">
      <InfoBoxInline
        appearance="danger"
        message={
          <div className="flex">
            <div>
              <Icon
                shape={SystemIcons.CircleClose}
                size={iconSizeXs}
                color="currentColor"
              />
            </div>
            <div className="errorsAlert-message">
              <Trans render="h4">
                An error occurred with your configuration.
              </Trans>
              <ul className="errorsAlert-list">{errorItems}</ul>
            </div>
          </div>
        }
      />
    </div>
  );
};
