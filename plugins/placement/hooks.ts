import { MountService } from "foundation-ui";

import PodPlacementConfigSection from "./components/PodPlacementConfigSection";
import PlacementSection from "./components/PlacementSection";
import JobPlacementSection from "./components/JobPlacementSection";
import {
  PlacementSchemaField,
  PlacementSchemaZoneField,
} from "./components/PlacementSchemaField";
import ServicePlacementConfigSection from "./components/ServicePlacementConfigSection";
import {
  augmentConstraintsReducer,
  singleContainerJSONParser,
  multiContainerJSONParser,
  zoneReducer,
  regionReducer,
} from "./reducers/constraints";
import {
  jobRegionConstraintReducers,
  jobJsonReducers,
  jobResponseToSpec,
} from "./reducers/jobConstraints";
import SchemaRegionSelection from "./components/SchemaRegionSelection";
import { Hooks } from "PluginSDK";

const PRIORITY = 100;

module.exports = {
  filters: [
    "serviceCreateJsonParserReducers",
    "serviceJsonConfigReducers",
    "serviceInputConfigReducers",
    "multiContainerCreateJsonParserReducers",
    "multiContainerJsonConfigReducers",
    "multiContainerInputConfigReducers",
    "jobResponseToSpecParser",
    "jobOutputReducers",
  ],
  actions: [],

  initialize() {
    const regionZoneType =
      "SchemaField:application/x-region-zone-constraints+json";
    const zoneType = "SchemaField:application/x-zone-constraints+json";
    const onlyRegionType = "SchemaField:application/x-region+string";

    // Override Framework Form widgets
    MountService.MountService.registerComponent(
      PlacementSchemaField,
      regionZoneType,
      PRIORITY
    );
    MountService.MountService.registerComponent(
      PlacementSchemaZoneField,
      zoneType,
      PRIORITY
    );
    MountService.MountService.registerComponent(
      SchemaRegionSelection,
      onlyRegionType,
      PRIORITY
    );

    // Override Service Form widgets
    MountService.MountService.registerComponent(
      PlacementSection,
      "CreateService:PlacementSection"
    );
    MountService.MountService.registerComponent(
      PlacementSection,
      "CreateService:MultiContainerPlacementSection"
    );

    // Override Service Config widgets
    MountService.MountService.registerComponent(
      ServicePlacementConfigSection,
      "CreateService:ServiceConfigDisplay:App:PlacementConstraints"
    );
    MountService.MountService.registerComponent(
      PodPlacementConfigSection,
      "CreateService:ServiceConfigDisplay:Pod:PlacementConstraints"
    );

    // Override Job Form widget
    MountService.MountService.registerComponent(
      JobPlacementSection,
      "CreateJob:PlacementSection"
    );

    this.addHooks(this.filters, this.actions);
  },

  multiContainerInputConfigReducers(reducers) {
    return {
      ...reducers,

      constraints(state = [], { type, path, value }) {
        const constraints = reducers.constraints.bind(this);

        let newState = state.slice();

        newState = regionReducer(newState, { type, path, value }, constraints);
        newState = zoneReducer(newState, { type, path, value }, constraints);

        return [].concat(
          reducers.constraints.bind(this)(newState, { type, path, value })
        );
      },
    };
  },

  multiContainerJsonConfigReducers(reducers) {
    return {
      ...reducers,

      scheduling(state = [], { type, path, value }) {
        const scheduling = reducers.scheduling.bind(this);

        let newState = {
          ...state,
        };

        newState = regionReducer(newState, { type, path, value }, scheduling);
        newState = zoneReducer(newState, { type, path, value }, scheduling);

        return {
          ...reducers.scheduling.bind(this)(newState, { type, path, value }),
        };
      },
    };
  },

  serviceInputConfigReducers(reducers) {
    return augmentConstraintsReducer(reducers);
  },

  serviceJsonConfigReducers(reducers) {
    return augmentConstraintsReducer(reducers);
  },

  serviceCreateJsonParserReducers(parserReducers = []) {
    return parserReducers.concat([singleContainerJSONParser]);
  },

  multiContainerCreateJsonParserReducers(parserReducers = []) {
    return parserReducers.concat([multiContainerJSONParser]);
  },

  jobOutputReducers(reducers) {
    const ossJsonOverrideReducer = reducers.json.OVERRIDE;

    return {
      ...reducers,
      json: jobJsonReducers(ossJsonOverrideReducer),
      regionConstraint: jobRegionConstraintReducers,
    };
  },

  jobResponseToSpecParser(jobResponse) {
    return jobResponseToSpec(jobResponse);
  },

  addHooks(filters, actions) {
    filters.forEach((filter) => {
      Hooks.addFilter(filter, this[filter].bind(this));
    });

    actions.forEach((action) => {
      Hooks.addAction(action, this[action].bind(this));
    });
  },
};
