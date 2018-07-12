import { Component } from "react";

interface AccountDropdownProps {
  userName?: null | string;
  menuItems?: object;
  willAnchorRight?: boolean;
}

export default class AccountDropdown extends Component<AccountDropdownProps> {}
