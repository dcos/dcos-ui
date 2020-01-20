import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

import MetadataStore from "#SRC/js/stores/MetadataStore";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import Service from "#PLUGINS/services/src/js/structs/Service";

const ServiceEditMessage = ({ service }) => {
  const command = `dcos ${
    service.getLabels().DCOS_PACKAGE_NAME
  } --name=${service.getId()} update start --options=options.json`;

  return (
    <div>
      <Trans render="p">
        To update this service's configuration, please update{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/config-universe-service/"
          )}
          target="_blank"
        >
          options.json
        </a>
        . Run the following CLI command:
      </Trans>
      <div className="code-copy-wrapper">
        <div className="code-copy-icon">
          <ClipboardTrigger
            className="clickable"
            copyText={command}
            useTooltip={true}
          >
            <Icon
              shape={SystemIcons.Clipboard}
              size={iconSizeXs}
              color={greyDark}
            />
          </ClipboardTrigger>
        </div>
        <pre className="prettyprint flush-bottom prettyprinted">{command}</pre>
      </div>
    </div>
  );
};

ServiceEditMessage.propTypes = {
  service: PropTypes.instanceOf(Service).isRequired
};

export default ServiceEditMessage;
