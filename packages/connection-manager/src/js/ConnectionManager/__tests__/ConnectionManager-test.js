import { default as Connection } from "../../Connection/AbstractConnection";
import ConnectionManagerClass from "../ConnectionManager.js";

jest.mock("../../ConnectionQueue/ConnectionQueue");
jest.mock("../../Connection/AbstractConnection");

let ConnectionManager;
const url = "http://example.com/foobar.json";

describe("ConnectionManager", () => {
  const $scope = {};

  beforeEach(() => {
    $scope.connection = new Connection(url);
    ConnectionManager = new ConnectionManagerClass();
  });

  describe("#queue", function() {
    it("adds listeners to new connection", () => {
      ConnectionManager.queue($scope.connection);

      expect($scope.connection.on).toBeCalled();
    });
  });

  describe("#next", function() {
    it("opens next waiting connection from store", () => {
      ConnectionManager.waiting.__setSize(1);
      ConnectionManager.waiting.first.mockReturnValueOnce($scope.connection);

      ConnectionManager.next();
      expect($scope.connection.open).toBeCalled();
      ConnectionManager.waiting.__setSize(0);
    });
  });

  describe("#handleConnectionClose", function() {
    it("deletes connection from the list", function() {
      ConnectionManager.queue($scope.connection);
      $scope.connection.close();

      expect(ConnectionManager.open.size).toEqual(0);
    });
  });
});
