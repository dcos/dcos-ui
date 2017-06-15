const VipLabelUtil = {
  generateVipLabel(appId, portDefinition, vipLabel, vipPort) {
    const { labels, loadBalanced, vip } = portDefinition;

    // Only set VIP labels if port mapping is load balanced
    if (loadBalanced) {
      let vipValue = vip;

      if (vipValue == null) {
        vipValue = `${appId}:${vipPort}`;
      }

      return Object.assign({}, labels, { [vipLabel]: vipValue });
    }

    const labelsHadVip =
      labels && Object.prototype.hasOwnProperty.call(labels, vipLabel);

    if (labelsHadVip) {
      return Object.assign({}, labels, { [vipLabel]: undefined });
    }

    return labels;
  }
};

module.exports = VipLabelUtil;
