import React, { Component } from "react";

import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";

import ComponentExample
  from "../../../../components/component-example/ComponentExample";

class CodeTab extends Component {
  render() {
    return (
      <div>
        <h3 className="flush-top">Checkbox</h3>
        <ComponentExample>
          <div>
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={false}
                  disabled={false}
                  name="check_box_first"
                  type="checkbox"
                />
                Check Me First
              </FieldLabel>
            </FormGroup>
            <FormGroup>
              <FieldLabel>
                <FieldInput
                  checked={false}
                  disabled={false}
                  name="check_box_second"
                  type="checkbox"
                />
                Check Me Second
              </FieldLabel>
            </FormGroup>
          </div>
        </ComponentExample>
      </div>
    );
  }
}

module.exports = CodeTab;
