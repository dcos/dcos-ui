import { getMasterRegionName } from "../MesosMasterRequest";
import { of } from "rxjs";

describe("#getMasterRegionName", () => {
  it("returns the master region name", async () => {
    const data = await getMasterRegionName(
      of({
        type: "GET_MASTER",
        get_master: {
          master_info: {
            id: "697ef956-6d93-458c-90e7-f64b19a64df3",
            ip: 3137798154,
            port: 5050,
            pid: "master@10.0.7.187:5050",
            hostname: "10.0.7.187",
            version: "1.8.0",
            address: {
              hostname: "10.0.7.187",
              ip: "10.0.7.187",
              port: 5050,
            },
            domain: {
              fault_domain: {
                region: {
                  name: "aws/eu-central-1",
                },
                zone: {
                  name: "aws/eu-central-1b",
                },
              },
            },
            capabilities: [{ type: "AGENT_UPDATE" }],
          },
          start_time: 1554119786.1644359,
          elected_time: 1554119789.467335,
        },
      })
    ).toPromise();

    expect(data).toBe("aws/eu-central-1");
  });
});
