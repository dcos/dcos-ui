export default class AgentStore {
  constructor({ endpoints }) {
    this.endpoints = endpoints;
    this.agentsById = new Map();
  }

  fetchAgents() {
    this.statePromise = this.endpoints.mesos.state.get()
      .then((state) => this.parseState(state));

    return this.statePromise;
  }

  parseState(state) {
    state.slaves.forEach((slave) => this.agentsById.set(slave.id, slave));
  }

  getStatePromise() {
    return this.statePromise || this.fetchAgents();
  }

  getById(id) {
    return this.getStatePromise().then(() => {
      const agent = this.agentsById.get(id);

      if (agent == null) {
        return null;
      }

      return agent;
    });
  }

  getAll() {
    return this.getStatePromise().then(() => {
      return [...this.agentsById.values()];
    });
  }
}
