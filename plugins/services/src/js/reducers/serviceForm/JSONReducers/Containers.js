import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import { combineReducers, simpleFloatReducer } from "#SRC/js/utils/ReducerUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ContainerUtil from "#SRC/js/utils/ContainerUtil";
import { isEmpty } from "#SRC/js/utils/ValidatorUtil";
import Transaction from "#SRC/js/structs/Transaction";
import Networking from "#SRC/js/constants/Networking";

import { DEFAULT_POD_CONTAINER } from "../../../constants/DefaultPod";
import { JSONReducer as volumeMountsReducer } from "./MultiContainerVolumeMounts";
import { JSONReducer as endpointsJSONReducer } from "./Endpoints";
import { JSONReducer as multiContainerArtifactsJSONReducer } from "./MultiContainerArtifacts";
import {
  JSONSegmentReducer as multiContainerHealthCheckReducer,
  JSONSegmentParser as multiContainerHealthCheckParser
} from "../MultiContainerHealthChecks";
import { PROTOCOLS } from "../../../constants/PortDefinitionConstants";
import VipLabelUtil from "../../../utils/VipLabelUtil";

const { CONTAINER, HOST } = Networking.type;

const containerFloatReducer = combineReducers({
  cpus: simpleFloatReducer("resources.cpus"),
  mem: simpleFloatReducer("resources.mem"),
  disk: simpleFloatReducer("resources.disk")
});

function mapEndpoints(endpoints = [], networkType, appState) {
  return endpoints.map((endpoint, index) => {
    let {
      name,
      hostPort,
      containerPort,
      automaticPort,
      protocol,
      vipLabel,
      vipPort,
      labels
    } = endpoint;

    protocol = Object.keys(protocol).filter(function(key) {
      return protocol[key];
    });

    if (automaticPort) {
      hostPort = 0;
    }

    labels = VipLabelUtil.generateVipLabel(
      appState.id,
      endpoint,
      vipLabel || VipLabelUtil.defaultVip(index),
      vipPort || containerPort || hostPort
    );

    if (networkType === CONTAINER) {
      return {
        name,
        containerPort,
        hostPort,
        protocol,
        labels
      };
    }

    return {
      name,
      hostPort,
      protocol,
      labels
    };
  });
}

