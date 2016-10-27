import React, {Component} from 'react';

import TabView from '../../../../../../src/js/components/TabView';
import ReducerUtil from '../../../../../../src/js/utils/ReducerUtil';

class ServiceFormSection extends Component {
  componentWillMount() {
    this.props.onAddReducer({
      id: ReducerUtil.simpleReducer('id', '/'),
      cpus: ReducerUtil.simpleReducer('cpus', 1),
      mem: ReducerUtil.simpleReducer('mem', 128),
      disk: ReducerUtil.simpleReducer('disk', 0),
      instances: ReducerUtil.simpleReducer('instances', 1),
      cmd: ReducerUtil.simpleReducer('cmd', '')
    });
  }

  render() {
    let {data} = this.props;

    return (
      <TabView id="services">
        <div className="form flush-bottom">
          <div className="form-row-element">
            <h2 className="form-header flush-top short-bottom">
              General
            </h2>
            <p className="flush-bottom">
                <span>Configure your container service here or </span>
                <a href="#/universe">install from Universe</a>.
            </p>
          </div>
          <div className="row flex-box general">
            <div className="form-row-element column-12 form-row-input">
              <div className="form-group flush">
                <label>
                  <span className="media-object-spacing-wrapper media-object-spacing-narrow">
                    <div className="media-object media-object-inline">
                      <span className="media-object-item">ID *</span>
                      <div className="tooltip-wrapper media-object-item">
                        <svg className="icon icon-grey icon-mini">
                          <use href="#icon-mini--ring-question" />
                        </svg>
                      </div>
                    </div>
                  </span>
                </label>
                <input
                  className="form-control"
                  name="id"
                  placeholder=""
                  type="text"
                  onChange={()=>{}}
                  value={data.id} />
              </div>
            </div>
          </div>
          <div className="row flex-box general">
            <div className="form-row-element column-3 form-row-input">
              <div className="form-group flush">
                <label>
                  <span className="media-object-spacing-wrapper media-object-spacing-narrow">
                    <div className="media-object media-object-inline">
                      <span className="media-object-item">CPUs</span>
                      <div className="tooltip-wrapper media-object-item">
                        <svg className="icon icon-grey icon-mini">
                          <use href="#icon-mini--ring-question" />
                        </svg>
                      </div>
                    </div>
                  </span>
                </label>
                <input
                  className="form-control"
                  name="cpus"
                  placeholder=""
                  type="number"
                  onChange={()=>{}}
                  value={data.cpus} />
              </div>
            </div>
            <div className="form-row-element column-3 form-row-input">
              <div className="form-group flush">
                <label className="">
                  Memory (MiB)
                </label>
                <input
                  className="form-control"
                  name="mem"
                  placeholder=""
                  type="number"
                  onChange={()=>{}}
                  value={data.mem} />
              </div>
            </div>
            <div className="form-row-element column-3 form-row-input">
              <div className="form-group flush">
                <label className="">Disk (MiB)</label>
                <input className="form-control"
                  name="disk"
                  placeholder="" type="number"
                  onChange={()=>{}}
                  value={data.disk} />
              </div>
            </div>
            <div className="form-row-element column-3 form-row-input">
              <div className="form-group flush">
                <label className="">Instances</label>
                <input
                  className="form-control"
                  name="instances"
                  placeholder=""
                  type="number"
                  onChange={()=>{}}
                  value={data.instances} />
              </div>
            </div>
          </div>
          <div className="row flex-box general">
            <div className="form-row-element column-12 form-row-input">
              <div className="form-group flush">
                <label>
                  <span className="media-object-spacing-wrapper media-object-spacing-narrow">
                    <div className="media-object media-object-inline">
                      <span className="media-object-item">Command</span>
                      <div className="tooltip-wrapper media-object-item">
                        <svg className="icon icon-grey icon-mini">
                          <use href="#icon-mini--ring-question" />
                        </svg>
                      </div>
                    </div>
                  </span>
                </label>
                <div className="content-editable-wrapper" style={{height:'100px'}}>
                  <textarea
                    className="content-editable form-control"
                    name="cmd"
                    placeholder=""
                    type="textarea"
                    value={data.cmd}
                    onChange={()=>{}}
                    style={{minHeight:'100px'}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabView>
    );
  }
}

ServiceFormSection.defaultProps = {
  onAddReducer: (a) => a
};

ServiceFormSection.propTypes = {
  onAddReducer: React.PropTypes.func,
  data: React.PropTypes.object
};

module.exports = ServiceFormSection;
