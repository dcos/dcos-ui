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

      return {
        ...labels,
        [vipLabel]: vipValue,
      };
    }

    const labelsHadVip =
      labels && Object.prototype.hasOwnProperty.call(labels, vipLabel);

    if (labelsHadVip) {
      return {
        ...labels,
        [vipLabel]: undefined,
      };
    }

    return labels;
  },

  findVip(labels = {}) {
    if (typeof labels !== "object" || labels === null) {
      return undefined;
    }
    return Object.entries(labels).find(([key, _]) => key.match(/^(vip|VIP)/));
  },

  defaultVip(index) {
    return `VIP_${index}`;
  },
};

export default VipLabelUtil;
