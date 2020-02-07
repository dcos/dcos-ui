import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import { MountService } from "foundation-ui";

import * as React from "react";

import { Route } from "react-router";

import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import FormUtil from "#SRC/js/utils/FormUtil";
import Util from "#SRC/js/utils/Util";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import TabView from "#SRC/js/components/TabView";

import { JobFormActionType } from "#PLUGINS/jobs/src/js/components/form/helpers/JobFormData";

import { getSDK } from "./SDK";
import { JSONSingleContainerReducer as containerJSONReducer } from "./reducers/Container";
import { JSONReducer as containersJSONReducer } from "./reducers/Containers";
import envReducer from "./reducers/EnvironmentVariables";
import {
  UnknownVolumesParser,
  JSONMultiContainerReducer as volumesJSONMultiContainerReducer
} from "./reducers/Volumes";
import * as SecretsReducers from "./reducers/Secrets";
import SecretDetail from "./pages/SecretDetail";
import SecretsPage from "./pages/SecretsPage";
import SecretsSelect from "./components/SecretsSelect";
import getSecretStore from "./stores/SecretStore";
import SecretStorePage from "./pages/SecretStorePage";
import SingleContainerSecretsFormSection from "./components/forms/SingleContainerSecretsFormSection";
import MultiContainerSecretsFormSection from "./components/forms/MultiContainerSecretsFormSection";
import SecretVolumesSection from "./components/forms/SecretVolumesSection";
import ServiceConfigSecretsSectionDisplay from "./components/ServiceConfigSecretsSectionDisplay";
import PodConfigSecretsSectionDisplay from "./components/PodConfigSecretsSectionDisplay";
import JobSecretsFormSection from "./components/forms/JobSecretsFormSection";
import SecretValidators from "./validators/SecretsValidators";
import {
  JobSecretsValidators,
  JobSpecValidator
} from "./validators/JobSecretsValidators";
import {
  jobSecretsReducers,
  jobResponseToSpec,
  jobSpecToOutput,
  jobJsonReducers
} from "./reducers/JobSecrets";
import JobVolumesFBS from "./components/forms/JobVolumesFBS";

import "./styles/service-form.less";

const SecretStore = getSecretStore();
const SDK = getSDK();

// To put it after Labels
const REVIEW_SCREEN_PRIORITY = 199;

let serviceFormComponent = null;

