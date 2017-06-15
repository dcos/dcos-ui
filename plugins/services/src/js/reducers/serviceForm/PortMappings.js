import {
  findNestedPropertyInObject
} from "../../../../../../src/js/utils/Util";
import {
  ADD_ITEM,
  SET
} from "../../../../../../src/js/constants/TransactionTypes";
import Transaction from "../../../../../../src/js/structs/Transaction";
import { PROTOCOLS } from "../../constants/PortDefinitionConstants";

module.exports = {
  /**
   * This parser must take precedence over PortDefinition parser, as it assumes
   * some data available from it
   * @param {Object} state current appConfig
   * @returns {Transaction[]} A list of transactions resulting _portDefinition_
   * settings. NOT portMappings! The source of truth is portDefinitions, but
   * portMapping takes precedence.
   */
  JSONParser(state) {
    const portMappings = findNestedPropertyInObject(
      state,
      "container.docker.portMappings"
    ) || [];
    const portDefinitionsLength =
      findNestedPropertyInObject(state, "portDefinitions.length") || 0;

    // Add additional fields if we have more definitions in portMappings
    // than in portDefinitions
    const length = portMappings.length - portDefinitionsLength;
    const addTransactions = [];
    Array.from({ length }).forEach((_, index) => {
      addTransactions.push(
        new Transaction(
          ["portDefinitions"],
          portMappings.length + index - 1,
          ADD_ITEM
        )
      );
    });

    // Look at portMappings and add accepted fields
    // but translate them into portDefinitions
    return portMappings.reduce(function(memo, item, index) {
      if (item.name != null) {
        memo.push(
          new Transaction(["portDefinitions", index, "name"], item.name, SET)
        );
      }

      // If port is a number but not zero, we set automaticPort to false
      // so we can set the port and portMapping to true,
      // since we have a host port
      const hostPort = Number(item.hostPort);
      if (!isNaN(hostPort) && hostPort !== 0) {
        memo.push(
          new Transaction(
            ["portDefinitions", index, "automaticPort"],
            false,
            SET
          )
        );

        memo.push(
          new Transaction(["portDefinitions", index, "portMapping"], true, SET)
        );

        memo.push(
          new Transaction(["portDefinitions", index, "hostPort"], hostPort, SET)
        );
      }

      // If port is zero, we set automaticPort to true and portMapping to true,
      // since we have a host port
      if (!isNaN(hostPort) && hostPort === 0) {
        memo.push(
          new Transaction(
            ["portDefinitions", index, "automaticPort"],
            true,
            SET
          )
        );

        memo.push(
          new Transaction(["portDefinitions", index, "portMapping"], true, SET)
        );
      }

      // If port is not set, we set portMapping to false
      if (isNaN(hostPort)) {
        memo.push(
          new Transaction(["portDefinitions", index, "portMapping"], false, SET)
        );
      }

      const containerPort = Number(item.containerPort);
      if (!isNaN(containerPort)) {
        memo.push(
          new Transaction(
            ["portDefinitions", index, "containerPort"],
            containerPort,
            SET
          )
        );
      }

      const servicePort = Number(item.servicePort);
      if (!isNaN(servicePort)) {
        memo.push(
          new Transaction(
            ["portDefinitions", index, "servicePort"],
            servicePort,
            SET
          )
        );
      }

      if (item.protocol != null) {
        const protocols = item.protocol.split(",");
        PROTOCOLS.forEach(protocol => {
          memo.push(
            new Transaction(
              ["portDefinitions", index, "protocol", protocol],
              protocols.includes(protocol),
              SET
            )
          );
        });
      }

      const vip = findNestedPropertyInObject(item, `labels.VIP_${index}`);
      if (vip != null) {
        memo.push(
          new Transaction(["portDefinitions", index, "loadBalanced"], true, SET)
        );

        if (!vip.startsWith(`${state.id}:`)) {
          memo.push(
            new Transaction(["portDefinitions", index, "vip"], vip, SET)
          );
        }

        const vipPortMatch = vip.match(/.+:(\d+)/);
        if (vipPortMatch) {
          memo.push(
            new Transaction(
              ["portDefinitions", index, "vipPort"],
              vipPortMatch[1],
              SET
            )
          );
        }
      }

      if (item.labels != null) {
        memo.push(
          new Transaction(
            ["portDefinitions", index, "labels"],
            item.labels,
            SET
          )
        );
      }

      return memo;
    }, addTransactions);
  }
};
