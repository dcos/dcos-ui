import MesosSummaryStore from "../MesosSummaryStore";
import Framework from "../../../../plugins/services/src/js/structs/Framework";

MesosSummaryStore.init();

let thisProcessSummaryError, thisGetServiceFromName;

describe("Mesos State Store", () => {
  describe("#processSummary", () => {
    beforeEach(() => {
      thisProcessSummaryError = MesosSummaryStore.processSummaryError;
      MesosSummaryStore.processSummaryError = jest.fn();
      MesosSummaryStore.processSummary({});
    });

    afterEach(() => {
      MesosSummaryStore.processSummaryError = thisProcessSummaryError;
    });

    it("calls processSummaryError with no arguments when summary is empty Object", () => {
      expect(MesosSummaryStore.processSummaryError.mock.calls.length).toEqual(
        1
      );
      expect(
        MesosSummaryStore.processSummaryError.mock.calls[0].length
      ).toEqual(0);
    });
  });

  describe("#hasServiceUrl", () => {
    beforeEach(() => {
      thisGetServiceFromName = MesosSummaryStore.getServiceFromName;
      MesosSummaryStore.getServiceFromName = (hasUrl) => {
        if (hasUrl === "name_of_service_with_url") {
          return new Framework({
            name: "fake_service",
            webui_url: "http://google.com",
          });
        }

        return new Framework({
          name: "fake_service",
        });
      };
    });

    afterEach(() => {
      MesosSummaryStore.getServiceFromName = thisGetServiceFromName;
    });

    it("returns true if service has a web url", () => {
      const hasUrl = MesosSummaryStore.hasServiceUrl(
        "name_of_service_with_url"
      );

      expect(hasUrl).toEqual(true);
    });

    it("returns false if service does not have a web url", () => {
      const hasUrl = MesosSummaryStore.hasServiceUrl(
        "name_of_service_without_url"
      );

      expect(hasUrl).toEqual(false);
    });
  });
});
