import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import Transaction from "#SRC/js/structs/Transaction";
import Networking from "#SRC/js/constants/Networking";

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
          ["networks", 0, "mode"],
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
      transactions.push(new Transaction(["networks", 0, "mode"], networkType));
    }

    return transactions;
  },

  FormReducer: null
};
