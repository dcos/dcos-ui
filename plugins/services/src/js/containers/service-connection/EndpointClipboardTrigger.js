import PropTypes from "prop-types";
import React from "react";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyLightDarken1,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

class EndpointClipboardTrigger extends React.Component {
  render() {
    const { command } = this.props;

    return (
      <div className="code-copy-wrapper">
        <div className="code-copy-icon tight">
          <ClipboardTrigger
            className="clickable"
            copyText={command}
            useTooltip={true}
          >
            <Icon
              shape={SystemIcons.Clipboard}
              size={iconSizeXs}
              color={greyLightDarken1}
            />
          </ClipboardTrigger>
        </div>
        {command}
      </div>
    );
  }
}

EndpointClipboardTrigger.propTypes = {
  command: PropTypes.string.isRequired
};

export default EndpointClipboardTrigger;
