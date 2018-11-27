import { simpleParser } from "#SRC/js/utils/ParserUtil";
import Transaction from "#SRC/js/structs/Transaction";
import Util from "#SRC/js/utils/Util";

import { JSONParser as constraints } from "./serviceForm/MultiContainerConstraints";
import { JSONParser as fetch } from "./serviceForm/JSONReducers/Artifacts";
import { JSONParser as environmentVariables } from "./serviceForm/JSONReducers/MultiContainerEnvironmentVariables";
import { JSONParser as healthChecks } from "./serviceForm/JSONReducers/HealthChecks";
import { JSONParser as volumes } from "./serviceForm/JSONReducers/Volumes";
import { JSONParser as labels } from "./serviceForm/JSONReducers/Labels";
import { JSONParser as portDefinitions } from "./serviceForm/PortDefinitions";
import { JSONParser as portMappings } from "./serviceForm/PortMappings";
import { JSONParser as residency } from "./serviceForm/JSONReducers/MultiContainerResidency";
import { JSONParser as scaling } from "./serviceForm/MultiContainerScaling";
import { JSONParser as networks } from "./serviceForm/JSONReducers/Networks";
import { JSONParser as multiContainerNetwork } from "./serviceForm/MultiContainerNetwork";
import { JSONParser as volumeMounts } from "./serviceForm/MultiContainerVolumes";
import { JSONParser as containers } from "./serviceForm/JSONReducers/Containers";

module.exports = [
  simpleParser(["id"]),
  simpleParser(["instances"]),
  simpleParser(["cpus"]),
  simpleParser(["mem"]),
  simpleParser(["disk"]),
  simpleParser(["gpus"]),
  simpleParser(["cmd"]),
  function scheduling(state) {
    if (state == null || state.scheduling == null) {
      return [];
    }

    return new Transaction(["scheduling"], Util.deepCopy(state.scheduling));
  },
  constraints,
  containers,
  environmentVariables,
  fetch,
  healthChecks,
  labels,
  volumes,
  multiContainerNetwork,
  networks,
  portDefinitions,
  portMappings, // Note: must come after portDefinitions, as it uses its information!
  residency,
  scaling,
  volumeMounts
];
