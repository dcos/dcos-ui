import React from 'react';
import GetSetBaseStore from './GetSetBaseStore';

class NavigationStore extends GetSetBaseStore {

  init(routes = []) {
    this.set({
      definition: this.fromRoutes(routes)
    });
  }

  registerCategory(category) {
    const definition = this.get('definition');

    if (!definition.find((element) => element.category === category)) {
      definition.push({
        category,
        children: []
      });
    }
  }

  registerPrimary(path, link, options = {}) {
    const definition = this.get('definition');
    const {category = 'root'} = options;

    const categoryElement = definition
      .find((element) => element.category === category);

    categoryElement.children.push({
      path,
      link,
      options,
      children: []
    });
  }

  registerSecondary(parentPath, path, link, options = {}) {
    const definition = this.get('definition');

    const primaryElements = definition.reduce((result, category) => {
      return result.concat(category.children);
    }, []);

    const parentElement = primaryElements
      .find((element) => element.path === parentPath);

    parentElement.children.push({
      link,
      options,
      path: `${parentPath}/${path}`,
      children: []
    });
  }

  /**
   * fromRoutes - transforms application routes to the NavigationService
   * format. This method will be gon after we migrate all the packages
   *
   * @param  {Array} routes Application routes
   * @return {Array} NavigationService elements
   */
  fromRoutes(routes) {
    const indexRoute = routes.find((route) => route.id === 'index');
    const groupIndexMap = {};

    if (!indexRoute) {
      return [];
    }

    return indexRoute.childRoutes
      .filter(({isInSidebar}) => isInSidebar)
      .reduce(function (topLevelRoutes, route) {
        let {category, childRoutes = []} = route;

        let icon = React.cloneElement(
          route.component.routeConfig.icon,
          {className: 'sidebar-menu-item-icon icon icon-small'}
        );

        // Assign an unused index to the new route category if we don't already
        // have an index assigned to that category.
        if (groupIndexMap[category] == null) {
          let newGroupIndex = topLevelRoutes.length;

          groupIndexMap[category] = newGroupIndex;
          topLevelRoutes[newGroupIndex] = {category, children: []};
        }

        // Append the route to the corresponding label's list of routes.
        const children = childRoutes
          .filter(({isInSidebar}) => isInSidebar)
          .map((childRoute) => {
            const path = `/${route.path}/${childRoute.path}`;
            const link = childRoute.component.routeConfig.label;

            return {
              path,
              link
            };
          });

        topLevelRoutes[groupIndexMap[category]].children.push({
          children,
          path: `/${route.path}`,
          link: route.component.routeConfig.label,
          options: { icon }
        });

        return topLevelRoutes;
      }, []);
  }

};

const store = new NavigationStore();
export default store;
