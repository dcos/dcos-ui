declare module "react-router" {
  export interface IPartialNextState {
    location: {
      $searchBase: {search: string, searchBase: string},
      action: string,
      hash: string,
      key: string,
      pathname: string,
      query: {},
      search: string,
      state: {} | null
    },
    params: {}
  }
}