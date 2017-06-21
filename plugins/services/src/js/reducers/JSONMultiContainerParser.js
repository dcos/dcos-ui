import { JSONParser as container } from "./serviceForm/Container";
import {
  JSONParser as constraints
} from "./serviceForm/MultiContainerConstraints";
import { JSONParser as fetch } from "./serviceForm/Artifacts";
import {
  JSONParser as environmentVariables
} from "./serviceForm/MultiContainerEnvironmentVariables";
import { JSONParser as externalVolumes } from "./serviceForm/ExternalVolumes";
import { JSONParser as healthChecks } from "./serviceForm/HealthChecks";
import { JSONParser as labels } from "./serviceForm/Labels";
import { JSONParser as localVolumes } from "./serviceForm/LocalVolumes";
import { JSONParser as portDefinitions } from "./serviceForm/PortDefinitions";
import { JSONParser as portMappings } from "./serviceForm/PortMappings";
import { JSONParser as residency } from "./serviceForm/Residency";
import { JSONParser as scaling } from "./serviceForm/MultiContainerScaling";
import { JSONParser as network } from "./serviceForm/Network";
import {
  JSONParser as multiContainerNetwork
} from "./serviceForm/MultiContainerNetwork";
import {
  JSONParser as volumeMounts
} from "./serviceForm/MultiContainerVolumes";
import { simpleParser } from "../../../../../src/js/utils/ParserUtil";
import { JSONParser as containers } from "./serviceForm/Containers";

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
  fetch
];
