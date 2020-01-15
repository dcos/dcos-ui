import { Trans } from "@lingui/macro";
import * as React from "react";
import { Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  purple
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import { findNestedPropertyInObject, isObject } from "#SRC/js/utils/Util";
import AddButton from "#SRC/js/components/form/AddButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import Networking from "#SRC/js/constants/Networking";
import * as ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import VipLabelUtil from "../../utils/VipLabelUtil";

import { FormReducer as networks } from "../../reducers/serviceForm/MultiContainerNetwork";
import ServiceConfigUtil from "../../utils/ServiceConfigUtil";
import { getHostPortPlaceholder, isHostNetwork } from "../../utils/NetworkUtil";
import VirtualNetworksActions from "#SRC/js/events/VirtualNetworksActions";
import { Overlay } from "#SRC/js/structs/Overlay";
import Loader from "#SRC/js/components/Loader";

const { CONTAINER, HOST } = Networking.type;

const renderVirtualNetworkOption = ({ name }: Overlay) => (
  <Trans
    id="Virtual Network: {0}"
    key={name}
    render={<option value={`${CONTAINER}.${name}`} />}
    values={[name]}
  />
);

export default class MultiContainerNetworkingFormSection extends React.Component<{
  data: {
    containers?: Array<{ name: string }>;
    id: string;
    networks?: Array<{ mode?: string; name?: string }>;
    portsAutoAssign: boolean;
  };
  errors: object;
  onAddItem: () => void;
  onRemoveItem: () => void;
}> {
  static configReducers = { networks };

  static defaultProps = {
    data: {},
    errors: {},
    onAddItem() {},
    onRemoveItem() {}
  };

  state: {
    virtualNetworks: Overlay[] | null;
  } = {
    virtualNetworks: null
  };

  componentDidMount() {
    VirtualNetworksActions.fetch(vns => {
      const enabledUCRNetworks = vns.filter(vn => vn.enabled && !vn.subnet6);
      this.setState({ virtualNetworks: enabledUCRNetworks });
    });
  }

  getContainerPortField(endpoint, network, index, containerIndex, errors) {
    if (network !== CONTAINER) {
      return null;
    }

    const containerPortError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.containerPort`
    );

    return (
      <FormGroup
        className="column-3"
        key="container-port"
        showError={Boolean(containerPortError)}
      >
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Container Port</Trans>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FieldInput
          min="0"
          name={`containers.${containerIndex}.endpoints.${index}.containerPort`}
          type="number"
          value={endpoint.containerPort}
        />
        <FieldError>{containerPortError}</FieldError>
      </FormGroup>
    );
  }

  getHostPortFields(endpoint, index, containerIndex) {
    let placeholder;
    const environmentVariableName = getHostPortPlaceholder(endpoint.name, true);
    let value = endpoint.hostPort;
    const { errors } = this.props;
    const hostPortError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.port`
    );

    if (endpoint.automaticPort) {
      placeholder = environmentVariableName;
      value = null;
    }

    const tooltipContent = (
      <Trans render="span">
        This host port will be accessible as an environment variable called{" "}
        {environmentVariableName}.{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/"
          )}
          target="_blank"
        >
          More information
        </a>
        .
      </Trans>
    );

    return [
      <FormGroup
        className="column-4"
        key="host-port"
        showError={Boolean(hostPortError)}
      >
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Host Port</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FieldInput
          disabled={endpoint.automaticPort}
          placeholder={placeholder}
          min="0"
          name={`containers.${containerIndex}.endpoints.${index}.hostPort`}
          type="number"
          value={value}
        />
        <FieldError>{hostPortError}</FieldError>
      </FormGroup>,
      <FormGroup
        className="column-auto flush-left flex flex-direction-top-to-bottom flex-justify-items-end"
        key="assign-automatically"
      >
        <FieldLabel />
        <FieldLabel matchInputHeight={true}>
          <FieldInput
            checked={endpoint.automaticPort}
            name={`containers.${containerIndex}.endpoints.${index}.automaticPort`}
            type="checkbox"
          />
          Assign Automatically
        </FieldLabel>
      </FormGroup>
    ];
  }

  getLoadBalancedServiceAddressField(endpoint, index, containerIndex) {
    const { containerPort, hostPort, loadBalanced, vip } = endpoint;
    const { errors } = this.props;
    let loadBalancedError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.labels`
    );

    if (isObject(loadBalancedError)) {
      loadBalancedError = null;
    }

    let address = vip;
    if (address == null) {
      let port = "";
      if (hostPort != null) {
        port = hostPort;
      }
      if (containerPort != null && containerPort !== "") {
        port = containerPort;
      }
      port = port || "0";

      address = `${this.props.data.id}:${port}`;
    }

    const loadBalancerDocsURI = MetadataStore.buildDocsURI(
      "/deploying-services/service-endpoints/"
    );
    const loadBalancerTooltipContent = (
      <Trans render="span">
        Load balance the service internally (layer 4), and create a service{" "}
        address. For external (layer 7) load balancing, create an external load{" "}
        balancer and attach this service.{" "}
        <a href={loadBalancerDocsURI} target="_blank">
          More Information
        </a>
        .
      </Trans>
    );

    return [
      <FormRow key="lb-address">
        <FormGroup className="column-12" showError={Boolean(loadBalancedError)}>
          <FieldLabel>
            <FieldInput
              checked={loadBalanced}
              name={`containers.${containerIndex}.endpoints.${index}.loadBalanced`}
              type="checkbox"
            />
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">
                  Enable Load Balanced Service Address
                </Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={loadBalancerTooltipContent}
                  interactive={true}
                  maxWidth={300}
                  wrapperClassName="tooltip-wrapper text-align-center"
                  wrapText={true}
                >
                  <InfoTooltipIcon />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldError>{loadBalancedError}</FieldError>
        </FormGroup>
      </FormRow>,
      loadBalanced &&
        this.getLoadBalancedPortField(endpoint, index, containerIndex)
    ];
  }

  getLoadBalancedPortField(endpoint, index, containerIndex) {
    const { errors, data } = this.props;
    const { hostPort, containerPort, vip, vipPort } = endpoint;
    const defaultVipPort = isHostNetwork(this.props.data)
      ? hostPort
      : containerPort;

    // clear placeholder when HOST network portsAutoAssign is true
    const placeholder =
      isHostNetwork(this.props.data) && data.portsAutoAssign
        ? ""
        : defaultVipPort;

    let vipPortError = null;
    let loadBalancedError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.labels`
    );

    const tooltipContent = (
      <Trans render="span">
        This port will be used to load balance this service address internally
      </Trans>
    );
    if (isObject(loadBalancedError)) {
      vipPortError = loadBalancedError[VipLabelUtil.defaultVip(index)];
      loadBalancedError = null;
    }

    let port = "";
    if (!data.portsAutoAssign && !ValidatorUtil.isEmpty(hostPort)) {
      port = hostPort;
    }
    if (!ValidatorUtil.isEmpty(containerPort)) {
      port = containerPort;
    }
    if (!ValidatorUtil.isEmpty(vipPort)) {
      port = vipPort;
    }

    let address = vip ?? `${data.id}:${port}`;
    const vipMatch = address.match(/(.+):\d+/);
    if (vipMatch) {
      address = `${vipMatch[1]}:${port}`;
    }

    const hostName = !vipPortError
      ? ServiceConfigUtil.buildHostNameFromVipLabel(address, port)
      : null;

    const helpText = (
      <FieldHelp>
        <Trans render="span">
          Load balance this service internally at {hostName}
        </Trans>
      </FieldHelp>
    );

    return (
      <FormRow key="lb-port">
        <FormGroup className="column-12">
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Load Balanced Port</Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={tooltipContent}
                  interactive={true}
                  maxWidth={300}
                  wrapText={true}
                >
                  <InfoTooltipIcon />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FormRow>
            <FormGroup
              className="column-3"
              key="vip-port"
              showError={Boolean(vipPortError)}
            >
              <FieldAutofocus>
                <FieldInput
                  min="1"
                  placeholder={placeholder}
                  name={`containers.${containerIndex}.endpoints.${index}.vipPort`}
                  type="number"
                  value={vipPort}
                />
              </FieldAutofocus>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup className="column-12" showError={Boolean(vipPortError)}>
              <FieldError>{vipPortError}</FieldError>
              {!vipPortError && helpText}
            </FormGroup>
          </FormRow>
        </FormGroup>
      </FormRow>
    );
  }

  getProtocolField(endpoint, index, containerIndex) {
    const { errors } = this.props;
    const protocolError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.protocol`
    );

    const assignTooltip = (
      <Trans render="span">
        Most services will use TCP.{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/"
          )}
          target="_blank"
        >
          More information
        </a>
        .
      </Trans>
    );

    return (
      <FormGroup className="column-3" showError={Boolean(protocolError)}>
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Protocol</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={assignTooltip}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FormRow>
          <FormGroup className="column-auto" key="protocol-udp">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={endpoint.protocol.udp}
                name={`containers.${containerIndex}.endpoints.${index}.protocol.udp`}
                type="checkbox"
              />
              UDP
            </FieldLabel>
          </FormGroup>
          <FormGroup className="column-auto" key="protocol-tcp">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={endpoint.protocol.tcp}
                name={`containers.${containerIndex}.endpoints.${index}.protocol.tcp`}
                type="checkbox"
              />
              TCP
            </FieldLabel>
          </FormGroup>
        </FormRow>
        <FieldError>{protocolError}</FieldError>
      </FormGroup>
    );
  }

  getServiceContainerEndpoints(endpoints = [], containerIndex) {
    const network = findNestedPropertyInObject(
      this.props.data,
      "networks.0.mode"
    );
    const { errors } = this.props;

    return endpoints.map((endpoint, index) => {
      const nameError = findNestedPropertyInObject(
        errors,
        `containers.${containerIndex}.endpoints.${index}.name`
      );

      return (
        <FormGroupContainer
          key={index}
          onRemove={this.props.onRemoveItem.bind(this, {
            value: index,
            path: `containers.${containerIndex}.endpoints`
          })}
        >
          <FormRow key="port-name-group">
            {this.getContainerPortField(
              endpoint,
              network,
              index,
              containerIndex,
              errors
            )}
            <FormGroup
              className="column-6"
              key="endpoint-name"
              showError={Boolean(nameError)}
            >
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Service Endpoint Name</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`containers.${containerIndex}.endpoints.${index}.name`}
                type="text"
                value={endpoint.name}
              />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </FormRow>
          <FormRow key="host-protocol">
            {this.getHostPortFields(endpoint, index, containerIndex)}
            {this.getProtocolField(endpoint, index, containerIndex)}
          </FormRow>
          {this.getLoadBalancedServiceAddressField(
            endpoint,
            index,
            containerIndex
          )}
        </FormGroupContainer>
      );
    });
  }

  getServiceEndpoints() {
    const { containers } = this.props.data;
    const { handleTabChange } = this.props;

    if (!containers || !containers.length) {
      return (
        <div>
          <Trans render="p">
            Please{" "}
            <a
              onClick={handleTabChange.bind(null, "services")}
              className="clickable"
            >
              add a container
            </a>{" "}
            before configuring Endpoints.
          </Trans>
        </div>
      );
    }

    return containers.map((container, index) => {
      const { endpoints = [] } = container;

      return (
        <div key={index}>
          <h3 className="short-bottom">
            <Icon
              shape={SystemIcons.Container}
              size={iconSizeXs}
              color={purple}
            />
            {` ${container.name}`}
          </h3>
          {this.getServiceContainerEndpoints(endpoints, index)}
          <div>
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                path: `containers.${index}.endpoints`
              })}
            >
              <Trans render="span">Add Service Endpoint</Trans>
            </AddButton>
          </div>
        </div>
      );
    });
  }

  getTypeSelections() {
    const { mode, name } = this.props.data?.networks?.[0] || {};
    const selectedValue = name ? `${mode}.${name}` : mode;

    return (
      <FieldSelect name="networks.0" value={selectedValue}>
        <Trans key="host" id="Host" render={<option value={HOST} />} />
        <option value={`${CONTAINER}.calico`}>Virtual Network: Calico</option>
        {this.state.virtualNetworks.map(renderVirtualNetworkOption)}
      </FieldSelect>
    );
  }

  render() {
    if (this.state.virtualNetworks === null) {
      return <Loader />;
    }

    const networkError = findNestedPropertyInObject(
      this.props.errors,
      "container.docker.network"
    );

    const networkTypeTooltipContent = (
      <Trans render="span">
        Refer to the{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/"
          )}
          target="_blank"
        >
          ports documentation
        </a>{" "}
        for more information.
      </Trans>
    );

    const serviceEndpointsDocsURI = MetadataStore.buildDocsURI(
      "/deploying-services/service-endpoints/"
    );
    const serviceEndpointsTooltipContent = (
      <Trans render="span">
        Service endpoints map traffic from a single VIP to multiple IP addresses{" "}
        and ports.{" "}
        <a href={serviceEndpointsDocsURI} target="_blank">
          More Information
        </a>
        .
      </Trans>
    );

    return (
      <div className="form flush-bottom">
        <h1 className="flush-top short-bottom">
          <Trans render="span">Networking</Trans>
        </h1>
        <Trans render="p">Configure the networking for your service.</Trans>
        <FormRow>
          <FormGroup className="column-6" showError={Boolean(networkError)}>
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans render="span">Network Type</Trans>
                </FormGroupHeadingContent>
                <FormGroupHeadingContent>
                  <Tooltip
                    content={networkTypeTooltipContent}
                    interactive={true}
                    maxWidth={300}
                    wrapText={true}
                  >
                    <InfoTooltipIcon />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            {this.getTypeSelections()}
            <FieldHelp>
              <Trans render="span">
                The network type will be shared across all your containers.
              </Trans>
            </FieldHelp>
            <FieldError>{networkError}</FieldError>
          </FormGroup>
        </FormRow>
        <h2 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Service Endpoints</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={serviceEndpointsTooltipContent}
                interactive={true}
                maxWidth={300}
                wrapperClassName="tooltip-wrapper text-align-center"
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h2>
        <Trans render="p">
          DC/OS can automatically generate a Service Address to connect to each{" "}
          of your load balanced endpoints
        </Trans>
        {this.getServiceEndpoints()}
      </div>
    );
  }
}
