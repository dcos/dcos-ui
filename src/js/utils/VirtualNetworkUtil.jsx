import { Link } from "react-router";

import React from "react";

import AlertPanel from "../components/AlertPanel";
import AlertPanelHeader from "../components/AlertPanelHeader";

const VirtualNetworkUtil = {
  getEmptyNetworkScreen() {
    return (
      <AlertPanel>
        <AlertPanelHeader>Virtual network not found</AlertPanelHeader>
        <p className="flush">
          Could not find the requested virtual network. Go to{" "}
          <Link to="/networking/networks">Networks</Link> overview to see all
          virtual networks.
        </p>
      </AlertPanel>
    );
  }
};

export default VirtualNetworkUtil;