function containersParser(state) {
  if (state == null || state.containers == null) {
    return [];
  }

  return state.containers.reduce((memo, item, index) => {
    memo.push(new Transaction(["containers"], item, ADD_ITEM));
    if (item.name) {
      memo.push(new Transaction(["containers", index, "name"], item.name));
    }

    if (item.image) {
      memo.push(new Transaction(["containers", index, "image"], item.image));
    }
    if (item.image && item.image.id) {
      memo.push(
        new Transaction(["containers", index, "image", "id"], item.image.id)
      );
    }
    if (item.image && item.image.forcePull) {
      memo.push(
        new Transaction(
          ["containers", index, "image", "forcePull"],
          item.image.forcePull
        )
      );
    }
    if (item.resources != null) {
      const { resources } = item;
      if (resources.cpus != null) {
        memo.push(
          new Transaction(
            ["containers", index, "resources", "cpus"],
            resources.cpus
          )
        );
      }
      if (resources.mem != null) {
        memo.push(
          new Transaction(
            ["containers", index, "resources", "mem"],
            resources.mem
          )
        );
      }
      if (resources.disk != null) {
        memo.push(
          new Transaction(
            ["containers", index, "resources", "disk"],
            resources.disk
          )
        );
      }
    }

    if (item.privileged != null) {
      memo.push(
        new Transaction(["containers", index, "privileged"], item.privileged)
      );
    }

    if (item.healthCheck != null) {
      memo = memo.concat(
        multiContainerHealthCheckParser(item.healthCheck, [
          "containers",
          index,
          "healthCheck"
        ])
      );
    }

    if (item.artifacts != null && item.artifacts.length !== 0) {
      item.artifacts.forEach((artifact, artifactIndex) => {
        memo.push(
          new Transaction(
            ["containers", index, "artifacts"],
            artifact,
            ADD_ITEM
          )
        );
        if (artifact == null || typeof artifact !== "object") {
          return;
        }

        memo = memo.concat(
          Object.keys(artifact).map(key => {
            return new Transaction(
              ["containers", index, "artifacts", artifactIndex, key],
              artifact[key]
            );
          })
        );
      });
    }

    if (item.endpoints != null && item.endpoints.length !== 0) {
      const networkMode = findNestedPropertyInObject(state, "networks.0.mode");

      item.endpoints.forEach((_endpoint, endpointIndex) => {
        const endpoint = Object.assign({}, _endpoint);
        // Internal representation of protocols field differs from the JSON
        // Thus we need to delete the field from the ADD_ITEM value so that
        // JSONReducer isn't confused by it
        const endpointProtocol = endpoint.protocol;
        delete endpoint["protocol"];

        memo = memo.concat([
          new Transaction(
            ["containers", index, "endpoints"],
            endpoint,
            ADD_ITEM
          ),
          new Transaction(
            ["containers", index, "endpoints", endpointIndex, "hostPort"],
            endpoint.hostPort
          ),
          new Transaction(
            ["containers", index, "endpoints", endpointIndex, "automaticPort"],
            endpoint.hostPort === 0
          ),
          new Transaction(
            ["containers", index, "endpoints", endpointIndex, "servicePort"],
            endpoint.servicePort === 0
          ),
          new Transaction(
            ["containers", index, "endpoints", endpointIndex, "name"],
            endpoint.name
          )
        ]);

        if (endpoint.labels != null) {
          memo.push(
            new Transaction(
              ["containers", index, "endpoints", endpointIndex, "labels"],
              endpoint.labels
            )
          );
        }

        if (networkMode === CONTAINER.toLowerCase()) {
          memo.push(
            new Transaction(
              [
                "containers",
                index,
                "endpoints",
                endpointIndex,
                "containerPort"
              ],
              endpoint.containerPort
            )
          );
        }

        const vip = VipLabelUtil.findVip(endpoint.labels);

        if (vip != null) {
          const [vipLabel, vipValue] = vip;
          memo.push(
            new Transaction(
              ["containers", index, "endpoints", endpointIndex, "loadBalanced"],
              true
            )
          );

          memo.push(
            new Transaction(
              ["containers", index, "endpoints", endpointIndex, "vipLabel"],
              vipLabel
            )
          );

          if (!vipValue.startsWith(`${state.id}:`)) {
            memo.push(
              new Transaction(
                ["containers", index, "endpoints", endpointIndex, "vip"],
                vipValue
              )
            );
          }

          const vipPortMatch = vipValue.match(/.+:(\d+)/);
          if (vipPortMatch) {
            memo.push(
              new Transaction(
                ["containers", index, "endpoints", endpointIndex, "vipPort"],
                vipPortMatch[1]
              )
            );
          }
        }

        const protocols = endpointProtocol || [];
        PROTOCOLS.forEach(protocol => {
          memo.push(
            new Transaction(
              [
                "containers",
                index,
                "endpoints",
                endpointIndex,
                "protocol",
                protocol
              ],
              protocols.includes(protocol),
              SET
            )
          );
        });
      });
    }

    if (item.forcePullImage != null) {
      memo.push(
        new Transaction(
          ["containers", index, "forcePullImage"],
          item.forcePullImage
        )
      );
    }

    if (
      item.exec != null &&
      item.exec.command != null &&
      item.exec.command.shell != null
    ) {
      memo.push(
        new Transaction(
          ["containers", index, "exec", "command", "shell"],
          item.exec.command.shell
        )
      );
    }

    return memo;
  }, []);
}

function shouldDeleteContainerImage(image) {
  return image == null || !image.id;
}

