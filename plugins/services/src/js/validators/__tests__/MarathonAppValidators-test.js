jest.unmock('../MarathonAppValidators');
const MarathonAppValidators = require('../MarathonAppValidators');

const CMDORDOCKERIMAGE_ERRORS = [
  {
    path: ['cmd'],
    message: 'You must specify a command, an argument or a container'
  },
  {
    path: ['args'],
    message: 'You must specify a command, an argument or a container'
  },
  {
    path: ['container', 'docker', 'image'],
    message: 'You must specify a command, an argument or a container'
  }
];

const COMPLYWITHRESIDENCY_ERRORS = [
  {
    path: ['residency'],
    message: 'AppDefinition must contain persistent volumes and define residency'
  },
  {
    path: ['container', 'volumes'],
    message: 'AppDefinition must contain persistent volumes and define residency'
  }
];

const COMPLYWITHIPADDRESS_ERRORS = [
  {
    path: ['ipAddress'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks'
  },
  {
    path: ['discoveryInfo'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks'
  },
  {
    path: ['container', 'docker', 'network'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks'
  }
];

describe('MarathonAppValidators', function () {

  describe('#containsCmdArgsOrContainer', function () {
    it('should return no errors if `cmd` defined', function () {
      let spec = {cmd: 'foo'};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual([]);
    });

    it('should return no errors if `args` defined', function () {
      let spec = {args: ['foo']};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual([]);
    });

    it('should return no errors if `container.docker.image` defined', function () {
      let spec = {container: {docker: {image: 'foo'}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual([]);
    });

    it('should return no errors if `container.appc.image` defined', function () {
      let spec = {container: {appc: {image: 'foo'}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec)).toEqual([]);
    });

    it('should return error if both `args` and `cmd` are defined', function () {
      let spec = {args: ['foo'], cmd: 'bar'};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual([
          {path: ['cmd'], message: 'Please specify only one of `cmd` or `args`'},
          {path: ['args'], message: 'Please specify only one of `cmd` or `args`'}
        ]);
    });

    it('should return all errors if neither is defined', function () {
      let spec = {};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is null', function () {
      let spec = {cmd: null};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is {}', function () {
      let spec = {cmd: {}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is []', function () {
      let spec = {cmd: []};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is empty string', function () {
      let spec = {cmd: ''};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container` is empty', function () {
      let spec = {container: {}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container.docker` is empty', function () {
      let spec = {container: {docker: {}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container.appc` is empty', function () {
      let spec = {container: {appc: {}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container.appc.id` does not start with "sha512-"', function () {
      let spec = {container: {appc: {image: 'foo', id: 'sha256-test'}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual([
          {
            path: ['container', 'appc', 'id'],
            message: 'AppContainer id should start with \'sha512-\''
          }
        ]);
    });

    it('should not return errors if `container.appc` correctly defined', function () {
      let spec = {container: {appc: {image: 'foo', 'id': 'sha512-test'}}};
      expect(MarathonAppValidators.containsCmdArgsOrContainer(spec))
        .toEqual([]);
    });
  });

  describe('#complyWithResidencyRules', function () {
    it('should return no errors if residency and container is undefined',
      function () {
        let spec = {};

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return no errors if residency and volumes is undefined',
      function () {
        let spec = {container: {}};

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return no errors if residency is undefined and volumes empty',
      function () {
        let spec = {container:{volumes:[]}};

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return no errors if residency and persistent is undefined',
      function () {
        let spec = {container:{volumes:[{}]}};

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return no errors if both of residency and persistent is defined',
      function () {
        let spec = {
          residency: 'foo',
          container: {volumes: [{persistent: {size: '524288'}}]}
        };

        expect(MarathonAppValidators.complyWithResidencyRules(spec))
          .toEqual([]);
      }
    );

    it('should return errors if only `residency` defined', function () {
      let spec = {residency: 'foo' };

      expect(MarathonAppValidators.complyWithResidencyRules(spec))
        .toEqual(COMPLYWITHRESIDENCY_ERRORS);
    });

    it('should return errors if only `persistentVolumes` defined', function () {
      let spec = {container: {volumes: [{persistent: {size: '524288'}}]}};

      expect(MarathonAppValidators.complyWithResidencyRules(spec))
        .toEqual(COMPLYWITHRESIDENCY_ERRORS);
    });
  });

  describe('#complyWithIpAddressRules', function () {
    it('should return no errors if nothing defined', function () {
      let spec = {};
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });

    it('should return no errors if `ipAddress` only defined', function () {
      let spec = {ipAddress: 'foo'};
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });

    it('should return no errors if `discoveryInfo` only defined', function () {
      let spec = {discoveryInfo: 'foo'};
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });

    it('should return no errors if `container.docker.network` only defined', function () {
      let spec = {container: {docker: {network: 'OTHER'}}};
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });

    it('should return errors if `ipAddress`, `discoveryInfo` and `container.docker.network` is `BRIDGE`', function () {
      let spec = {
        ipAddress: 'foo',
        discoveryInfo: 'bar',
        container: {docker: {network: 'BRIDGE'}}
      };
      expect(MarathonAppValidators.complyWithIpAddressRules(spec))
        .toEqual(COMPLYWITHIPADDRESS_ERRORS);
    });

    it('should return errors if `ipAddress`, `discoveryInfo` and `container.docker.network` is `USER`', function () {
      let spec = {
        ipAddress: 'foo',
        discoveryInfo: 'bar',
        container: {docker: {network: 'USER'}}
      };
      expect(MarathonAppValidators.complyWithIpAddressRules(spec))
        .toEqual(COMPLYWITHIPADDRESS_ERRORS);
    });

    it('should return no error if `ipAddress`, `discoveryInfo` and `container.docker.network` is `OTHER`', function () {
      let spec = {
        ipAddress: 'foo',
        discoveryInfo: 'bar',
        container: {docker: {network: 'OTHER'}}
      };
      expect(MarathonAppValidators.complyWithIpAddressRules(spec)).toEqual([]);
    });
  });
});
