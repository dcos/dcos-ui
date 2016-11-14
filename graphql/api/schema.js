import Cluster from './cluster/ClusterSchema';

const RootSchema = `
  schema {
    query: Cluster
  }
`;

export default () => [RootSchema, Cluster];
