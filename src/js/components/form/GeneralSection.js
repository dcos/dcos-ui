import React, {Component} from 'react';

class GeneralSection extends Component {
  render() {
    let data = this.props.data;
    return (
        <div className="form flush-bottom">
          <div className="form-row-element"><h2
              className="form-header flush-top short-bottom">
            General</h2><p className="flush-bottom"><span><span>Configure your container service here or </span><a
              href="#/universe">install from Universe</a><span>.</span></span>
          </p></div>
          <div className="row flex-box general">
            <div className="form-row-element column-12 form-row-input">
              <div className="form-group flush">
                <label><span
                    className="media-object-spacing-wrapper media-object-spacing-narrow"><div
                    className="media-object media-object-inline"><span
                    className="media-object-item">ID *</span><div
                    className="tooltip-wrapper media-object-item"><svg
                    className="icon icon-grey icon-mini"><use
                    href="#icon-mini--ring-question"/></svg><noscript></noscript></div></div></span></label><input
                  className="form-control" name="id" placeholder="" type="text"
                  onChange={()=>{}}
                  value={data.id}/>
              </div>
            </div>
          </div>
          <div className="row flex-box general">
            <div className="form-row-element column-3 form-row-input">
              <div className="form-group flush">
                <label><span
                    className="media-object-spacing-wrapper media-object-spacing-narrow"><div
                    className="media-object media-object-inline"><span
                    className="media-object-item">CPUs</span><div
                    className="tooltip-wrapper media-object-item"><svg
                    className="icon icon-grey icon-mini"><use
                    href="#icon-mini--ring-question"/></svg><noscript></noscript></div></div></span></label><input
                  className="form-control" name="cpus" placeholder=""
                  type="number"
                  onChange={()=>{}}
                  value={data.cpus}/>
              </div>
            </div>
            <div className="form-row-element column-3 form-row-input">
              <div className="form-group flush">
                <label className="">Memory
                  (MiB)</label><input className="form-control" name="mem"
                  placeholder="" type="number"
                  onChange={()=>{}}
                  value={data.mem}/>
              </div>
            </div>
            <div className="form-row-element column-3 form-row-input">
              <div className="form-group flush">
                <label className=""
                >Disk
                  (MiB)</label><input className="form-control" name="disk"
                  placeholder="" type="number"
                  onChange={()=>{}}
                  value={data.disk}/>
              </div>
            </div>
            <div className="form-row-element column-3 form-row-input"
            >
              <div className="form-group flush"
              >
                <label className=""
                >Instances</label><input
                  className="form-control" name="instances" placeholder=""
                  type="number"
                  onChange={()=>{console.log('first level');}}
                  value={data.instances}/>
              </div>
            </div>
          </div>
          <div className="row flex-box general">
            <div className="form-row-element column-12 form-row-input">
              <div className="form-group flush">
                <label><span
                    className="media-object-spacing-wrapper media-object-spacing-narrow"><div
                    className="media-object media-object-inline"><span
                    className="media-object-item">Command</span><div
                    className="tooltip-wrapper media-object-item"><svg
                    className="icon icon-grey icon-mini"><use
                    href="#icon-mini--ring-question"/></svg><noscript></noscript></div></div></span></label>
                <div className="content-editable-wrapper" style={{height:'100px'}}>
                  <textarea className="content-editable form-control" name="cmd"
                      placeholder="" type="textarea"
                      value={data.cmd}
                      onChange={()=>{}}
                      style={{minHeight:'100px'}}/>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

GeneralSection.defaultProps = {
  data: {id: ''}
};

GeneralSection.propTypes = {
  data: React.PropTypes.object
};

module.exports = GeneralSection;
