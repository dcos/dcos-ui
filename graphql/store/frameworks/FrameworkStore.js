export default class FrameworkStore {
  constructor({ endpoints }) {
    this.endpoints = endpoints;
    this.frameworksByName = new Map();
  }

  fetchFrameworks() {
    this.statePromise = this.endpoints.mesos.state.get()
      .then((state) => this.parseState(state));

    return this.statePromise;
  }

  parseState(state) {
    state.frameworks.forEach((framework) => {
      this.frameworksByName.set(framework.name, framework);
    });
  }

  getStatePromise() {
    return this.statePromise || this.fetchFrameworks();
  }

  getAllByName() {
    return this.getStatePromise().then(() => {
      return this.frameworksByName;
    });
  }
}
