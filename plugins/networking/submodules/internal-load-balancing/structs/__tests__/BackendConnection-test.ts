import ClientList from "../ClientList";
import BackendConnection from "../BackendConnection";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("networking", { enabled: true });
require("../../../../SDK").setSDK(SDK);

import backendConnectionsDetail from "../../../../../../tests/_fixtures/networking/networking-backend-connections.json";

let thisBackendConnection;

describe("BackendConnection", () => {
  beforeEach(() => {
    thisBackendConnection = new BackendConnection(backendConnectionsDetail);
  });

  describe("#getClients", () => {
    it("returns an instance of ClientList", () => {
      expect(
        thisBackendConnection.getClients() instanceof ClientList
      ).toBeTruthy();
    });

    it("returns the all of the backends it was given", () => {
      expect(thisBackendConnection.getClients().getItems().length).toEqual(
        backendConnectionsDetail.clients.length
      );
    });
  });
});
