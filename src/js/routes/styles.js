import {Route, Redirect} from 'react-router';

import ButtonsTabContent from '../pages/styles/components/ButtonsTabContent';
import FormsTabContent from '../pages/styles/components/FormsTabContent';
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
          name: 'styles-components-forms',
          path: 'forms/?',
          handler: FormsTabContent
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

