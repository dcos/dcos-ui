import Cluster from './cluster/schema';

const RootSchema = `
  schema {
    query: Cluster
  }
`;

export default () => [
  RootSchema,
  Cluster
];
