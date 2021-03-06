import { marbles } from "rxjs-marbles/jest";
import { of } from "rxjs";
import { take } from "rxjs/operators";

import { mesosMastersHealthQuery } from "../MesosMastersHealth";

const nonLeaders = [
  { host_ip: "192.168.0.1", health: 0, role: "master" },
  { host_ip: "192.168.0.2", health: 1, role: "master" },
  { host_ip: "192.168.0.3", health: 2, role: "master" },
  { host_ip: "192.168.0.4", health: 4, role: "master" },
];

const nonLeadersWithHealth = [
  {
    host_ip: "192.168.0.1",
    health: 0,
    role: "master",
    healthDescription: {
      classNames: "text-success",
      key: "HEALTHY",
      sortingValue: 3,
      title: "Healthy",
      value: 0,
    },
  },
  {
    host_ip: "192.168.0.2",
    health: 1,
    role: "master",
    healthDescription: {
      classNames: "text-danger",
      key: "UNHEALTHY",
      sortingValue: 0,
      title: "Unhealthy",
      value: 1,
    },
  },
  {
    host_ip: "192.168.0.3",
    health: 2,
    role: "master",
    healthDescription: {
      classNames: "text-warning",
      key: "WAR",
      sortingValue: 2,
      title: "Warning",
      value: 2,
    },
  },
  {
    host_ip: "192.168.0.4",
    health: 4,
    role: "master",
    healthDescription: {
      classNames: "text-mute",
      key: "NA",
      sortingValue: 1,
      title: "N/A",
      value: 3,
    },
  },
];

describe("MesosMastersHealth", () => {
  describe("#mesosMasterInfo", () => {
    it(
      "emits correct master",
      marbles((m) => {
        const master$ = mesosMastersHealthQuery(
          () => of(nonLeaders),
          m.time("--|")
        );
        const expected$ = m.cold("a-(a|)", {
          a: nonLeadersWithHealth,
        });

        m.expect(master$.pipe(take(2))).toBeObservable(expected$);
      })
    );
  });
});
