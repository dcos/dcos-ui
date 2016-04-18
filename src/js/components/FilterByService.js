var _ = require('underscore');
var React = require('react');

var Dropdown = require('reactjs-components').Dropdown;
var Service = require('../structs/Service');

var defaultId = 'default';

var FilterByService = React.createClass({

  displayName: 'FilterByService',

  propTypes: {
    byServiceFilter: React.PropTypes.string,
    services: React.PropTypes.array.isRequired,
    totalHostsCount: React.PropTypes.number.isRequired,
    handleFilterChange: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      byServiceFilter: defaultId,
      services: [],
      totalHostsCount: 0,
      handleFilterChange: _.noop
    };
  },

  handleItemSelection: function (obj) {
    if (obj.id === defaultId) {
      this.props.handleFilterChange(null);
    } else {
      this.props.handleFilterChange(obj.id);
    }
  },

  getItemHtml: function (service) {
    return (
      <span className="badge-container">
        <span>{service.get('name')}</span>
        <span className="badge">{service.getNodeIDs().length}</span>
      </span>
    );
  },

  getDropdownItems: function () {
    let defaultItem = new Service({
      id: defaultId,
      name: 'All Services',
      // This is literally the worst way of doing this.
      slave_ids: new Array(this.props.totalHostsCount)
    });
    let items = [defaultItem].concat(this.props.services);

    return _.map(items, function (service) {
      var selectedHtml = this.getItemHtml(service);
      var dropdownHtml = (<a>{selectedHtml}</a>);

      var item = {
        id: service.get('id'),
        name: service.get('name'),
        html: dropdownHtml,
        selectedHtml
      };

      if (service.get('id') === defaultId) {
        item.selectedHtml = (
          <span className="badge-container">
            <span>Filter by Service</span>
          </span>
        );
      }

      return item;
    }, this);
  },

  getSelectedId: function (id) {
    if (id == null) {
      return defaultId;
    }

    return id;
  },

  render: function () {
    return (
      <Dropdown
        buttonClassName="button button-inverse dropdown-toggle"
        dropdownMenuClassName="dropdown-menu inverse"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown"
        items={this.getDropdownItems()}
        onItemSelection={this.handleItemSelection}
        initialID={this.getSelectedId(this.props.byServiceFilter)}
        transition={true}
        transitionName="dropdown-menu" />
    );
  }
});

module.exports = FilterByService;
