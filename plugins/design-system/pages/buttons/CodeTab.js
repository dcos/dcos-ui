import React, { Component } from "react";

class CodeTab extends Component {
  render() {
    return (
      <div className="container">
        <p className="lead">
          Buttons express what action will occur when the user clicks or touches it. Buttons are used to initialize an action, either in the background or foreground of an experience.
        </p>
        <h2>Primary Button</h2>
        <div className="panel">
          <div className="panel-cell">
            <div className="button-collection">
              <button className="button button-primary" type="button">
                Primary Button
              </button>
              <button className="button button-primary" type="button" disabled>
                Primary Button
              </button>
              <button className="button button-primary" type="button">
                <svg className="icon icon-mini">
                  <use xlinkHref="#icon-system--plus" />
                </svg>
                Primary
              </button>
              <button
                className="button
                button-primary
                button-small"
                type="button"
              >
                Primary
              </button>
              <button className="button button-primary" type="button">
                <svg className="icon icon-mini">
                  <use xlinkHref="#icon-system--plus" />
                </svg>
              </button>
            </div>
          </div>
          <div className="panel-cell flush-top flush-bottom flush-left flush-right">
            <pre className="flush-bottom">
              &lt;button className="button button-primary" type="button"&gt;
              Primary Button
              &lt;/button&gt;<br />
              &lt;button className="button button-primary" type="button" disabled&gt;
              Primary Button
              &lt;/button&gt;<br />
              &lt;button className="button button-primary" type="button"&gt;
              &lt;svg className="icon icon-mini"&gt;
              &lt;use xlinkHref="#icon-system--plus"&gt;&lt;/use&gt;
              &lt;/svg&gt;
              Primary
              &lt;/button&gt;<br />
              &lt;button className="button button-primary button-small" type="button"&gt;
              Primary
              &lt;/button&gt;<br />
              &lt;button className="button button-primary" type="button"&gt;
              &lt;svg className="icon icon-mini"&gt;
              &lt;use xlinkHref="#icon-system--plus"&gt;&lt;/use&gt;
              &lt;/svg&gt;
              &lt;/button&gt;<br />
            </pre>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = CodeTab;
