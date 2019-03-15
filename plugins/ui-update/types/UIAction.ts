enum UIActions {
  None = "",
  Started = "start",
  Completed = "complete",
  Error = "error"
}

enum UIActionType {
  None = "",
  Reset = "UIReset",
  Update = "UIUpdate"
}

interface UIActionValue {
  message: string;
  data?: string;
}

interface UIAction {
  type: UIActionType;
  action: UIActions;
  value: UIActionValue;
}

const EMPTY_ACTION: UIAction = {
  type: UIActionType.None,
  action: UIActions.None,
  value: {
    message: ""
  }
};

export { UIAction, UIActions, UIActionType, UIActionValue, EMPTY_ACTION };
