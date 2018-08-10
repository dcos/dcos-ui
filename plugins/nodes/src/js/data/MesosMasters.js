import React from "react";

import { mesosMastersLeader } from "./MesosMastersLeader";
import { mesosMastersHealth } from "./MesosMastersHealth";

import LeaderGrid from "../components/LeaderGrid";
import NonLeadersGrid from "../components/NonLeadersGrid";

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

function filterLeader(leader, masters) {
  if (masters === undefined) {
    return undefined;
  }

  return masters.filter(master => master.host_ip !== leader.hostIp);
}

export function combineMasterData(leaderDataSource, mesosMastersHealth) {
  const mesosLeader$ = leaderDataSource().startWith(
    mastersInitialState().leader
  );
  const mesosMasters$ = mesosMastersHealth().startWith(undefined);

  return function() {
    return mesosLeader$.combineLatest(mesosMasters$, (leader, masters) => ({
      leader,
      masters: filterLeader(leader, masters)
    }));
  };
}

// This is an attempt of the mediator pattern without componentFromStream
export function connectMasterComponent(initialState, stream) {
  class MesosMasters extends React.Component {
    constructor() {
      super(...arguments);

      this.stream = this.props.stream();
      this.state = this.props.initialState();
    }

    componentDidMount() {
      this.subscription = this.stream.subscribe(this.setState.bind(this));
    }

    componentWillUnmount() {
      this.subscription.unsubscribe();
    }

    render() {
      const { masters, leader } = this.state;

      return (
        <div>
          <LeaderGrid leader={leader} />
          <NonLeadersGrid masters={masters} />
        </div>
      );
    }
  }

  return () => <MesosMasters initialState={initialState} stream={stream} />;
}

const mastersWithHealth = combineMasterData(
  mesosMastersLeader,
  mesosMastersHealth
);

export default connectMasterComponent(mastersInitialState, mastersWithHealth);
