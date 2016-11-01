import React, {Component} from 'react';

import Action from '../structs/FormAction';
import Batch from '../structs/Batch';

import GeneralSection from './form/GeneralSection';

class FormController extends Component {
  constructor() {
    super();
    this.reducers = ReducerUtil.combineReducers({
      id: ReducerUtil.simpleReducer('id', '/'),
      cpus: ReducerUtil.simpleReducer('cpus', 1),
      mem: ReducerUtil.simpleReducer('mem', 128),
      disk: ReducerUtil.simpleReducer('disk', 0),
      instances: ReducerUtil.simpleReducer('instances', 1),
      cmd: ReducerUtil.simpleReducer('cmd', '')
    });
    this.state = {
      json: false,
      batch: new Batch().add({action: 'INIT'})
    };
  }

  toggleJSON() {
    this.setState({
      json: !this.state.json
    });
  }

  addEvent(event) {
    let {batch} = this.state;
    let value = event.target.value;
    let path = event.target.getAttribute('name');
    batch.add(new Action(path.split(','), value));

    this.setState({
      batch
    });
  }

  render() {
    let {batch} = this.state;
    let data = batch.reduce(this.reducers, this.props.data);
    // Testing purpose
    if (this.state.json) {
      return (
          <div>
            <div onClick={this.toggleJSON.bind(this)}>JSON MOde</div>
            <pre>
            {JSON.stringify(data, null, 2)}
          </pre>
          </div>
      );
    }

    return (
        <form onChange={(e) => this.addEvent(e)}>
          <div onClick={this.toggleJSON.bind(this)}>JSON MOde</div>
          <GeneralSection data={data}/>
        </form>
    );
  }
}

FormController.defaultProps = {
  reducers: (a) => a,
  data: {}
};

FormController.propTypes = {
  reducers: React.PropTypes.func,
  data: React.PropTypes.object
};

module.exports = FormController;
