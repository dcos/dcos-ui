import { i18nMark } from "@lingui/react";
import Config from "../config/Config";
import MetadataStore from "../stores/MetadataStore";

const UnitSummaries = {
  "dcos-marathon.service": {
    summary: [
      i18nMark(`The`),
      Config.productName,
      i18nMark("Marathon instance starts and monitors"),
      Config.productName,
      i18nMark("applications and services.")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/overview/architecture/components/");
    }
  },
  "dcos-mesos-dns.service": {
    summary: [
      i18nMark("Mesos DNS provides service discovery within the cluster.")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/overview/architecture/components/");
    }
  },
  "dcos-mesos-master.service": {
    summary: i18nMark("The Mesos master process orchestrates agent tasks."),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/installing/ent/");
    }
  },
  "dcos-signal.service": {
    summary: [
      i18nMark(
        "Sends a periodic ping back to Mesosphere with high-level cluster information to help improve"
      ),
      Config.productName,
      i18nMark("and provides advance monitoring of cluster issues.")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gen-resolvconf.timer": {
    summary: [
      i18nMark("Sets the dcos-gen-resolvconf.service to be run once a minute.")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/installing/ent/");
    }
  },
  "dcos-exhibitor.service": {
    summary: [
      i18nMark("Manages"),
      Config.productName,
      i18nMark("in-cluster Zookeeper, used by Mesos as well as"),
      Config.productName,
      i18nMark("Marathon.")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/overview/what-is-dcos/");
    }
  },
  "dcos-history-service.service": {
    summary: [
      i18nMark("Caches recent cluster history in-memory so that the"),
      Config.productName,
      i18nMark("web interface can show recent data")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-logrotate.service": {
    summary: [
      i18nMark(
        "Logrotate allows for the automatic rotation compression, removal, and mailing of log files."
      )
    ],
    getDocumentationURI() {
      return "https://github.com/logrotate/logrotate/blob/master/README.md";
    }
  },
  "dcos-link-env.service": {
    summary: [
      i18nMark("Makes vendored"),
      Config.productName,
      i18nMark(
        "binaries, such as the mesos-master, mesos-slave, available at the command line when SSHing to a host."
      )
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-download.service": {
    summary: [
      i18nMark("Downloads and extracts the"),
      Config.productName,
      i18nMark("bootstrap tarball into /opt/mesosphere on your nodes.")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-logrotate.timer": {
    summary: [
      i18nMark(
        "Rotates the Mesos master and agent log files to prevent filling the disk."
      )
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-signal.timer": {
    summary: [
      i18nMark("Sets the dcos-signal.service interval at once an hour.")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gunicorn-bouncer.service": {
    summary: [
      i18nMark(
        "Processes login requests from users, as well as checking if an authorization token is valid."
      )
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-adminrouter-reload.service": {
    summary: [
      i18nMark(
        "Restart the Admin Router Nginx server so that it picks up new DNS resolutions, for example master.mesos, leader.mesos."
      )
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-nginx-reload.timer": {
    summary: [
      i18nMark(
        "Sets the dcos-adminrouter-reload.service interval at once an hour."
      )
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-setup.service": {
    summary: [
      i18nMark("Specializes the"),
      Config.productName,
      i18nMark(
        "bootstrap tarball for the particular cluster, as well as its cluster role."
      )
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-mesos-slave.service": {
    summary: [i18nMark("Runs a Mesos agent on the node.")],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-keepalived.service": {
    summary: [
      i18nMark(
        "Runs keepalived to make a VRRP load balancer that can be used to access the masters."
      )
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-adminrouter-agent.service": {
    summary: [
      i18nMark("Runs the"),
      Config.productName,
      i18nMark(
        "web interface, as well as a reverse proxy so that administrative interfaces of"
      ),
      Config.productName,
      i18nMark("Service can be accessed from outside the cluster.")
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gen-resolvconf.service": {
    summary: [
      i18nMark(
        "Periodically writes /etc/resolv.conf so that only currently active Mesos masters with working Mesos DNS are in it."
      )
    ],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/installing/ent/");
    }
  },
  "dcos-mesos-slave-public": {
    summary: [i18nMark("Runs a publicly accessible Mesos agent on the node.")],
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/security/");
    }
  }
};

module.exports = UnitSummaries;
