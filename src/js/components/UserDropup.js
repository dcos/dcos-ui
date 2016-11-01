import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {routerShape} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AuthStore from '../stores/AuthStore';
import userURI from '../../img/components/icons/icon-user-default-64x64@2x.png';

const METHODS_TO_BIND = [
  'handleDropdownClose',
  'handleDropdownClick',
  'handleSignOut'
];

const MENU_ITEMS = {
  'button-docs': 'Documentation',
  'button-cli': 'Install CLI',
  'button-sign-out': 'Sign Out'
};

class UserDropup extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      open: false
    };

    this.store_listeners = [
      {
        name: 'sidebar',
        events: ['widthChange']
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onSidebarStoreWidthChange() {
    this.handleDropdownClose();
  }

  handleDropdownClose() {
    let open = this.state.open;
    // Only close if we are open
    if (open) {
      window.removeEventListener('click', this.handleDropdownClose);
      this.setState({open: false});
    }
  }

  handleDropdownClick(event) {
    event.stopPropagation();
    let open = !this.state.open;

    // We are using a custom event listener because the account menu slider
    // needs to close whenever a click event occurs.
    if (open) {
      window.addEventListener('click', this.handleDropdownClose);
    }

    this.setState({open});
  }

  handleSignOut() {
    AuthStore.logout();
  }

  handleMenuItemClick(onClick, e) {
    this.handleDropdownClose();
    if (onClick) {
      // Wait until dropdown transition is done before starting the next
      setTimeout(function () {
        onClick(e);
      }, 250);
    }
  }

  getDropdownMenu(menuItems) {
    let defaultItem = [
      {
        className: 'hidden',
        html: '',
        id: 'default-item',
        selectedHtml: this.getUserButton(null, function () {})
      }
    ];

    return defaultItem.concat(menuItems.map(function (item) {
      return {
        className: 'clickable',
        html: item,
        id: item.key,
        selectedHtml: item
      };
    }));
  }

  getUserAccountMenuItems(menuItems) {
    return menuItems.map(function (item) {
      return (
        <li className="clickable flush-bottom" key={item.key}>
          {item}
        </li>
      );
    });
  }

  getUserButton(user, clickHandler) {
    let description;
    let userLabel;

    if (user && !user.is_remote) {
      userLabel = user.description;
    } else if (user && user.is_remote) {
      userLabel = user.uid;
    }

    if (userLabel) {
      description = (
        <span className="user-description" title={userLabel}>
          {userLabel}
        </span>
      );
    }

    return (
      <a
        className="user-account-menu-button button dropdown-toggle"
        onClick={clickHandler}>
        <span className="icon icon-medium icon-image-container
          icon-user-container">
          <img className="clickable" src={userURI} />
        </span>
        {description}
      </a>
    );
  }

  getUserMenuItems() {
    let items = this.props.items.concat([
      <a className="button button-link" onClick={this.handleSignOut} key="button-sign-out" />
    ]);

    return items.map((item) => {
      // Monkeypatch the onClick to close the dropdown and remove mouse enter &
      // leave events to prevent tooltip.
      let props = {
        onClick: this.handleMenuItemClick.bind(this, item.props.onClick),
        onMouseEnter: null,
        onMouseLeave: null
      };

      return React.cloneElement(item, props, MENU_ITEMS[item.key]);
    });
  }

  render() {
    let user = AuthStore.getUser();

    if (!user) {
      return null;
    }

    let userAccountMenuClasses = classNames('user-account-menu-slider', {
      'is-open': this.state.open
    });
    let userAccountMenuBackdropClasses = classNames(
      'user-account-menu-slider-backdrop', {
        'is-visible': this.state.open
      });
    let userButton = this.getUserButton(user, this.handleDropdownClick);
    let userMenuItems = this.getUserMenuItems();

    return (
      <div className="user-account-menu-wrapper">
        <div className={userAccountMenuBackdropClasses} />
        <Dropdown buttonClassName="user-account-menu-dropdown-button"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list user-account-menu-list"
          items={this.getDropdownMenu(userMenuItems)}
          persistentID="default-item"
          scrollContainer=".gm-scroll-view"
          scrollContainerParentSelector=".gm-prevented"
          transition={true}
          wrapperClassName="user-account-menu-dropdown dropdown" />
        <div className={userAccountMenuClasses}>
          <div className="user-account-menu-slider-button">
            {userButton}
          </div>
          <ul className="user-account-menu-slider-list user-account-menu-list list-unstyled flush-bottom">
            {this.getUserAccountMenuItems(userMenuItems)}
          </ul>
        </div>
      </div>
    );
  }
}

UserDropup.contextTypes = {
  router: routerShape
};

UserDropup.defaultProps = {
  items: []
};

UserDropup.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.node)
};

module.exports = UserDropup;
