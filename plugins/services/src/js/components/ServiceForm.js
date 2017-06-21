import { Hooks } from "PluginSDK";
import React from "react";

import FormUtil from "../../../../../src/js/utils/FormUtil";
import HostUtil from "../utils/HostUtil";
import Networking from "../../../../../src/js/constants/Networking";
import Icon from "../../../../../src/js/components/Icon";
import SchemaForm from "../../../../../src/js/components/SchemaForm";
import SchemaFormUtil from "../../../../../src/js/utils/SchemaFormUtil";
import SchemaUtil from "../../../../../src/js/utils/SchemaUtil";
import StringUtil from "../../../../../src/js/utils/StringUtil";
import VirtualNetworksStore
  from "../../../../../src/js/stores/VirtualNetworksStore";

const METHODS_TO_BIND = [
  "handleFormChange",
  "onVirtualNetworksStoreSuccess",
  "validateForm"
];

const DUPLICABLE_FIELDS_TO_WATCH = {
  healthChecks: {
    fields: ["protocol", "portType"],
    forceUpdate: true
  },
  ports: {
    fields: ["loadBalanced", "protocol"],
    // Watch name to update the virtual network port exposure
    // Watch lbPort to update Service Address port on bridged networks
    blurOnly: ["name", "lbPort"],
    forceUpdate: true
  }
};

const FIELDS_TO_WATCH = {
  networkType: {
    forceUpdate: true
  },
  image: {
    forceUpdate: false
  }
};

