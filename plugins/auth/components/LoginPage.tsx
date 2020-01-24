import * as React from "react";
import { locationShape } from "react-router";

import LoginModal from "./LoginModal";

class LoginPage extends React.Component {
  render() {
    const { target } = this.props.location.query;

    return <LoginModal target={target} />;
  }
}

LoginPage.propTypes = {
  location: locationShape.isRequired
};

export default LoginPage;
