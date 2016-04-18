jest.dontMock('../UserDropup');

import PluginTestUtils from 'PluginTestUtils';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');

PluginTestUtils.dontMock([
  'AuthStore'
]);

let SDK = PluginTestUtils.getSDK('authentication', {enabled: true});

require('../../SDK').setSDK(SDK);

var UserDropup = require('../UserDropup');

let AuthStore = SDK.get('AuthStore');

describe('UserDropup', function () {

  beforeEach(function () {
    this.getUser = AuthStore.getUser;

    AuthStore.getUser = function () {
      return {
        description: 'foo'
      };
    };

    let mockProps = {
      onClick: jest.genMockFunction()
    };

    let dropdownItems = [
      <div foo="bar" key="foo" type="a" props={mockProps} />,
      <div bar="baz" key="bar" type="a" props={mockProps} />,
      <div baz="qux" key="baz" type="a" props={mockProps} />
    ];

    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <UserDropup items={dropdownItems} />,
      this.container
    );

    this.instance.dropdownItems = dropdownItems;
  });

  afterEach(function () {
    AuthStore.getUser = this.getUser;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#getDropdownMenu', function () {

    it('returns the array it was passed with a default item at the beginning',
      function () {
      let dropdownMenu = this.instance.getDropdownMenu([
        <div foo="bar" />,
        <div bar="baz" />
      ]);

      expect(dropdownMenu.length).toEqual(3);
      expect(dropdownMenu[0].id).toEqual('default-item');
    });

  });

  describe('#getModalMenu', function () {

    beforeEach(function () {
      this.modalMenu = this.instance.getModalMenu([
        <div key="foo" />,
        <div key="bar" />
      ]);
    });

    it('should return an array of the same length it received', function () {
      expect(this.modalMenu.length).toEqual(2);
    });

    it('should return an array of li elements', function () {
      this.modalMenu.forEach(function (item) {
        let domEl = ReactDOM.render(item, this.container);
        expect(ReactDOM.findDOMNode(domEl).nodeName).toEqual('LI');
      }, this);
    });

  });

  describe('#getUserMenuItems', function () {

    it('should return all of the items passed, in addtion to a signout button',
      function () {
      let menuItems = this.instance.getUserMenuItems();
      let signoutButton = menuItems[menuItems.length - 1];

      expect(menuItems.length).toEqual(this.instance.dropdownItems.length + 1);
      expect(signoutButton.key).toEqual('button-sign-out');
    });

  });

});
