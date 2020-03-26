import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import * as React from "react";

import { Route } from "react-router";

import HTTPStatusCodes from "#SRC/js/constants/HTTPStatusCodes";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import UsersStore from "#SRC/js/stores/UsersStore";

import User from "./structs/User";
import UserDetailPage from "./components/UserDetailPage";
import UsersPage from "./pages/UsersPage";
import { Hooks } from "PluginSDK";

module.exports = {
  filters: [
    "instantiateUserStruct",
    "organizationRoutes",
    "organizationTabChangeEvents",
    "userFormModalButtonDefinition",
    "userFormModalDefinition",
    "userFormModalFooter",
    "userFormModalHeader",
    "userModelObject",
    "usersPageContent",
    "usersPageStoreListeners",
  ],

  initialize() {
    this.filters.forEach((filter) => {
      Hooks.addFilter(filter, this[filter].bind(this));
    });
  },

  instantiateUserStruct(userData) {
    return new User(userData);
  },

  organizationRoutes(route) {
    route.routes.push({
      type: Route,
      path: "users/:userID",
      component: UserDetailPage,
    });

    return route;
  },

  organizationTabChangeEvents(changeEvents) {
    // Add update subscription on user update success
    changeEvents.push("onUserStoreUpdateSuccess");

    return changeEvents;
  },

  userFormModalButtonDefinition(definition, props, state) {
    // Discard content given and replace with new definition
    return [
      {
        text: "Cancel",
        className: "button button-primary-link flush-left",
        isClose: true,
      },
      {
        text: state.disableNewUser
          ? i18nMark("Creating...")
          : i18nMark("Create User"),
        className: "button button-primary",
        isSubmit: true,
      },
    ];
  },

  userFormModalDefinition(definition, props, state) {
    let usernameError = false;
    let otherError = false;

    const fullName = <Trans render="b">Full Name</Trans>,
      username = <Trans render="b">Username</Trans>,
      password = <Trans render="b">Password</Trans>,
      confirmPassword = <Trans render="b">Confirm Password</Trans>;

    if (
      state.errorCode === HTTPStatusCodes.CONFLICT ||
      state.errorCode === HTTPStatusCodes.BAD_REQUEST
    ) {
      usernameError = state.errorMsg;
    } else {
      otherError = state.errorMsg;
    }

    // Discard content given and replace with new definition
    return [
      {
        fieldType: "text",
        name: "description",
        placeholder: false,
        required: true,
        showError: false,
        showLabel: fullName,
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
      {
        fieldType: "text",
        name: "uid",
        placeholder: false,
        required: true,
        showError: usernameError,
        showLabel: username,
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
      {
        fieldType: "password",
        name: "password",
        placeholder: false,
        required: true,
        showError: otherError,
        showLabel: password,
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
      {
        fieldType: "password",
        name: "confirmPassword",
        placeholder: false,
        required: false,
        showError: otherError,
        showLabel: confirmPassword,
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
    ];
  },

  userFormModalHeader() {
    return (
      <ModalHeading>
        <Trans render="span">Create New User</Trans>
      </ModalHeading>
    );
  },

  userFormModalFooter() {
    return null;
  },

  userLoginPolicy() {
    return null;
  },

  userModelObject(userObject) {
    const definition = this.userFormModalDefinition(null, null, {});
    // Basically only return keys that this plugin cares about
    const keys = definition.map((element) => element.name);

    return keys.reduce((accumulated, key) => {
      accumulated[key] = userObject[key];

      return accumulated;
    }, {});
  },

  usersPageContent() {
    const users = UsersStore.getUsers().map((u) => new User(u));

    // Discard content given and replace with new contents
    return <UsersPage items={users} />;
  },

  usersPageStoreListeners(listeners) {
    listeners.push({ name: "aclUser", events: ["updateSuccess"] });

    return listeners;
  },
};
