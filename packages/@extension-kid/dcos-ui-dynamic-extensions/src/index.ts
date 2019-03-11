import { ContainerModule, inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";

import {
  DynamicResolverType,
  DynamicResolverInterface
} from "@extension-kid/dynamic-resolver";

import { MesosStreamType } from "#SRC/js/core/MesosStream";

// New Framework Registered =>
// Has `DCOS_UI_EXTENSION_URL` label =>
// DynamicResolverService.load(DCOS_UI_EXTENSION_URL) =>
// Try resolving the module =>
// If resolved load into Container

const EVENTS = [
  "SUBSCRIBED",
  "GET_FRAMEWORKS",
  "FRAMEWORK_ADDED",
  "FRAMEWORK_UPDATED",
  "FRAMEWORK_REMOVED"
];

@injectable()
class DcosUIExtensionLoader {
  constructor(
    @inject(MesosStreamType) mesosStream: Observable<any>,
    @inject(DynamicResolverType) dynamicResolver: DynamicResolverInterface
  ) {
    mesosStream
      .pipe(filter(({ type }) => EVENTS.includes(type)))
      .subscribe(({ url }) => dynamicResolver.resolve(url));
  }
}
export default new ContainerModule(bind => {
  bind(DcosUIExtensionLoader).toSelf();
});
