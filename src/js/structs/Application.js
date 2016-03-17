import Service from './Service';

module.exports = class Application extends Service {
  get isApplication() {
    return !this.labels.DCOS_PACKAGE_IS_FRAMEWORK;
  }
};
