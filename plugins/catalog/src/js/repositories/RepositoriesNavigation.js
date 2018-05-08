import { decorate, injectable } from "inversify";

export default class RepositoriesNavigation {
  getElements() {
    return [
      {
        parent: "/settings",
        path: "/settings/repositories",
        link: "Package Repositories"
      }
    ];
  }
}
decorate(injectable(), RepositoriesNavigation);
