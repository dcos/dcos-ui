import Mount from "./src/mount/Mount";
import navigation from "./src/navigation";
import routing from "./src/routing";
import { MountService } from "./src/mount";

module.exports = {
  MountService: {
    Mount,
    MountService
  },
  navigation,
  routing
};
