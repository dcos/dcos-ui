import List from "#SRC/js/structs/List";
import Deployment from "./Deployment";

/**
 * A typed {@link List} of {@link Deployment}s.
 *
 * @struct
 */
class DeploymentsList extends List {}
DeploymentsList.type = Deployment;

export default DeploymentsList;
