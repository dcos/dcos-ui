import List from "#SRC/js/structs/List";
import Deployment from "./Deployment";

/**
 * A typed {@link List} of {@link Deployment}s.
 *
 * @struct
 */
export default class DeploymentsList extends List<Deployment> {}
DeploymentsList.type = Deployment;
