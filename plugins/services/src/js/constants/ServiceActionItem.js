import UserActions from "#SRC/js/constants/UserActions";

const ServiceActionItem = {
  CREATE: "create",
  CREATE_GROUP: "create_group",
  EDIT: "edit",
  DELETE: UserActions.DELETE,
  OPEN: "open",
  RESTART: "restart",
  RESUME: "resume",
  SCALE: "scale",
  STOP: "stop",
  MORE: "more",
  KILL_POD_INSTANCES: "kill_pod_instances",
  KILL_TASKS: "kill_tasks"
};

export default ServiceActionItem;