class ServiceForm extends SchemaForm {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.store_listeners = Hooks.applyFilter("serviceFormStoreListeners", [
      {
        name: "virtualNetworks",
        events: ["success"],
        suppressUpdate: true
      }
    ]);
  }

  componentWillMount() {
    this.multipleDefinition = this.getNewDefinition();
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    Hooks.doAction("serviceFormMount", this);
    // Update definition and build model
    this.updateDefinitions();
    this.recalculateFormModelAndRender(true, 0);
  }

  onVirtualNetworksStoreSuccess() {
    this.updateDefinitions();
  }

  shouldUpdateDefinition(changes, eventType, fieldName) {
    const propKey = FormUtil.getPropKey(fieldName);
    const blurChange = Object.values(DUPLICABLE_FIELDS_TO_WATCH).some(function(
      item
    ) {
      return item.blurOnly && item.blurOnly.includes(propKey);
    });

    return (
      Object.keys(changes).some(function(changeKey) {
        const tab = FormUtil.getProp(changeKey);

        return (
          (tab in DUPLICABLE_FIELDS_TO_WATCH &&
            (DUPLICABLE_FIELDS_TO_WATCH[tab].fields.includes(propKey) &&
              DUPLICABLE_FIELDS_TO_WATCH[tab].forceUpdate)) ||
          (fieldName in FIELDS_TO_WATCH &&
            FIELDS_TO_WATCH[fieldName].forceUpdate)
        );
      }) ||
      (eventType === "blur" && blurChange)
    );
  }

  handleFormChange(changes, eventObj) {
    const { eventType, fieldName } = eventObj;
    const shouldUpdateDefinition = this.shouldUpdateDefinition(
      changes,
      eventType,
      fieldName
    );

    if (eventType === "change" || shouldUpdateDefinition) {
      this.recalculateFormModelAndRender(shouldUpdateDefinition);
    }

    Hooks.doAction("serviceFormChange", ...arguments);
    // Handle the form change in the way service needs here.
    this.props.onChange(...arguments);
  }

  validateForm() {
    const model = this.triggerTabFormSubmit();

    let validated = true;
    // Apply all validations.
    FormUtil.forEachDefinition(this.multipleDefinition, function(definition) {
      definition.showError = false;

      if (typeof definition.externalValidator !== "function") {
        return;
      }

      const fieldValidated = definition.externalValidator(model, definition);
      if (!fieldValidated) {
        validated = false;
      }
    });

    this.forceUpdate();

    return {
      isValidated: validated,
      model: SchemaFormUtil.processFormModel(model, this.multipleDefinition),
      definition: this.multipleDefinition
    };
  }

  handleExternalSubmit() {
    return this.validateForm();
  }

  getNetworkingDescriptionDefinition(model) {
    return {
      name: "ports-description",
      render: () => {
        const { networkType } = this.getNetworkingConfiguration(model);
        let hostNetworkingDefinition = null;
        const { ports } = model.networking;
        let serviceAddressNetworkingDefinition = null;

        if (ports == null) {
          return null;
        }

        const hasLoadBalanced = ports.some(function(port) {
          return port.loadBalanced;
        });

        if (!hasLoadBalanced) {
          return null;
        }

        // Build out the Host ports that get dynamically created
        if (networkType === "host") {
          let portMapping = ports.map(function(port, index) {
            return `$PORT${index}`;
          });
          portMapping = StringUtil.humanizeArray(portMapping, {
            wrapValueFunction(value, index) {
              return <strong key={index}>{value}</strong>;
            }
          });

          hostNetworkingDefinition = (
            <p>
              Host ports will be dynamically assigned and mapped
              to {portMapping}.
            </p>
          );
        }

        // Build out the hostname mappings
        let serviceAddress = HostUtil.stringToHostname(model.general.id);
        if (serviceAddress) {
          serviceAddress += Networking.L4LB_ADDRESS;

          const addresses = ports
            .filter(function(port) {
              return port.lbPort !== 0;
            })
            .map(function(port, index) {
              return (
                <li key={index}>
                  <strong>
                    {`${serviceAddress}:${port.lbPort}`}
                  </strong>
                </li>
              );
            });

          serviceAddressNetworkingDefinition = (
            <div>
              <p>
                Clients can access your service at these Service Addresses
              </p>
              <ul className="list list-narrow">
                {addresses}
              </ul>
            </div>
          );
        }

        if (
          hostNetworkingDefinition == null &&
          serviceAddressNetworkingDefinition == null
        ) {
          return null;
        }

        return (
          <div
            className="media-object-spacing-wrapper media-object-spacing-super-narrow"
            key="ports-description"
            style={{ marginBottom: "20px" }}
          >
            <div className="media-object">
              <div className="media-object-item">
                <Icon color="blue" id="circle-question" size="mini" />
              </div>
              <div className="media-object-item media-object-item-shrink">
                {hostNetworkingDefinition}
                {serviceAddressNetworkingDefinition}
              </div>
            </div>
          </div>
        );
      }
    };
  }

  updateDefinitions() {
    const { model } = this.internalStorage_get();
    const { networking, volumes } = this.multipleDefinition;
    const { containerSettings } = model;

    const showDockerVolumes =
      containerSettings &&
      containerSettings.image != null &&
      containerSettings.image !== "";

    let endIndex = -1;
    let startIndex = -1;

    volumes.definition.forEach(function(item, index) {
      if (item.prop === "localVolumes") {
        startIndex = index + 1;
      }
      if (item.prop === "dockerVolumes") {
        endIndex = index + 1;
      }
    });
    if (endIndex > -1) {
      this.internalStorage_set({
        model,
        dockerVolumesDefinition: volumes.definition.slice(startIndex, endIndex)
      });
    }
    // Get new value if it was set
    const { dockerVolumesDefinition } = this.internalStorage_get();

    if (showDockerVolumes && endIndex < 0) {
      volumes.definition.splice(startIndex, 0, ...dockerVolumesDefinition);
    } else if (!showDockerVolumes && endIndex > -1) {
      volumes.definition.splice(startIndex, dockerVolumesDefinition.length);
    }
    if (networking) {
      const {
        networkType
      } = this.props.schema.properties.networking.properties;

      const virtualNetworks = VirtualNetworksStore.getOverlays()
        .mapItems(function(overlay) {
          const name = overlay.getName();

          return { html: `Virtual Network: ${name}`, id: name };
        })
        .getItems();

      const networkDescriptionDefinition = this.getNetworkingDescriptionDefinition(
        model
      );

      networking.definition.forEach(function(definition) {
        if (definition.name === networkDescriptionDefinition.name) {
          Object.assign(definition, networkDescriptionDefinition);
        }

        if (definition.name === "networkType") {
          definition.options = [].concat(networkType.options, virtualNetworks);
        }
      });

      const definition = networking.definition;
      let firstCheckboxIndex = -1;

      for (let i = definition.length - 1; i >= 0; i--) {
        const currentDefinition = definition[i];
        if (
          (FormUtil.isFieldInstanceOfProp("ports", currentDefinition) &&
            FormUtil.getPropKey(currentDefinition.name) === "expose") ||
          currentDefinition.name === "expose-endpoints"
        ) {
          firstCheckboxIndex = i;
        }
      }

      const checkboxes = this.getExposeNetworkingCheckboxes();
      const label = {
        name: "expose-endpoints",
        render() {
          return (
            <label key="expose-endpoints">
              Expose endpoints on host network
            </label>
          );
        }
      };

      if (firstCheckboxIndex !== -1) {
        definition.splice(firstCheckboxIndex);
      }

      if (checkboxes.length) {
        definition.push(label, ...checkboxes);
      }
    }
  }

  handleTabClick(tab) {
    this.recalculateFormModelAndRender(true, 0);
    this.props.onTabChange(tab);
  }

  handleAddRow() {
    super.handleAddRow(...arguments);
    this.recalculateFormModelAndRender(true, 0);
  }

  handleRemoveRow() {
    super.handleRemoveRow(...arguments);
    this.recalculateFormModelAndRender(true, 0);
  }

  recalculateFormModelAndRender(shouldUpdateDefinition = false, delay = 50) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    // Debounce definition update. Also ensures we build the model with
    // latest form changes.
    this.timer = setTimeout(() => {
      const model = {};
      const formModel = this.triggerTabFormSubmit();

      Object.keys(formModel).forEach(function(key) {
        model[key] = FormUtil.modelToCombinedProps(formModel[key]);
      });

      model.environmentVariables =
        model.environmentVariables.environmentVariables;
      model.labels = model.labels.labels;
      model.healthChecks = model.healthChecks.healthChecks;
      if (
        !["host", "bridge"].includes(model.networking.networkType) &&
        model.networking.ports
      ) {
        // Set expose to true as default
        model.networking.ports.map(function(port) {
          port.expose = port.expose || false;

          return port;
        });
      }
      const { dockerVolumesDefinition = null } = this.internalStorage_get();
      this.internalStorage_set({ model, dockerVolumesDefinition });

      if (shouldUpdateDefinition) {
        SchemaFormUtil.mergeModelIntoDefinition(
          model,
          this.multipleDefinition,
          this.getRemoveRowButton
        );

        // Provide opportunity to do action after update, before re-render
        Hooks.doAction("serviceFormUpdate", this);
        this.updateDefinitions();
        this.forceUpdate();
      }
    }, delay);
  }

  getNetworkingConfiguration(model) {
    const networkType = (model.networking.networkType || "host").toLowerCase();
    const isUserMode =
      model.networking && !["host", "bridge"].includes(networkType);

    return { networkType, isUserMode };
  }

  getExposeNetworkingCheckboxes() {
    const { model } = this.internalStorage_get();
    const definitionGroup = [];
    const { isUserMode } = this.getNetworkingConfiguration(model);
    const networkingDefinition = this.multipleDefinition.networking.definition;
    // First port definition in networking definition is at index 2
    let portDefinitionIndex = 2;

    // TODO: We need to refactor this as the current impl. is highly error prone
    // -> Use the port name to map fields (it's required to be unique)
    if (model.networking && model.networking.ports && isUserMode) {
      model.networking.ports.forEach(function(port) {
        const portDefinition = networkingDefinition[portDefinitionIndex++];

        if (!Array.isArray(portDefinition)) {
          return;
        }

        const propID = FormUtil.getPropIndex(portDefinition[0].id);
        const propName = FormUtil.getPropIndex(portDefinition[0].name);

        definitionGroup.push({
          fieldType: "checkbox",
          id: `ports[${propID}].expose`,
          name: `ports[${propName}].expose`,
          placeholder: "",
          required: false,
          showError: false,
          writeType: "input",
          value: port.expose || false,
          valueType: "boolean",
          label: `${port.name} (${port.lbPort || 0}/${port.protocol})`,
          checked: false
        });
      });
    }

    return definitionGroup;
  }

  getNewDefinition() {
    let { model, schema } = this.props;

    schema = Hooks.applyFilter("serviceFormSchema", schema);

    const definition = SchemaUtil.schemaToMultipleDefinition({
      schema,
      renderSubheader: this.getSubHeader,
      renderLabel: this.getLabel,
      renderRemove: this.getRemoveRowButton,
      renderAdd: this.getAddNewRowButton
    });

    SchemaFormUtil.mergeModelIntoDefinition(
      model,
      definition,
      this.getRemoveRowButton
    );

    // Append definitions
    const { networking } = definition;
    if (networking) {
      networking.definition.push(
        this.getNetworkingDescriptionDefinition(model)
      );
    }

    if (model) {
      const { dockerVolumesDefinition = null } = this.internalStorage_get();
      this.internalStorage_set({ model, dockerVolumesDefinition });
    }

    return definition;
  }
}

ServiceForm.defaultProps = {
  className: "multiple-form",
  defaultTab: "",
  getTriggerSubmit() {},
  onChange() {},
  onTabChange() {},
  schema: {}
};

ServiceForm.propTypes = {
  className: React.PropTypes.string,
  defaultTab: React.PropTypes.string,
  getTriggerSubmit: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onTabChange: React.PropTypes.func,
  schema: React.PropTypes.object
};

module.exports = ServiceForm;
