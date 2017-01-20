const Networking = {
  type: {
    BRIDGE: 'BRIDGE',
    CONTAINER: 'CONTAINER',
    HOST: 'HOST',
    USER: 'USER'
  },
  L4LB_ADDRESS: '.marathon.l4lb.thisdcos.directory',
  VIP_LABEL_REGEX: /^VIP_[0-9]+$/
};

module.exports = Networking;
