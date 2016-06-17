import {Route, Redirect} from 'react-router';

import ButtonCollectionsTabContent from '../pages/styles/components/ButtonCollectionsTabContent';
import ButtonGroupsTabContent from '../pages/styles/components/ButtonGroupsTabContent';
import ButtonsTabContent from '../pages/styles/components/ButtonsTabContent';
import DropdownsTabContent from '../pages/styles/components/DropdownsTabContent';
import FormsTabContent from '../pages/styles/components/FormsTabContent';
import IconsTabContent from '../pages/styles/components/IconsTabContent';
import ModalsTabContent from '../pages/styles/components/ModalsTabContent';
import PanelsTabContent from '../pages/styles/components/PanelsTabContent';

import GridTabContent from '../pages/styles/layout/GridTabContent';
import StylesPage from '../pages/StylesPage';

let stylesRoutes = {
  type: Route,
  name: 'styles',
  path: 'styles/?',
  handler: StylesPage,
  children: [
    {
      type: Route,
      name: 'styles-components-tab',
      path: 'components/?',
      children: [
        {
          type: Route,
          name: 'styles-components-buttons',
          path: 'buttons/?',
          handler: ButtonsTabContent
        },
        {
          type: Route,
          name: 'styles-components-button-collections',
          path: 'button-collections/?',
          handler: ButtonCollectionsTabContent
        },
        {
          type: Route,
          name: 'styles-components-button-groups',
          path: 'button-groups/?',
          handler: ButtonGroupsTabContent
        },
        {
          type: Route,
          name: 'styles-components-dropdowns',
          path: 'dropdowns/?',
          handler: DropdownsTabContent
        },
        {
          type: Route,
          name: 'styles-components-forms',
          path: 'forms/?',
          handler: FormsTabContent
        },
        {
          type: Route,
          name: 'styles-components-icons',
          path: 'icons/?',
          handler: IconsTabContent
        },
        {
          type: Route,
          name: 'styles-components-modals',
          path: 'modals/?',
          handler: ModalsTabContent
        },
        {
          type: Route,
          name: 'styles-components-panels',
          path: 'panels/?',
          handler: PanelsTabContent
        },
        {
          type: Redirect,
          from: '/styles/components/?',
          to: 'styles-components-buttons'
        }
      ]
    },
    {
      type: Route,
      name: 'styles-layout-tab',
      path: 'layout/?',
      children: [
        {
          type: Route,
          name: 'styles-layout-grid',
          path: 'grid/?',
          handler: GridTabContent
        },
        {
          type: Redirect,
          from: '/styles/layout/?',
          to: 'styles-layout-grid'
        }
      ]
    },
    {
      type: Redirect,
      from: '/styles/?',
      to: 'styles-components-tab'
    }
  ]
};

module.exports = stylesRoutes;
