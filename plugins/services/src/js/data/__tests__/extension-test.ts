import { Container } from "@extension-kid/core";
import dataLayerContainerModuleFactory, {
  DataLayer,
  DataLayerType
} from "@extension-kid/data-layer";

import extensionFactory from "../extension";
import { ContainerModule } from "inversify";

export function createTestContainer(
  module: ContainerModule | null = null
): Container {
  const container = new Container();

  container.load(dataLayerContainerModuleFactory());
  const servicesModule = module || extensionFactory();
  if (servicesModule) {
    container.load(servicesModule);
  } else {
    throw new Error("Failed to get services data-layer extension module");
  }
  return container;
}

describe("DataLayer - Services Extension", () => {
  it("can load container module", () => {
    const container = createTestContainer();

    const dl = container.get<DataLayer>(DataLayerType);
    expect(dl).not.toBeNull();
  });
});
