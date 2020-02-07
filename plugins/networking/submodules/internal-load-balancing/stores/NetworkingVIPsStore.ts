import BaseStore from "#SRC/js/stores/BaseStore";
import {
  NETWORKING_VIPS_CHANGE,
  NETWORKING_VIPS_REQUEST_ERROR,
  NETWORKING_VIP_DETAIL_CHANGE,
  NETWORKING_VIP_DETAIL_REQUEST_ERROR
} from "../constants/EventTypes";

import {
  REQUEST_NETWORKING_VIPS_SUCCESS,
  REQUEST_NETWORKING_VIPS_ERROR,
  REQUEST_NETWORKING_VIP_DETAIL_SUCCESS,
  REQUEST_NETWORKING_VIP_DETAIL_ERROR,
  REQUEST_NETWORKING_VIP_DETAIL_ONGOING
} from "../constants/ActionTypes";

import NetworkingActions from "../actions/NetworkingActions";
import NetworkingConfig from "../../../config/NetworkingConfig";
import VIPDetail from "../structs/VIPDetail";

const SDK = require("../../../SDK");

let fetchVIPDetailInterval = null;

class NetworkingVIPsStore extends BaseStore {
  constructor(...args) {
    super(...args);

    SDK.getSDK().addStoreConfig({
      store: this,
      storeID: "networkingVIPs",
      events: {
        success: NETWORKING_VIPS_CHANGE,
        error: NETWORKING_VIPS_REQUEST_ERROR,
        detailSuccess: NETWORKING_VIP_DETAIL_CHANGE,
        detailError: NETWORKING_VIP_DETAIL_REQUEST_ERROR
      },
      unmountWhen: () => false
    });

    SDK.getSDK().onDispatch(action => {
      switch (action.type) {
        case REQUEST_NETWORKING_VIPS_SUCCESS:
          this.processVIPs(action.data);
          break;
        case REQUEST_NETWORKING_VIPS_ERROR:
          this.processVIPsError(action.data);
          break;
        case REQUEST_NETWORKING_VIP_DETAIL_SUCCESS:
          this.processVIPDetail(action.vip, action.data);
          break;
        case REQUEST_NETWORKING_VIP_DETAIL_ERROR:
          this.processVIPDetailError(action.vip, action.data);
          break;
        case REQUEST_NETWORKING_VIP_DETAIL_ONGOING:
          this.handleOngoingVIPDetailRequest();
          break;
      }
    });
  }

  startFetchVIPDetail(protocol, vip, port) {
    if (fetchVIPDetailInterval) {
      return;
    }

    NetworkingActions.fetchVIPDetail(protocol, vip, port);

    fetchVIPDetailInterval = window.setInterval(() => {
      NetworkingActions.fetchVIPDetail(protocol, vip, port);
    }, NetworkingConfig.fetchInterval);
  }

  stopFetchVIPDetail() {
    if (fetchVIPDetailInterval) {
      window.clearInterval(fetchVIPDetailInterval);
      fetchVIPDetailInterval = null;
    }
  }

  fetchVIPs(...args) {
    return NetworkingActions.fetchVIPs(...args);
  }

  get(prop) {
    return SDK.getSDK().Store.getOwnState().internalLoadBalancing[prop];
  }

  getVIPDetail(vipString) {
    const vipDetail = this.get("vipDetail")[vipString];

    if (vipDetail) {
      return new VIPDetail(vipDetail);
    }

    return null;
  }

  handleOngoingVIPDetailRequest() {
    // We could do something here
  }

  processVIPs(vips) {
    SDK.getSDK().dispatch({
      type: NETWORKING_VIPS_CHANGE,
      vips
    });
    this.emit(NETWORKING_VIPS_CHANGE);
  }

  processVIPsError(error) {
    this.emit(NETWORKING_VIPS_REQUEST_ERROR, error);
  }

  processVIPDetail(vip, vipDetail) {
    const currentVIPDetail = this.get("vipDetail");
    currentVIPDetail[vip] = vipDetail;
    SDK.getSDK().dispatch({
      type: NETWORKING_VIP_DETAIL_CHANGE,
      vipDetail: currentVIPDetail
    });
    this.emit(NETWORKING_VIP_DETAIL_CHANGE, vip);
  }

  processVIPDetailError(vip, error) {
    this.emit(NETWORKING_VIP_DETAIL_REQUEST_ERROR, vip, error);
  }
}

export default new NetworkingVIPsStore();
