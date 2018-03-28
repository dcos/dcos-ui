import {
  componentFromStreamWithConfig,
  createEventHandlerWithConfig
} from "recompose";

import rxjsConfig from "recompose/rxjsObservableConfig";

export const createEventHandler = createEventHandlerWithConfig(rxjsConfig);
export const componentFromStream = componentFromStreamWithConfig(rxjsConfig);
