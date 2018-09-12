const VipLabelUtil = {
  generateVipLabel(appId, portDefinition, vipLabel, vipPort) {
    const { labels, loadBalanced, vip } = portDefinition;

    // Only set VIP labels if port mapping is load balanced
    if (loadBalanced) {
      let vipValue = vip;

      if (vipValue == null) {
        vipValue = `${appId}:${vipPort}`;
      }

      const vipMatch = vipValue.match(/(.+):\d+/);
      if (vipMatch) {
        vipValue = `${vipMatch[1]}:${vipPort}`;
      }

      return Object.assign({}, labels, { [vipLabel]: vipValue });
    }

    const labelsHadVip =
      labels && Object.prototype.hasOwnProperty.call(labels, vipLabel);

    if (labelsHadVip) {
      return Object.assign({}, labels, { [vipLabel]: undefined });
    }

    return labels;
  },

  findVip(labels = {}) {
    return Object.entries(labels).find(([key, _]) => key.match(/^(vip|VIP)/));
  },

  defaultVip(index) {
    return `VIP_${index}`;
  }
};

module.exports = VipLabelUtil;
