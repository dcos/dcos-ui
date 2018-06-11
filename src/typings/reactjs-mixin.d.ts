declare module "reactjs-mixin" {
  import { Component } from "react";

  // Had to go with any.
  // This should be the way of declaring it properly https://github.com/Microsoft/TypeScript/pull/13743
  export default function mixin(mixin: object): any;
}
