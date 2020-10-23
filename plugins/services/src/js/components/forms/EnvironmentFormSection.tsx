import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";
import * as React from "react";

import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import KVForm from "#SRC/js/components/form/KVForm";

export default class extends React.Component<{
  data: {};
  onChange: (e: any) => void;
}> {
  static configReducers = {
    env: (state = {}, { path, value }) =>
      (path || []).join(".") === "env" ? value : state,
    labels: (state = {}, { path, value }) =>
      (path || []).join(".") === "labels" ? value : state,
  };

  render() {
    const { data } = this.props;

    // prettier-ignore
    const envTooltipContent = (
      <Trans render="span">
        DC/OS also exposes environment variables for host ports and metdata.{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/#environment-variables"
          )}
          target="_blank"
        >
          More information
        </a>.
      </Trans>
    );
    // prettier-ignore
    const labelsTooltipContent = (
      <Trans render="span">
        For example, you could label services “staging” and “production” to mark{" "}
        them by their position in the pipeline.{" "}
        <a
          href={MetadataStore.buildDocsURI("/tutorials/task-labels/")}
          target="_blank"
        >
          More information
        </a>.
      </Trans>
    );

    const update = (name) => (value) =>
      void this.props.onChange({ target: { name, value } });

    return (
      <div>
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Environment</Trans>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <Trans render="p">
          Configure any environment values to be attached to each instance that{" "}
          is launched.
        </Trans>
        <h2 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Environment Variables</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={envTooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h2>
        <Trans render="p">
          Set up environment variables for each instance your service launches.
        </Trans>
        <KVForm
          data-cy="env"
          data={data.env}
          onChange={update("env")}
          addText={<Trans id="Add Environment Variable" />}
        />
        <h2 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Labels</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={labelsTooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h2>
        <Trans render="p">
          Attach metadata to expose additional information to other services.
        </Trans>
        <KVForm
          data-cy="labels"
          data={data.labels}
          onChange={update("labels")}
          addText={<Trans id="Add Label" />}
        />
      </div>
    );
  }
}
