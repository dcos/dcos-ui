import { simpleParser } from "#SRC/js/utils/ParserUtil";
import { JSONParser as container } from "./serviceForm/Container";
import {
  JSONParser as constraints
} from "./serviceForm/JSONReducers/Constraints";
import { JSONParser as fetch } from "./serviceForm/JSONReducers/Artifacts";
import {
  JSONParser as environmentVariables
} from "./serviceForm/JSONReducers/EnvironmentVariables";
import {
  JSONParser as externalVolumes
} from "./serviceForm/JSONReducers/ExternalVolumes";
import {
  JSONParser as healthChecks
} from "./serviceForm/JSONReducers/HealthChecks";
import { JSONParser as labels } from "./serviceForm/JSONReducers/Labels";
import {
  JSONParser as localVolumes
} from "./serviceForm/JSONReducers/LocalVolumes";
import { JSONParser as portDefinitions } from "./serviceForm/PortDefinitions";
import { JSONParser as portMappings } from "./serviceForm/PortMappings";
import { JSONParser as residency } from "./serviceForm/JSONReducers/Residency";
import { JSONParser as scaling } from "./serviceForm/MultiContainerScaling";
import { JSONParser as network } from "./serviceForm/Network";
import {
  JSONParser as multiContainerNetwork
} from "./serviceForm/MultiContainerNetwork";
import {
  JSONParser as volumeMounts
} from "./serviceForm/MultiContainerVolumes";
import { JSONParser as containers } from "./serviceForm/Containers";
import {
  JSONParser as requirePorts
} from "./serviceForm/JSONReducers/RequirePorts";

module.exports = [
  simpleParser(["id"]),
  simpleParser(["instances"]),
  simpleParser(["cpus"]),
  simpleParser(["mem"]),
  simpleParser(["disk"]),
  simpleParser(["gpus"]),
  simpleParser(["cmd"]),
  container,
  containers,
  network,
  multiContainerNetwork,
  volumeMounts,
  portDefinitions,
  portMappings, // Note: must come after portDefinitions, as it uses its information!
  environmentVariables,
  labels,
  scaling,
  healthChecks,
  localVolumes,
  externalVolumes,
  constraints,
  residency,
  fetch,
  requirePorts
];
