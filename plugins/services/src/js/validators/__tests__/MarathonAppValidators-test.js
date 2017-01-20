jest.unmock('../MarathonAppValidators');
const MarathonAppValidators = require('../MarathonAppValidators');

const APPCONTAINERID_ERRORS = [
  {
    path: ['container', 'appc', 'id'],
    message: 'AppContainer id should start with \'sha512-\'',
    type: 'MARATHON_APP_APPCONTAINER_ID',
    variables: {}
  }
];
const CMDORDOCKERIMAGE_ERRORS = [
  {
    path: ['cmd'],
    message: 'You must specify a command, an argument or a container',
    type: 'MARATHON_APP_CMD_OR_IMAGE',
    variables: {}
  },
  {
    path: ['args'],
    message: 'You must specify a command, an argument or a container',
    type: 'MARATHON_APP_CMD_OR_IMAGE',
    variables: {}
  },
  {
    path: ['container', 'docker', 'image'],
    message: 'You must specify a command, an argument or a container',
    type: 'MARATHON_APP_CMD_OR_IMAGE',
    variables: {}
  }
];

const COMPLYWITHRESIDENCY_ERRORS = [
  {
    path: ['residency'],
    message: 'AppDefinition must contain persistent volumes and define residency',
    type: 'MARATHON_APP_RESIDENCY_RULES',
    variables: {}
  },
  {
    path: ['container', 'volumes'],
    message: 'AppDefinition must contain persistent volumes and define residency',
    type: 'MARATHON_APP_RESIDENCY_RULES',
    variables: {}
  }
];

const COMPLYWITHIPADDRESS_ERRORS = [
  {
    path: ['ipAddress'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks',
    type: 'MARATHON_APP_IP_ADDRESS_RULES',
    variables: {}
  },
  {
    path: ['discoveryInfo'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks',
    type: 'MARATHON_APP_IP_ADDRESS_RULES',
    variables: {}
  },
  {
    path: ['container', 'docker', 'network'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks',
    type: 'MARATHON_APP_IP_ADDRESS_RULES',
    variables: {}
  }
];

const NOTBOTHCMDARGS_ERRORS = [
  {
    path: ['cmd'],
    message: 'Please specify only one of `cmd` or `args`',
    type: 'MARATHON_APP_ONE_OF_CMD_ARGS',
    variables: {}
  },
  {
    path: ['args'],
    message: 'Please specify only one of `cmd` or `args`',
    type: 'MARATHON_APP_ONE_OF_CMD_ARGS',
    variables: {}
  }
];

describe('MarathonAppValidators', function () {

  describe('#containsCmdArgsOrContainer', function () {
    it('should return no errors if `cmd` defined', function () {
      const spec = {cmd: 'foo'};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual([]);
    });

    it('should return no errors if `args` defined', function () {
      const spec = {args: ['foo']};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual([]);
    });

    it('should return no errors if `container.docker.image` defined', function () {
      const spec = {container: {docker: {image: 'foo'}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual([]);
    });

    it('should return no errors if `container.appc.image` defined', function () {
      const spec = {container: {appc: {image: 'foo'}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual([]);
    });

    it('should return error if both `args` and `cmd` are defined', function () {
      const spec = {args: ['foo'], cmd: 'bar'};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(NOTBOTHCMDARGS_ERRORS);
    });

    it('should return all errors if neither is defined', function () {
      const spec = {};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is null', function () {
      const spec = {cmd: null};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is {}', function () {
      const spec = {cmd: {}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is []', function () {
      const spec = {cmd: []};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is empty string', function () {
      const spec = {cmd: ''};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container` is empty', function () {
      const spec = {container: {}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container.docker` is empty', function () {
      const spec = {container: {docker: {}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container.appc` is empty', function () {
      const spec = {container: {appc: {}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container.appc.id` does not start with "sha512-"', function () {
      const spec = {container: {appc: {image: 'foo', id: 'sha256-test'}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(APPCONTAINERID_ERRORS);
    });

    it('should not return errors if `container.appc` correctly defined', function () {
      const spec = {container: {appc: {image: 'foo', 'id': 'sha512-test'}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual([]);
    });
  });

  describe('#complyWithResidencyRules', function () {
    it('should return no errors if residency and container is undefined',
      function () {
        const spec = {};

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return no errors if residency and volumes is undefined',
      function () {
        const spec = {container: {}};

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return no errors if residency is undefined and volumes empty',
      function () {
        const spec = {container:{volumes:[]}};

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return no errors if residency and persistent is undefined',
      function () {
        const spec = {container:{volumes:[{}]}};

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return no errors if both of residency and persistent is defined',
      function () {
        const spec = {
          residency: 'foo',
          container: {volumes: [{persistent: {size: '524288'}}]}
        };

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return errors if only `residency` defined', function () {
      const spec = {residency: 'foo' };

      expect(MarathonAppValidators.complyWithResidencyRules(spec))
        .toEqual(COMPLYWITHRESIDENCY_ERRORS);
    });

    it('should return errors if only `persistentVolumes` defined', function () {
      const spec = {container: {volumes: [{persistent: {size: '524288'}}]}};

      expect(MarathonAppValidators.complyWithResidencyRules(spec))
        .toEqual(COMPLYWITHRESIDENCY_ERRORS);
    });
  });

  describe('#complyWithIpAddressRules', function () {
    it('should return no errors if nothing defined', function () {
      const spec = {};
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });

    it('should return no errors if `ipAddress` only defined', function () {
      const spec = {ipAddress: 'foo'};
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });

    it('should return no errors if `discoveryInfo` only defined', function () {
      const spec = {discoveryInfo: 'foo'};
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });

    it('should return no errors if `container.docker.network` only defined', function () {
      const spec = {container: {docker: {network: 'OTHER'}}};
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });

    it('should return errors if `ipAddress`, `discoveryInfo` and `container.docker.network` is `BRIDGE`', function () {
      const spec = {
        ipAddress: 'foo',
        discoveryInfo: 'bar',
        container: {docker: {network: 'BRIDGE'}}
      };
      expect(MarathonAppValidators.complyWithIpAddressRules(spec))
        .toEqual(COMPLYWITHIPADDRESS_ERRORS);
    });

    it('should return errors if `ipAddress`, `discoveryInfo` and `container.docker.network` is `USER`', function () {
      const spec = {
        ipAddress: 'foo',
        discoveryInfo: 'bar',
        container: {docker: {network: 'USER'}}
      };
      expect(MarathonAppValidators.complyWithIpAddressRules(spec))
        .toEqual(COMPLYWITHIPADDRESS_ERRORS);
    });

    it('should return no error if `ipAddress`, `discoveryInfo` and `container.docker.network` is `OTHER`', function () {
      const spec = {
        ipAddress: 'foo',
        discoveryInfo: 'bar',
        container: {docker: {network: 'OTHER'}}
      };
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });
  });
});
