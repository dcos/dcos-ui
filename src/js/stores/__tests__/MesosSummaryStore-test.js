const MesosSummaryStore = require("../MesosSummaryStore");
const Framework = require("../../../../plugins/services/src/js/structs/Framework");

MesosSummaryStore.init();

let thisProcessSummaryError, thisGetServiceFromName;

describe("Mesos State Store", function() {
  describe("#processSummary", function() {
    beforeEach(function() {
      thisProcessSummaryError = MesosSummaryStore.processSummaryError;
      MesosSummaryStore.processSummaryError = jest.genMockFunction();
      MesosSummaryStore.processSummary({});
    });

    afterEach(function() {
      MesosSummaryStore.processSummaryError = thisProcessSummaryError;
    });

    it("calls processSummaryError with no arguments when summary is empty Object", function() {
      expect(MesosSummaryStore.processSummaryError.mock.calls.length).toEqual(
        1
      );
      expect(
        MesosSummaryStore.processSummaryError.mock.calls[0].length
      ).toEqual(0);
    });
  });

  describe("#hasServiceUrl", function() {
    beforeEach(function() {
      thisGetServiceFromName = MesosSummaryStore.getServiceFromName;
      MesosSummaryStore.getServiceFromName = function(hasUrl) {
        if (hasUrl === "name_of_service_with_url") {
          return new Framework({
            name: "fake_service",
            webui_url: "http://google.com"
          });
        }

        return new Framework({
          name: "fake_service"
        });
      };
    });

    afterEach(function() {
      MesosSummaryStore.getServiceFromName = thisGetServiceFromName;
    });

    it("returns true if service has a web url", function() {
      var hasUrl = MesosSummaryStore.hasServiceUrl("name_of_service_with_url");

      expect(hasUrl).toEqual(true);
    });

    it("returns false if service does not have a web url", function() {
      var hasUrl = MesosSummaryStore.hasServiceUrl(
        "name_of_service_without_url"
      );

      expect(hasUrl).toEqual(false);
    });
  });
});
