declare module "mesosphere-shared-reactjs" {
  interface RequestUtil {
    parseResponseBody: (req: XMLHttpRequest) => any;
  }

  export var RequestUtil: RequestUtil;
}
