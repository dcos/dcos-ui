import Item from "./Item";
import FrameworkUtil from "../../../plugins/services/src/js/utils/FrameworkUtil";
import Util from "../utils/Util";
import StringUtil from "../utils/StringUtil";

class UniversePackage extends Item {
  getAppId() {
    return this.get("appId");
  }

  getConfig() {
    return Object.assign({}, this.get("config"), { type: "object" });
  }

  getDescription() {
    return this.get("description");
  }

  getIcons() {
    return FrameworkUtil.getServiceImages(
      Util.findNestedPropertyInObject(this.get("resource"), "images")
    );
  }

  getName() {
    return this.get("name");
  }

  getScreenshots() {
    return Util.findNestedPropertyInObject(
      this.get("resource"),
      "images.screenshots"
    );
  }

  getLicenses() {
    return this.get("licenses") || [];
  }

  getMaintainer() {
    return this.get("maintainer");
  }

  getPreInstallNotes() {
    return StringUtil.punctuate(this.get("preInstallNotes"));
  }

  getPostInstallNotes() {
    return this.get("postInstallNotes");
  }

  getPostUninstallNotes() {
    return this.get("postUninstallNotes");
  }

  getSCM() {
    return this.get("scm");
  }

  getVersion() {
    return this.get("version") || this.get("currentVersion");
  }

  getTags() {
    return this.get("tags") || [];
  }

  isCLIOnly() {
    return !Util.findNestedPropertyInObject(
      this.get("marathon"),
      "v2AppMustacheTemplate"
    );
  }

  isCertified() {
    return this.get("selected");
  }
}

module.exports = UniversePackage;
