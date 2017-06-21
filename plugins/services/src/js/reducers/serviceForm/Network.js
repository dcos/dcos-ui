import {
  findNestedPropertyInObject
} from "../../../../../../src/js/utils/Util";
import Transaction from "../../../../../../src/js/structs/Transaction";
import Networking from "../../../../../../src/js/constants/Networking";

const { USER } = Networking.type;

module.exports = {
  JSONReducer: null,

  JSONParser(state) {
    const transactions = [];
    let networkType = findNestedPropertyInObject(
      state,
      "container.docker.network"
    );
    const networkName = findNestedPropertyInObject(
      state,
      "ipAddress.networkName"
    );

    if (networkType == null && networkName == null) {
      return transactions;
    }

    if (networkName != null) {
      networkType = USER;
    }

    if (networkName != null && networkType != null) {
      transactions.push(
        new Transaction(
          ["container", "docker", "network"],
          `${networkType}.${networkName}`
        )
      );

      const groups = findNestedPropertyInObject(state, "ipAddress.groups");
      const discovery = findNestedPropertyInObject(
        state,
        "ipAddress.discovery"
      );
      const labels = findNestedPropertyInObject(state, "ipAddress.labels");

      if (groups != null) {
        transactions.push(new Transaction(["ipAddress", "groups"], groups));
      }

      if (labels != null) {
        transactions.push(new Transaction(["ipAddress", "labels"], labels));
      }

      if (discovery != null) {
        transactions.push(
          new Transaction(["ipAddress", "discovery"], discovery)
        );
      }
    } else {
      transactions.push(
        new Transaction(["container", "docker", "network"], networkType)
      );
    }

    return transactions;
  },

  FormReducer: null
};
