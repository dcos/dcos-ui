import * as React from "react";
import { locationShape } from "react-router";

import LoginModal from "./LoginModal";

class LoginPage extends React.Component {
  static propTypes = {
    location: locationShape.isRequired
  };
  render() {
    const { target } = this.props.location.query;

    return <LoginModal target={target} />;
  }
}

export default LoginPage;
