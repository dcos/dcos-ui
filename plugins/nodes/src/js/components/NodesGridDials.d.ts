import { ClassicComponentClass } from "react";

interface NodesGridDialsProps {
  hosts: Node[];
  resourcesByFramework: ResourcesByFramework;
  selectedResource: string;
  serviceColors: ServiceColors;
}

declare const NodesGridDials: ClassicComponentClass<NodesGridDialsProps>;

export default NodesGridDials;
