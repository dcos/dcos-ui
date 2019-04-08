// We use this fixture in the browser along with useFixtures config

module.exports = {
  nodes: [...Array(5000).keys()].map(i => ({
    host_ip: `dcos-${i}`,
    "role:": "agent",
    health: Math.random() > 0.5 ? 1 : 0
  }))
};
