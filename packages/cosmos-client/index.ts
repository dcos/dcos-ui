import { CosmosClient } from "./src/CosmosClient";

export { CosmosClient, PackageVersionsResponse };

interface PackageVersionsResponse {
  results: Record<string, string>;
}
