jest.unmock('../MarathonAppValidators');
const MarathonAppValidators = require('../MarathonAppValidators');

const CMDORDOCKERIMAGE_ERRORS = [
  {
    path: ['cmd'],
    message: 'You must specify at least a command or a docker image'
  },
  {
    path: ['container', 'docker', 'image'],
    message: 'You must specify at least a command or a docker image'
  }
];

describe('MarathonAppValidators', function () {

  describe('#CmdOrDockerImage', function () {
    it('should return no errors if `cmd` defined', function () {
      let spec = {cmd: 'foo'};
      expect(MarathonAppValidators.CmdOrDockerImage(spec)).toEqual([]);
    });

    it('should return no errors if `container.docker.image` defined', function () {
      let spec = {container: {docker: {image: 'foo'}}};
      expect(MarathonAppValidators.CmdOrDockerImage(spec)).toEqual([]);
    });

    it('should return both errors if neither is defined', function () {
      let spec = {};
      expect(MarathonAppValidators.CmdOrDockerImage(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is null', function () {
      let spec = {cmd: null};
      expect(MarathonAppValidators.CmdOrDockerImage(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is {}', function () {
      let spec = {cmd: {}};
      expect(MarathonAppValidators.CmdOrDockerImage(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is []', function () {
      let spec = {cmd: []};
      expect(MarathonAppValidators.CmdOrDockerImage(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `cmd` is empty string', function () {
      let spec = {cmd: ''};
      expect(MarathonAppValidators.CmdOrDockerImage(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container` is empty', function () {
      let spec = {container: {}};
      expect(MarathonAppValidators.CmdOrDockerImage(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });

    it('should return errors if `container.docker` is empty', function () {
      let spec = {container: {docker: {}}};
      expect(MarathonAppValidators.CmdOrDockerImage(spec))
        .toEqual(CMDORDOCKERIMAGE_ERRORS);
    });
  });

});
