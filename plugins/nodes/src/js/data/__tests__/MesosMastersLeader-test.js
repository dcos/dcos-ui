import { marbles } from "rxjs-marbles/jest";
import { take } from "rxjs/operators";

import { mesosMasterLeaderQuery, getRegion } from "../MesosMastersLeader";

function faultDomainData() {
  return {
    region: { name: "us-east-1" }
  };
}

function masterData(faultDomain) {
  return {
    master_info: {
      address: {
        hostname: "127.0.0.1",
        port: "8080"
      },
      start_time: 12345789.0,
      elected_time: 12345789.0,
      version: "1.2.2",
      domain: {
        fault_domain: faultDomain
      }
    }
  };
}

describe("MesosMastersLeader", function() {
  describe("#mesosMasterInfo", function() {
    it(
      "emits correct master",
      marbles(function(m) {
        const expectedData = {
          electedTime: 12345789,
          hostPort: "127.0.0.1:8080",
          region: "us-east-1",
          startTime: 12345789,
          version: "1.2.2"
        };

        const master$ = mesosMasterLeaderQuery(
          () => masterData(faultDomainData()),
          m.time("--|")
        );
        const expected$ = m.cold("a-(a|)", {
          a: expectedData
        });

        m.expect(master$.pipe(take(2))).toBeObservable(expected$);
      })
    );
  });

  describe("#getRegion", function() {
    it("retrieves region correctly", function() {
      const master = masterData(faultDomainData()).master_info;

      expect(getRegion(master)).toBe("us-east-1");
    });

    it("returns N/A for missing region", function() {
      const master = masterData().master_info;

      expect(getRegion(master)).toBe("N/A");
    });
  });
});
