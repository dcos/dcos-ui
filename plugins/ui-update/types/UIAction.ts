export enum UIActions {
  None = "",
  Started = "start",
  Completed = "complete",
  Error = "error"
}

export enum UIActionType {
  None = "",
  Reset = "UIReset",
  Update = "UIUpdate"
}

export interface UIAction {
  type: UIActionType;
  action: UIActions;
  value: string;
}

export const EMPTY_ACTION: UIAction = {
  type: UIActionType.None,
  action: UIActions.None,
  value: ""
};
