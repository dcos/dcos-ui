import React, { Component } from "react";
import MesosEventManager from "dcos-event-stream";

class EventStreamTest extends Component {
  constructor() {
    super();
    this.state = {
      logLength: 0,
      debugMessage: ""
    };
  }
  componentDidMount() {
    const self = this;
    let history = [];
    MesosEventManager.stream.subscribe(
      function(x) {
        history = history.concat(x);
        self.setState({
          logLength: history.length,
          debugMessage: `New Event Received:`,
          eventHistory: JSON.stringify(history)
        });
      },
      function() {
        self.setState({
          debugMessage: `Error while parsing event:`
        });
      },
      function() {
        console.log("Translator onCompleted");
      }
    );
  }
  render() {
    return (
      <div style={{ padding: "20px", width: "100%" }}>
        <h2>Debug Console</h2>
        <div>
          <h3>Debugger</h3>
          <div>{this.state.debugMessage}</div>
        </div>
        <div>
          <h3>Event Debug Stats</h3>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td>Total Event Log Length:</td><td>{this.state.logLength}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3>Full Event Log</h3>
          <textarea
            value={this.state.eventHistory}
            style={{
              padding: "10px",
              width: "90%",
              height: "500px"
            }}
          />
        </div>
      </div>
    );
  }
}

module.exports = EventStreamTest;
