interface Config {
  certificatesAPIPrefix: string;
  secretsAPIPrefix: string;
  secretsDefaultStore: string;
}

const PrivatePluginsConfig: Config = {
  secretsAPIPrefix: "/secrets/v1",
  secretsDefaultStore: "default",
  certificatesAPIPrefix: "ca/api/v2"
};

export { PrivatePluginsConfig as default };
