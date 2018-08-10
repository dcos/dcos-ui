import React from "react";
import renderer from "react-test-renderer";
import { IntlProvider } from "react-intl";
import { Observable } from "rxjs/Observable";
import enUS from "#SRC/js/translations/en-US.json";

import { connectMasterComponent, combineMasterData } from "../MesosMasters";

const leader = {
  hostPort: "127.1.2.3:8080",
  version: "2.9.1",
  electedTime: 1532340694.04573,
  startTime: 1232340694.04573,
  region: "us-east-1"
};

const nonLeader = [
  {
    host_ip: "192.168.0.1",
    health: 0,
    role: "master",
    healthDescription: {
      classNames: "text-success",
      key: "HEALTHY",
      sortingValue: 3,
      title: "Healthy",
      value: 0
    }
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
      value: 1
    }
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
      value: 2
    }
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
      value: 3
    }
  }
];

function mastersInitialState() {
  return {
    leader: {
      hostPort: undefined,
      hostIp: undefined,
      version: undefined,
      electedTime: undefined,
      startTime: undefined,
      region: undefined
    },
    masters: undefined
  };
}

const TestableMasterComponent = ({ component }) => {
  return (
    <IntlProvider locale="en" messages={enUS}>
      {component}
    </IntlProvider>
  );
};

describe("LeaderGrid", function() {
  it("renders with running status", function() {
    const initialState = mastersInitialState;

    const leaderData = () => Observable.of(leader);
    const healthData = () => Observable.of(nonLeader);
    const combinedData = combineMasterData(leaderData, healthData);
    const MasterNodesTab = connectMasterComponent(initialState, combinedData);

    expect(
      renderer
        .create(<TestableMasterComponent component={<MasterNodesTab />} />)
        .toJSON()
    ).toMatchSnapshot();
  });
});
