import { simpleParser } from "#SRC/js/utils/ParserUtil";
import { JSONParser as constraints } from "./serviceForm/JSONReducers/Constraints";
import { JSONParser as container } from "./serviceForm/Container";
import { JSONParser as environmentVariables } from "./serviceForm/JSONReducers/EnvironmentVariables";
import { JSONParser as fetch } from "./serviceForm/JSONReducers/Artifacts";
import { JSONParser as healthChecks } from "./serviceForm/JSONReducers/HealthChecks";
import { JSONParser as labels } from "./serviceForm/JSONReducers/Labels";
import { JSONParser as volumes } from "./serviceForm/JSONReducers/Volumes";
import { JSONParser as unknownVolumes } from "./serviceForm/JSONReducers/UnknownVolumes";
import { JSONParser as networks } from "./serviceForm/JSONReducers/Networks";
import { JSONParser as portDefinitions } from "./serviceForm/PortDefinitions";
import { JSONParser as portMappings } from "./serviceForm/PortMappings";
import { JSONParser as residency } from "./serviceForm/JSONReducers/Residency";
import { JSONParser as requirePorts } from "./serviceForm/JSONReducers/RequirePorts";

module.exports = [
  simpleParser(["id"]),
  simpleParser(["instances"]),
  simpleParser(["cpus"]),
  simpleParser(["mem"]),
  simpleParser(["disk"]),
  simpleParser(["gpus"]),
  simpleParser(["cmd"]),
  constraints,
  container,
  environmentVariables,
  fetch,
  healthChecks,
  labels,
  volumes,
  networks,
  portDefinitions,
  portMappings, // Note: must come after portDefinitions, as it uses its information!
  requirePorts,
  residency,
  unknownVolumes
];
