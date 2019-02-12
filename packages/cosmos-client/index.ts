import { CosmosClient } from "./src/CosmosClient";

export { CosmosClient, PackageVersionsResponse };

type PackageVersionsResponse = {
  results: Record<string, string>;
};
