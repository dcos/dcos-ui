import React from "react";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/timer";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/retry";
import "rxjs/add/operator/filter";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";

import LeaderGrid from "../components/LeaderGrid";

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function hostPort(address) {
  return `${address.hostname}:${address.port}`;
}

// ask how to fix better
function supportsRegion(master) {
  return (
    master.domain &&
    master.domain.fault_domain &&
    master.domain.fault_domain.region &&
    master.domain.fault_domain.region.name
  );
}

function getRegion(master) {
  return supportsRegion(master)
    ? master.domain.fault_domain.region.name
    : "N/A";
}

const STORE_POLL_INTERVAL = 2000;

export default class MesosMasters extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      hostPort: undefined,
      version: undefined,
      electedTime: undefined,
      startTime: undefined,
      region: undefined
    };

    this.stream = Observable.interval(STORE_POLL_INTERVAL)
      .map(_ => {
        return MesosStateStore.getLastMesosState();
      })
      .map(mesosState => mesosState.master_info)
      .filter(master => !isEmptyObject(master))
      .map(master => {
        return {
          hostPort: hostPort(master.address),
          version: master.version,
          electedTime: master.elected_time,
          startTime: master.start_time,
          region: getRegion(master)
        };
      });
  }

  componentDidMount() {
    this.subscription = this.stream.subscribe(master => {
      this.setState(master);
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const master = this.state;

    return <LeaderGrid master={master} />;
  }
}
