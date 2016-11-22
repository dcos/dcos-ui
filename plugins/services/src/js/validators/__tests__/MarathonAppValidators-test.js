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

});
