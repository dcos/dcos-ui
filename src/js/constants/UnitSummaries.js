import Config from "../config/Config";
import MetadataStore from "../stores/MetadataStore";

const UnitSummaries = {
  "dcos-marathon.service": {
    summary: `The ${Config.productName} Marathon instance starts and monitors ${Config.productName} applications and services.`,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/overview/components/");
    }
  },
  "dcos-mesos-dns.service": {
    summary: "Mesos DNS provides service discovery within the cluster.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/overview/components/");
    }
  },
  "dcos-mesos-master.service": {
    summary: "The Mesos master process orchestrates agent tasks.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI(
        "/getting-started/installing/installing-enterprise-edition/troubleshooting/#scrollNav-2"
      );
    }
  },
  "dcos-signal.service": {
    summary: `Sends a periodic ping back to Mesosphere with high-level cluster information to help improve ${Config.productName}, and provides advance monitoring of cluster issues.'`,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gen-resolvconf.timer": {
    summary: "Sets the dcos-gen-resolvconf.service to be run once a minute.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI(
        "/getting-started/installing/installing-enterprise-edition/troubleshooting/#scrollNav-2"
      );
    }
  },
  "dcos-exhibitor.service": {
    summary: `Manages ${Config.productName} in-cluster Zookeeper, used by Mesos as well as ${Config.productName} Marathon.`,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/getting-started/overview/");
    }
  },
  "dcos-history-service.service": {
    summary: `Caches recent cluster history in-memory so that the ${Config.productName} web interface can show recent data`,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-logrotate.service": {
    summary: "Logrotate allows for the automatic rotation compression, removal, and mailing of log files.",
    getDocumentationURI() {
      return "https://github.com/logrotate/logrotate/blob/master/README.md";
    }
  },
  "dcos-link-env.service": {
    summary: `Makes vendored ${Config.productName} binaries, such as the mesos-master, mesos-slave, available at the command line when SSHing to a host.`,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-download.service": {
    summary: `Downloads and extracts the ${Config.productName} bootstrap tarball into /opt/mesosphere on your nodes.`,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-logrotate.timer": {
    summary: "Rotates the Mesos master and agent log files to prevent filling the disk.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-signal.timer": {
    summary: "Sets the dcos-signal.service interval at once an hour.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gunicorn-bouncer.service": {
    summary: "Processes login requests from users, as well as checking if an authorization token is valid.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI(
        "/installing-enterprise-edition-1-6/security-and-authentication/"
      );
    }
  },
  "dcos-adminrouter-reload.service": {
    summary: "Restart the Admin Router Nginx server so that it picks up new DNS resolutions, for example master.mesos, leader.mesos.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-nginx-reload.timer": {
    summary: "Sets the dcos-adminrouter-reload.service interval at once an hour.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-setup.service": {
    summary: `Specializes the ${Config.productName} bootstrap tarball for the particular cluster, as well as its cluster role.`,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-mesos-slave.service": {
    summary: "Runs a Mesos agent on the node.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-keepalived.service": {
    summary: "Runs keepalived to make a VRRP load balancer that can be used to access the masters.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-adminrouter.service": {
    summary: `Runs the ${Config.productName} web interface, as well as a reverse proxy so that administrative interfaces of ${Config.productName} Service can be accessed from outside the cluster.'`,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gen-resolvconf.service": {
    summary: "Periodically writes /etc/resolv.conf so that only currently active Mesos masters with working Mesos DNS are in it.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI(
        "/getting-started/installing/installing-enterprise-edition/troubleshooting/#scrollNav-6"
      );
    }
  },
  "dcos-mesos-slave-public": {
    summary: "Runs a publicly accessible Mesos agent on the node.",
    getDocumentationURI() {
      return MetadataStore.buildDocsURI(
        "/administration/dcosarchitecture/security/#scrollNav-3"
      );
    }
  }
};

module.exports = UnitSummaries;
