import { ADD_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";
import Networking from "#SRC/js/constants/Networking";
import PortDefinitionsReducer from "./JSONReducers/PortDefinitionsReducer";
import { PROTOCOLS } from "../../constants/PortDefinitionConstants";
import VipLabelUtil from "../../utils/VipLabelUtil";

const { HOST } = Networking.type;

module.exports = {
  /**
   * Creates portDefinitions for the JSON Editor. Only returns definitions for
   * network type HOST, but will still record changes if network is
   * something else
   * @param {Object[]} state Initial state to apply action on
   * @param {Object} action
   * @param {(ADD_ITEM|REMOVE_ITEM|SET)} action.type - action to perform
   * @param {String[]} action.path - location of value
   * @param {*} action.value - value to perform action with
   * @return {Object[]} new portDefinitions with action performed on it
   */
  JSONReducer(state = [], action) {
    const { path, value } = action;
    if (path == null) {
      return state;
    }

    if (!this.appState) {
      this.appState = {
        id: "",
        networkType: HOST
      };
    }

    const joinedPath = path.join(".");
    if (joinedPath === "networks.0.network" && value != null) {
      const [mode, _name] = value.split(".");
      this.appState.networkType = mode;
    }
    if (joinedPath === "networks.0.mode" && value != null) {
      this.appState.networkType = value;
    }

    if (joinedPath === "id" && value != null) {
      this.appState.id = value;
    }

    if (joinedPath === "portsAutoAssign" && value != null) {
      this.appState.portsAutoAssign = value;
    }

    // Apply PortDefinitionsReducer to retrieve updated local state
    // Store the change no matter what network type we have
    this.portDefinitions = PortDefinitionsReducer(this.portDefinitions, action);

    // We only want portDefinitions for networks of type HOST
    if (this.appState.networkType !== HOST) {
      return null;
    }

    // Create JSON port definitions from state
    return this.portDefinitions.map((portDefinition, index) => {
      const { name } = portDefinition;
      const vipLabel =
        portDefinition.vipLabel || VipLabelUtil.defaultVip(index);
      const hostPort = portDefinition.hostPort
        ? Number(portDefinition.hostPort)
        : 0;
      const defaultVipPort = hostPort !== 0 ? hostPort : null;
      const vipPort = portDefinition.vipPort || defaultVipPort;

      let protocol = null;
      if (portDefinition.protocol) {
        protocol = PROTOCOLS.filter(
          protocol => portDefinition.protocol[protocol]
        ).join(",");
      }

      const labels = VipLabelUtil.generateVipLabel(
        this.appState.id,
        portDefinition,
        vipLabel,
        vipPort
      );

      return {
        labels,
        name,
        protocol,
        port: hostPort
      };
    });
  },

  /**
   * Parses a configuration and produces necessary Transactions for a Batch
   * to create an equal JSON configuration
   * @param {Object[]} state - Initial state to apply action on
   * @return {Transaction[]} Array of Transactions to produce
   * given configuration
   */
  JSONParser(state) {
    if (state.portDefinitions == null) {
      return [];
    }

    // Look at portDefinitions and add accepted fields
    return state.portDefinitions.reduce((memo, item, index) => {
      memo.push(new Transaction(["portDefinitions"], item, ADD_ITEM));

      if (item.name != null) {
        memo.push(
          new Transaction(["portDefinitions", index, "name"], item.name, SET)
        );
      }

      const port = Number(item.port);
      if (!isNaN(port)) {
        memo.push(
          new Transaction(["portDefinitions", index, "hostPort"], port, SET)
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

      const vip = VipLabelUtil.findVip(item.labels);

      if (vip != null) {
        const [vipLabel, vipValue] = vip;

        memo.push(
          new Transaction(["portDefinitions", index, "loadBalanced"], true, SET)
        );

        memo.push(
          new Transaction(["portDefinitions", index, "vipLabel"], vipLabel, SET)
        );

        if (!vipValue.startsWith(`${state.id}:`)) {
          memo.push(
            new Transaction(["portDefinitions", index, "vip"], vipValue, SET)
          );
        }

        const vipPortMatch = vipValue.match(/.+:(\d+)/);
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
    }, []);
  }
};