module.exports = {
  JSONReducer(state = [], { type, path = [], value }, containerIndex) {
    if (containerIndex === 0) {
      state = [];
    }

    const [base, index, field, subField] = path;

    if (this.networkType == null) {
      this.networkType = HOST;
    }

    if (this.appState == null) {
      this.appState = {};
    }

    if (this.healthCheckState == null) {
      this.healthCheckState = [];
    }

    if (base === "id" && type === SET) {
      this.appState.id = value;
    }

    if (base === "networks" && parseInt(index, 10) === 0 && type === SET) {
      const valueSplit = value.split(".");

      this.networkType = valueSplit[0];
    }

    if (!path.includes("containers") && !path.includes("volumeMounts")) {
      return state.map((container, index) => {
        if (
          this.endpoints &&
          this.endpoints[index] &&
          this.endpoints[index].length !== 0
        ) {
          container.endpoints = mapEndpoints(
            this.endpoints[index],
            this.networkType,
            this.appState
          );
        }

        return container;
      });
    }

    if (this.cache == null) {
      // This is needed to provide a context for nested reducers.
      // Containers is an array so we will have multiple items and so that
      // the reducers are not overwriting each others context we are
      // providing one object per item in the array.
      this.cache = [];
    }

    if (this.images == null) {
      this.images = {};
    }

    if (this.endpoints == null) {
      this.endpoints = [];
    }

    if (this.volumeMounts == null) {
      this.volumeMounts = [];
    }
    let newState = state.slice();
    const joinedPath = path.join(".");

    if (joinedPath === "containers") {
      switch (type) {
        case ADD_ITEM:
          const name = ContainerUtil.getNewContainerName(
            newState.length,
            newState
          );

          newState.push(
            Object.assign({}, DEFAULT_POD_CONTAINER, { name }, value)
          );
          this.cache.push({});
          this.endpoints.push([]);
          break;
        case REMOVE_ITEM:
          newState = newState.filter((item, index) => {
            return index !== value;
          });
          this.cache = this.cache.filter((item, index) => {
            return index !== value;
          });
          this.endpoints = this.endpoints.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      return newState;
    }

    this.volumeMounts = volumeMountsReducer(this.volumeMounts, {
      type,
      path,
      value
    });

    newState = state.map((container, index) => {
      if (this.volumeMounts.length !== 0) {
        container.volumeMounts = this.volumeMounts
          .filter(volumeMount => {
            return volumeMount.name != null && volumeMount.mountPath[index];
          })
          .map(volumeMount => {
            return {
              name: volumeMount.name,
              mountPath: volumeMount.mountPath[index]
            };
          });
      }

      if (this.volumeMounts.length === 0 && container.volumeMounts != null) {
        container.volumeMounts = [];
      }

      return container;
    });

    if (field === "endpoints") {
      if (this.endpoints[index] == null) {
        this.endpoints[index] = [];
      }

      this.endpoints = endpointsJSONReducer(this.endpoints, {
        type,
        path,
        value
      });
    }
    newState = newState.map((container, index) => {
      if (
        this.endpoints &&
        this.endpoints[index] &&
        this.endpoints[index].length !== 0
      ) {
        container.endpoints = mapEndpoints(
          this.endpoints[index],
          this.networkType,
          this.appState
        );
      }

      return container;
    });

    if (field === "healthCheck") {
      if (this.healthCheckState[index] == null) {
        this.healthCheckState[index] = {};
      }

      newState[index].healthCheck = multiContainerHealthCheckReducer.call(
        this.healthCheckState[index],
        newState[index].healthCheck,
        { type, path: path.slice(3), value }
      );
    }

    if (field === "artifacts") {
      // Create a local cache of artifacts so we can filter the display values
      if (this.artifactState == null) {
        this.artifactState = [];
      }

      // Filter empty values and assign to state
      multiContainerArtifactsJSONReducer
        .call(this.artifactState, null, { type, path, value })
        .forEach((item, index) => {
          newState[index].artifacts = item.filter(({ uri }) => !isEmpty(uri));
        });
    }

    if (type === SET && joinedPath === `containers.${index}.name`) {
      newState[index].name = value;
    }

    if (
      type === SET &&
      joinedPath === `containers.${index}.exec.command.shell`
    ) {
      newState[index].exec = Object.assign({}, newState[index].exec, {
        command: { shell: value }
      });
    }

    if (type === SET && field === "resources") {
      // Parse numbers
      newState[index].resources = containerFloatReducer.call(
        this.cache[index],
        newState[index].resources,
        { type, value, path: [field, subField] }
      );
    }

    if (type === SET && joinedPath === `containers.${index}.image`) {
      newState[index].image = this.images[index] = Object.assign(
        {},
        newState[index].image,
        value
      );
    }

    if (type === SET && joinedPath === `containers.${index}.image.id`) {
      newState[index].image = this.images[index] = Object.assign(
        {},
        this.images[index],
        {
          id: value,
          kind: "DOCKER"
        }
      );
      if (shouldDeleteContainerImage(newState[index].image)) {
        delete newState[index].image;
      }
    }

    if (type === SET && joinedPath === `containers.${index}.image.forcePull`) {
      newState[index].image = this.images[index] = Object.assign(
        {},
        this.images[index],
        {
          forcePull: value
        }
      );
      if (shouldDeleteContainerImage(newState[index].image)) {
        delete newState[index].image;
      }
    }

    return newState;
  },
  JSONParser: containersParser
};
