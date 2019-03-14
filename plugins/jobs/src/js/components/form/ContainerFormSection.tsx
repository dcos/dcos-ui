import * as React from "react";
import { Trans } from "@lingui/macro";
import { InfoBoxInline, Badge } from "@dcos/ui-kit";

import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import { FormOutput, FormError, Container } from "./helpers/JobFormData";
import ParametersSection from "./ParametersSection";
import ArgsSection from "./ArgsSection";

interface ContainerSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

class ContainerFormSection extends React.Component<ContainerSectionProps> {
  constructor(props: ContainerSectionProps) {
    super(props);
  }

  getDisabledBanner() {
    const { formData } = this.props;
    const message = (
      <Trans>
        Container options disabled. Select Container Image in general tab to
        enable.
      </Trans>
    );
    return (
      formData.cmdOnly && (
        <InfoBoxInline appearance="warning" message={message} />
      )
    );
  }

  getRadioButtons() {
    const { formData } = this.props;

    return (
      <FormGroup>
        <FieldLabel>
          <FieldInput
            checked={!formData.cmdOnly && formData.container === Container.UCR}
            name="container"
            type="radio"
            value={Container.UCR}
            disabled={formData.cmdOnly}
          />
          <div className="flex flex-align-items-center">
            <Trans>Universal Container Runtime (UCR)</Trans>
            <span className="runtimeLabel-badge">
              <Badge>
                <Trans>Recommended</Trans>
              </Badge>
            </span>
          </div>
          <FieldHelp>
            <Trans>
              Universal Container Runtime using native Mesos engine. Supports
              GPU resources.
            </Trans>
          </FieldHelp>
        </FieldLabel>
        <FieldLabel>
          <FieldInput
            checked={
              !formData.cmdOnly && formData.container === Container.Docker
            }
            name="container"
            type="radio"
            value={Container.Docker}
            disabled={formData.cmdOnly}
          />
          <Trans>Docker Engine</Trans>
          <FieldHelp>
            <Trans>
              Docker's container runtime. No support for GPU resources and
              requires image.
            </Trans>
          </FieldHelp>
        </FieldLabel>
      </FormGroup>
    );
  }

  getAdvancedSettings() {
    const {
      formData,
      errors,
      showErrors,
      onAddItem,
      onRemoveItem
    } = this.props;
    const selectedContainer = formData.container;

    return (
      <div>
        <FieldLabel>
          <FieldInput
            checked={!formData.cmdOnly && formData.imageForcePull}
            name="imageForcePull"
            type="checkbox"
            value={formData.imageForcePull}
            disabled={formData.cmdOnly}
          />
          <Trans>Force Pull Image On Launch</Trans>
          <FieldHelp>
            <Trans>
              Force Docker to pull the image before launching each instance.
            </Trans>
          </FieldHelp>
        </FieldLabel>
        {!formData.cmdOnly &&
          selectedContainer === Container.Docker && (
            <div>
              <FieldLabel>
                <FieldInput
                  checked={!formData.cmdOnly && formData.grantRuntimePrivileges}
                  name="grantRuntimePrivileges"
                  type="checkbox"
                  value={formData.grantRuntimePrivileges}
                  disabled={formData.cmdOnly}
                />
                <Trans>Grant Runtime Privileges</Trans>
                <FieldHelp>
                  <Trans>
                    By default, containers are "underprivileged" and cannot, for
                    example, run a Docker daemon inside a Docker container.
                  </Trans>
                </FieldHelp>
              </FieldLabel>
              <div className="form-inner-section">
                <Trans render="p">Docker parameters</Trans>
                <ParametersSection
                  formData={formData}
                  errors={errors}
                  showErrors={showErrors}
                  onAddItem={onAddItem}
                  onRemoveItem={onRemoveItem}
                />
              </div>
              <div className="form-inner-section">
                <ArgsSection
                  formData={formData}
                  errors={errors}
                  showErrors={showErrors}
                  onAddItem={onAddItem}
                  onRemoveItem={onRemoveItem}
                />
              </div>
            </div>
          )}
      </div>
    );
  }

  render() {
    return (
      <div className="form-section">
        {this.getDisabledBanner()}
        <Trans render="h1" className="short-bottom">
          Container Runtime
        </Trans>
        <Trans render="p">
          The container runtime is responsible for running your job. We support
          the Docker Engine and Universal Container Runtime (UCR).
        </Trans>
        {this.getRadioButtons()}
        <Trans render="h2" className="short-bottom">
          Advanced Settings
        </Trans>
        <Trans render="p">
          Advanced settings related to the runtime you have selected above.
        </Trans>
        {this.getAdvancedSettings()}
      </div>
    );
  }
}

export default ContainerFormSection;