module.exports = {
  filters: ["applicationRoutes"],

  actions: ["userCapabilitiesFetched"],

  initialize() {
    this.addHooks(this.filters, this.actions);
  },

  addHooks(filters, actions) {
    filters.forEach(filter => {
      SDK.Hooks.addFilter(filter, this[filter].bind(this));
    });

    actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });
  },

  hasSecretsCapability() {
    return SDK.Hooks.applyFilter("hasCapability", false, "secretsAPI");
  },

  userCapabilitiesFetched() {
    SecretStore.fetchStores();

    MountService.MountService.registerComponent(
      SecretsSelect,
      "SchemaField:application/x-service-account-secret+string"
    );

    MountService.MountService.registerComponent(
      SecretsSelect,
      "SchemaField:application/x-secret+string"
    );

    MountService.MountService.registerComponent(
      ServiceConfigSecretsSectionDisplay,
      "CreateService:ServiceConfigDisplay:App",
      REVIEW_SCREEN_PRIORITY
    );

    MountService.MountService.registerComponent(
      PodConfigSecretsSectionDisplay,
      "CreateService:ServiceConfigDisplay:Pod",
      REVIEW_SCREEN_PRIORITY
    );

    MountService.MountService.registerComponent(
      SecretVolumesSection,
      "CreateService:SingleContainerVolumes:VolumeConflicts"
    );

    MountService.MountService.registerComponent(
      JobVolumesFBS,
      "CreateJob:VolumesFBS"
    );

    // Add additional hooks
    const filters = [
      "serviceCreateJsonParserReducers",
      "serviceJsonConfigReducers",
      "serviceInputConfigReducers",
      "multiContainerCreateJsonParserReducers",
      "multiContainerJsonConfigReducers",
      "multiContainerInputConfigReducers",
      "appValidators",
      "podValidators",
      "createServiceMultiContainerTabList",
      "createServiceTabList",
      "createServiceMultiContainerTabViews",
      "createServiceTabViews",
      "createJobTabViews",
      "createJobTabList",
      "jobSpecToFormOutputParser",
      "jobOutputReducers",
      "jobResponseToSpecParser",
      "jobSpecToOutputParser",
      "metronomeValidators",
      "jobsValidateSpec"
    ];

    const deprecatedFilters = [
      "environmentVariableValueList",
      "serviceFormErrorResponseMap",
      "serviceFormMatchErrorPath",
      "serviceFormStoreListeners",
      "serviceFormSchema",
      "serviceToAppDefinition",
      "serviceVariableValue",
      "variablesGetter"
    ];

    const deprecatedActions = [
      "serviceFormMount",
      "serviceFormChange",
      "serviceFormUpdate"
    ];

    this.addHooks(filters.concat(deprecatedFilters), deprecatedActions);
  },

  /**
   * handleVariableSecretClick
   *
   * @deprecated Since the new Service Create Form
   * @param  {*} fieldName
   * @param  {*} prop
   * @param  {*} propKey
   * @param  {*} fieldValue
   */
  handleVariableSecretClick(fieldName, prop, propKey, fieldValue) {
    if (serviceFormComponent == null) {
      return;
    }

    const propIndex = FormUtil.getPropIndex(fieldName);
    const variablesDefinition =
      serviceFormComponent.multipleDefinition.environmentVariables.definition;

    if (!variablesDefinition) {
      return;
    }

    variablesDefinition.forEach(field => {
      if (!Array.isArray(field)) {
        return;
      }

      field.forEach(fieldColumn => {
        const propKey = FormUtil.getPropKey(fieldColumn.name);
        if (
          FormUtil.isFieldInstanceOfProp(prop, fieldColumn, propIndex) &&
          propKey === "value"
        ) {
          if (fieldValue) {
            this.resetFieldAsSelect(fieldColumn);
          } else {
            fieldColumn.fieldType = "text";
          }
        }
      });
    });

    serviceFormComponent.forceUpdate();
  },

  /**
   * resetFieldAsSelect
   *
   * @deprecated
   * @param  {type} fieldColumn
   */
  resetFieldAsSelect(fieldColumn) {
    fieldColumn.fieldType = "select";
    fieldColumn.options = this.environmentVariableValueList();
    fieldColumn.wrapperClassName = "dropdown max-width";
    fieldColumn.buttonClassName = "button dropdown-toggle text-overflow";
  },

  /**
   * resetDefinition
   *
   * @deprecated
   * @param  {type} definition
   */
  resetDefinition(definition) {
    definition.forEach(field => {
      if (!Array.isArray(field)) {
        return;
      }

      const isUsingSecret = field.some(fieldColumn => {
        const prop = FormUtil.getProp(fieldColumn.name);
        const propKey = FormUtil.getPropKey(fieldColumn.name);
        const propIndex = FormUtil.getPropIndex(fieldColumn.name);
        if (
          FormUtil.isFieldInstanceOfProp(prop, fieldColumn, propIndex) &&
          propKey === "usingSecret"
        ) {
          return fieldColumn.value;
        }

        return false;
      });

      if (!isUsingSecret) {
        return;
      }

      field.forEach(fieldColumn => {
        const prop = FormUtil.getProp(fieldColumn.name);
        const propKey = FormUtil.getPropKey(fieldColumn.name);
        const propIndex = FormUtil.getPropIndex(fieldColumn.name);
        if (
          FormUtil.isFieldInstanceOfProp(prop, fieldColumn, propIndex) &&
          propKey === "value"
        ) {
          this.resetFieldAsSelect(fieldColumn);
        }
      });
    });
  },

  /**
   * environmentVariableValueList
   *
   * @deprecated Since the new Service Create Form
   * @return {type}  description
   */
  environmentVariableValueList() {
    let secrets = SecretStore.getSecrets().map(secret => ({
      html: secret.getPath(),
      id: secret.getPath(),
      value: secret.getPath(),

      selectedHtml: (
        <span className="text-overflow text-overflow-word-break">
          {secret.getPath()}
        </span>
      )
    }));

    secrets = secrets || [];

    return [
      {
        className: "hidden",
        selectedHtml: "Select Secret",
        id: "default",
        value: "",
        html: ""
      }
    ].concat(secrets);
  },

  /**
   * serviceFormErrorResponseMap
   *
   * @deprecated
   * @param  {type} errorResponseMap
   * @return {type}                  errors object
   */
  serviceFormErrorResponseMap(errorResponseMap) {
    return {
      ...errorResponseMap,
      "/secrets/secret{INDEX}/source": "Environment variable secret"
    };
  },

  /**
   * serviceFormMatchErrorPath
   *
   * @deprecated Since the new Service Create Form
   * @param  {type} matches description
   * @param  {type} path    description
   * @return {type}         description
   */
  serviceFormMatchErrorPath(matches, path) {
    if (!path.includes("secret")) {
      return matches;
    }

    return path.match(/[0-9]/);
  },

  /**
   * serviceFormMount
   *
   * @deprecated Since the new Service Create Form
   * @param  {React.Component} component
   */
  serviceFormMount(component) {
    serviceFormComponent = component;
    SecretStore.fetchSecrets();
  },

  /**
   * serviceFormChange
   *
   * @deprecated Since the new Service Create Form
   * @param  {*} formData
   * @param  {Object} eventObj
   */
  serviceFormChange(formData, eventObj) {
    const { eventType, fieldName } = eventObj;

    if (eventType !== "change") {
      return;
    }

    const propKey = FormUtil.getPropKey(fieldName);
    const prop = FormUtil.getProp(fieldName);
    if (propKey === "usingSecret" && prop === "environmentVariables") {
      const { fieldValue } = eventObj;
      this.handleVariableSecretClick(fieldName, prop, propKey, fieldValue);
    }
  },

  /**
   * serviceFormUpdate
   *
   * @deprecated Since the new Service Create Form
   */
  serviceFormUpdate() {
    this.resetDefinition(
      serviceFormComponent.multipleDefinition.environmentVariables.definition
    );
  },

  /**
   * serviceFormStoreListeners
   *
   * @deprecated
   * @param  {Object[]} listeners
   * @return {Object[]} listeners
   */
  serviceFormStoreListeners(listeners) {
    // prettier-ignore
    listeners.push({ name: "secrets", events: ["secretsSuccess"], suppressUpdate: true });

    return listeners;
  },

  /**
   * serviceFormSchema
   *
   * @deprecated Since the new Service Create Form
   * @param  {Object} schema
   * @return {Object} schema
   */
  serviceFormSchema(schema) {
    schema = Util.deepCopy(schema);
    const envItemShape =
      schema.properties.environmentVariables.properties.environmentVariables
        .itemShape.properties;
    envItemShape.usingSecret = {
      label: "Use a secret",
      showLabel: false,
      type: "boolean",
      className: "form-row-element-mixed-label-presence"
    };

    schema.properties.environmentVariables.description = (
      <Trans render="span">
        Set variables for each task your service launches. You can also use
        variables to expose Secrets.{" "}
        <a href="#/secrets/">Manage secrets here</a>.{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/#environment-variables"
          )}
          target="_blank"
        >
          Learn more about variables
        </a>
        .
      </Trans>
    );

    return schema;
  },

  /**
   * serviceToAppDefinition
   *
   * @deprecated Since the new Service Create Form
   * @param  {*} appDefinition
   * @param  {*} service
   */
  serviceToAppDefinition(appDefinition, service) {
    if (service.get("secrets")) {
      appDefinition.secrets = service.get("secrets");
    }
  },

  /**
   * serviceVariableValue
   *
   * @deprecated Since the new Service Create Form
   * @param  {*} value
   * @param  {*} variable
   * @param  {*} definition
   * @return {string|Object} value
   */
  serviceVariableValue(value, variable, definition) {
    if (!variable.usingSecret) {
      return value;
    }

    if (!Object.prototype.hasOwnProperty.call(definition, "secrets")) {
      definition.secrets = {};
    }

    // Use the secret id from the definition if defined or a generated  one
    let secretID = `secret${Util.uniqueID("secretPluginSecret")}`;
    if (definition.env && definition.env[variable.key]) {
      secretID = definition.env[variable.key].secret || secretID;
    }

    definition.secrets[secretID] = { source: value };

    return { secret: secretID };
  },

  applicationRoutes(routes) {
    // Find the route we wish to modify, the index route.
    const indexRoute = routes[0].children.find(route => route.id === "index");

    // Append the security routes to the index route's children.
    indexRoute.children.push({
      type: Route,
      path: "secrets",
      component: SecretsPage,
      category: i18nMark("resources"),
      isInSidebar: true
    });

    indexRoute.children.push({
      type: Route,
      path: "secrets/:secretPath",
      component: SecretDetail
    });

    // Find the settings route within the index route.
    const settingsRouteIndex = indexRoute.children.findIndex(
      route => route.path === "settings"
    );

    // Find the repositories route within the settings route.
    const repositoriesRouteIndex = indexRoute.children[
      settingsRouteIndex
    ].children.findIndex(route => route.path === "repositories");

    // Insert the stores route directly after the repositories route.
    indexRoute.children[settingsRouteIndex].children.splice(
      repositoriesRouteIndex + 1,
      0,
      {
        type: Route,
        path: "stores",
        component: SecretStorePage,
        isInSidebar: true
      }
    );

    return routes;
  },

  appValidators() {
    return [
      SecretValidators.envMustHaveSecretPart,
      SecretValidators.appVolumeMustHaveSecretPart,
      SecretValidators.appSecretVolumesSupported
    ];
  },

  podValidators() {
    return [
      SecretValidators.envMustHaveSecretPart,
      SecretValidators.podVolumeMustHaveSecretPart
    ];
  },

  serviceCreateJsonParserReducers(parserReducers = []) {
    // Filter out the "UnknownVolumesJSONParser" and replace with our "UnknownVolumesParser"
    const result = parserReducers.filter(
      parser =>
        typeof parser === "function" &&
        parser.name !== "UnknownVolumesJSONParser"
    );

    return result.concat(
      SecretsReducers.JSONSingleContainerParser,
      UnknownVolumesParser
    );
  },

  serviceJsonConfigReducers(reducers) {
    return {
      ...reducers,
      secrets: SecretsReducers.JSONSingleContainerReducer,

      // env json fragment keeps regular variables as well as special shaped secrets
      // therefore we need run two reducers and merge result
      env(...args) {
        // the function will gain a reducer context via `this`
        // that context has to be passed to the reducers we want to combine,
        // thus we're binding `this` here
        return {
          ...envReducer.JSONReducer.call(this, ...args),
          ...reducers.env.call(this, ...args)
        };
      },

      container(state, action, index) {
        const containerState = reducers.container.call(this, ...arguments);
        const newState = containerJSONReducer.call(
          this,
          containerState,
          action,
          index
        );
        // common Container reducer saves its state to .internalState key, so
        // we update it here to keep it accurate with our changes
        this.internalState = newState;

        return newState;
      }
    };
  },

  serviceInputConfigReducers(reducers) {
    return {
      ...reducers,
      secrets: SecretsReducers.FormSingleContainerReducer
    };
  },

  multiContainerCreateJsonParserReducers(parserReducers = []) {
    // MultiContainerVolumeMountsJSONParser
    const servicesPodVolumeParser = parserReducers.find(
      parser =>
        typeof parser === "function" &&
        parser.name === "MultiContainerVolumeMountsJSONParser"
    );
    if (servicesPodVolumeParser) {
      const servicesPodVolumeParserWrapper = state =>
        servicesPodVolumeParser(SecretsReducers.removeSecretVolumes(state));
      const parserIndex = parserReducers.indexOf(servicesPodVolumeParser);
      parserReducers[parserIndex] = servicesPodVolumeParserWrapper;
    }

    return parserReducers.concat(SecretsReducers.JSONMultiContainerParser);
  },

  multiContainerJsonConfigReducers(reducers) {
    return {
      ...reducers,
      secrets: SecretsReducers.JSONMultiContainerReducer,

      environment(...args) {
        return {
          ...envReducer.MultiContainerJSONReducer.call(this, ...args),
          ...reducers.environment.call(this, ...args)
        };
      },

      volumes(state, action, index) {
        const volumesState = reducers.volumes.call(this, ...arguments);

        return volumesJSONMultiContainerReducer.call(
          this,
          volumesState,
          action,
          index
        );
      },

      containers(state, action, index) {
        const containersState = reducers.containers.call(this, ...arguments);

        return containersJSONReducer.call(this, containersState, action, index);
      }
    };
  },

  multiContainerInputConfigReducers(reducers) {
    return {
      ...reducers,
      secrets: SecretsReducers.FormMultiContainerReducer
    };
  },

  variablesGetter(variable, service) {
    let usingSecret = false;
    let value = variable.value;
    if (typeof value === "object" && value != null) {
      usingSecret = true;
      value = service.get("secrets")[value.secret].source;
    }

    return {
      key: variable.key,
      value,
      usingSecret
    };
  },

  createServiceMultiContainerTabList(tabList) {
    tabList.push({
      id: "secrets",
      key: "secrets",
      label: i18nMark("Secrets")
    });

    return tabList;
  },

  createServiceTabList(tabList) {
    tabList.push({
      id: "secrets",
      key: "secrets",
      label: i18nMark("Secrets")
    });

    return tabList;
  },

  createServiceMultiContainerTabViews(tabs, props) {
    tabs.push(
      <TabView id="secrets" key="secrets">
        <ErrorsAlert
          errors={props.errors}
          pathMapping={props.pathMapping}
          hideTopLevelErrors={props.hideTopLevelErrors}
        />
        <MultiContainerSecretsFormSection
          data={props.data}
          errors={props.errorMap}
          onAddItem={props.onAddItem}
          onRemoveItem={props.onRemoveItem}
        />
      </TabView>
    );

    return tabs;
  },

  createServiceTabViews(tabs, props) {
    tabs.push(
      <TabView id="secrets" key="secrets">
        <ErrorsAlert
          errors={props.errors}
          pathMapping={props.pathMapping}
          hideTopLevelErrors={props.hideTopLevelErrors}
        />
        <SingleContainerSecretsFormSection
          data={props.data}
          errors={props.errorMap}
          onAddItem={props.onAddItem}
          onRemoveItem={props.onRemoveItem}
        />
      </TabView>
    );

    return tabs;
  },

  createJobTabViews(tabs, props) {
    tabs.push(
      <TabView id="secrets" key="secrets">
        <ErrorsAlert
          errors={props.errors}
          pathMapping={props.pathMapping}
          hideTopLevelErrors={props.hideTopLevelErrors}
        />
        <JobSecretsFormSection
          data={props.data}
          errors={props.errors}
          showErrors={props.showErrors}
          onAddItem={props.onAddItem}
          onRemoveItem={props.onRemoveItem}
        />
      </TabView>
    );

    return tabs;
  },

  createJobTabList(tabList) {
    return tabList.concat([
      { id: "secrets", key: "secrets", label: i18nMark("Secrets") }
    ]);
  },

  jobSpecToFormOutputParser(formOutput, jobSpec) {
    const output = {
      ...formOutput,
      secrets: jobSpec.job.run.secrets || []
    };

    return output;
  },

  jobOutputReducers(reducers) {
    const ossJsonOverrideReducer = reducers.json[JobFormActionType.Override];

    return {
      ...reducers,
      json: jobJsonReducers(ossJsonOverrideReducer),
      secrets: jobSecretsReducers
    };
  },

  jobResponseToSpecParser(jobResponse) {
    return jobResponseToSpec(jobResponse);
  },

  jobSpecToOutputParser(jobSpec) {
    return jobSpecToOutput(jobSpec);
  },

  metronomeValidators(validators) {
    return {
      ...validators,
      ...JobSecretsValidators
    };
  },

  jobsValidateSpec(errors, jobSpec) {
    return JobSpecValidator(errors, jobSpec);
  }
};
