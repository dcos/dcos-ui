jest.unmock('../MarathonAppValidators');
const MarathonAppValidators = require('../MarathonAppValidators');

const APPCONTAINERID_ERRORS = [
  {
    path: ['container', 'appc', 'id'],
    message: 'AppContainer id should start with \'sha512-\'',
    type: 'STRING_PATTERN',
    variables: {
      pattern: '^sha512-'
    }
  }
];
const CMDORDOCKERIMAGE_ERRORS = [
  {
    path: ['cmd'],
    message: 'You must specify a command, an argument or a container',
    type: 'PROP_MISSING_ONE',
    variables: {
      names: 'cmd, args, container.docker.image'
    }
  },
  {
    path: ['args'],
    message: 'You must specify a command, an argument or a container',
    type: 'PROP_MISSING_ONE',
    variables: {
      names: 'cmd, args, container.docker.image'
    }
  },
  {
    path: ['container', 'docker', 'image'],
    message: 'You must specify a command, an argument or a container',
    type: 'PROP_MISSING_ONE',
    variables: {
      names: 'cmd, args, container.docker.image'
    }
  }
];

const COMPLYWITHRESIDENCY_ERRORS = [
  {
    path: ['residency'],
    message: 'AppDefinition must contain persistent volumes and define residency',
    type: 'PROP_MISSING_ALL',
    variables: {
      names: 'residency, container.volumes'
    }
  },
  {
    path: ['container', 'volumes'],
    message: 'AppDefinition must contain persistent volumes and define residency',
    type: 'PROP_MISSING_ALL',
    variables: {
      names: 'residency, container.volumes'
    }
  }
];

const COMPLYWITHIPADDRESS_ERRORS = [
  {
    path: ['ipAddress'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks',
    type: 'PROP_CONFLICT',
    variables: {
      feature1: 'ipAddress or discoveryInfo',
      feature2: 'container.docker.network'
    }
  },
  {
    path: ['discoveryInfo'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks',
    type: 'PROP_CONFLICT',
    variables: {
      feature1: 'ipAddress or discoveryInfo',
      feature2: 'container.docker.network'
    }
  },
  {
    path: ['container', 'docker', 'network'],
    message: 'ipAddress/discovery is not allowed for Docker containers using BRIDGE or USER networks',
    type: 'PROP_CONFLICT',
    variables: {
      feature1: 'ipAddress or discoveryInfo',
      feature2: 'container.docker.network'
    }
  }
];

const MUSTCONTAINIMAGEONDOCKER_ERRORS = [
  {
    path: ['container', 'docker', 'image'],
    message: 'Must be specified when using the Docker Engine runtime. You can change runtimes under "Advanced Settings"',
    type: 'PROP_IS_MISSING',
    variables: {}
  }
];

const NOTBOTHCMDARGS_ERRORS = [
  {
    path: ['cmd'],
    message: 'Please specify only one of `cmd` or `args`',
    type: 'PROP_CONFLICT',
    variables: {
      feature1: 'cmd',
      feature2: 'args'
    }
  },
  {
    path: ['args'],
    message: 'Please specify only one of `cmd` or `args`',
    type: 'PROP_CONFLICT',
    variables: {
      feature1: 'cmd',
      feature2: 'args'
    }
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

  describe('#mustContainImageOnDocker', function () {

    it('should return error if runtime is docker but image is missing', function () {
      const spec = {
        container: {
          type: 'DOCKER'
        }
      };
      expect(MarathonAppValidators.mustContainImageOnDocker(spec))
        .toEqual(MUSTCONTAINIMAGEONDOCKER_ERRORS);
    });

    it('should not return error if runtime is not docker and image is missing', function () {
      const spec = {
        container: {
          type: 'MESOS'
        }
      };
      expect(MarathonAppValidators.mustContainImageOnDocker(spec)).toEqual([]);
    });

    it('should not return error if runtime docker and image is specified', function () {
      const spec = {
        container: {
          type: 'DOCKER',
          docker: {
            image: 'foo'
          }
        }
      };
      expect(MarathonAppValidators.mustContainImageOnDocker(spec)).toEqual([]);
    });

  });
});
