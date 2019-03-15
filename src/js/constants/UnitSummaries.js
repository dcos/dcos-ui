/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { Trans } from "@lingui/macro";
import Config from "../config/Config";
import MetadataStore from "../stores/MetadataStore";

const UnitSummaries = {
  "dcos-marathon.service": {
    summary: (
      <Trans>
        The {Config.productName} Marathon instance starts and monitors{" "}
        {Config.productName} applications and services.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/overview/architecture/components/");
    }
  },
  "dcos-mesos-dns.service": {
    summary: (
      <Trans>Mesos DNS provides service discovery within the cluster.</Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/overview/architecture/components/");
    }
  },
  "dcos-mesos-master.service": {
    summary: <Trans>The Mesos master process orchestrates agent tasks.</Trans>,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/installing/ent/");
    }
  },
  "dcos-signal.service": {
    summary: (
      <Trans>
        Sends a periodic ping back to Mesosphere with high-level cluster
        information to help improve {Config.productName}, and provides advance
        monitoring of cluster issues.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gen-resolvconf.timer": {
    summary: (
      <Trans>
        Sets the dcos-gen-resolvconf.service to be run once a minute.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/installing/ent/");
    }
  },
  "dcos-exhibitor.service": {
    summary: (
      <Trans>
        Manages {Config.productName} in-cluster Zookeeper, used by Mesos as well
        as {Config.productName} Marathon.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/overview/what-is-dcos/");
    }
  },
  "dcos-history-service.service": {
    summary: (
      <Trans>
        Caches recent cluster history in-memory so that the {Config.productName}{" "}
        web interface can show recent data
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-logrotate.service": {
    summary: (
      <Trans>
        Logrotate allows for the automatic rotation compression, removal, and
        mailing of log files.
      </Trans>
    ),
    getDocumentationURI() {
      return "https://github.com/logrotate/logrotate/blob/master/README.md";
    }
  },
  "dcos-link-env.service": {
    summary: (
      <Trans>
        Makes vendored {Config.productName} binaries, such as the mesos-master,
        mesos-slave, available at the command line when SSHing to a host.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-download.service": {
    summary: (
      <Trans>
        Downloads and extracts the {Config.productName} bootstrap tarball into
        /opt/mesosphere on your nodes.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-logrotate.timer": {
    summary: (
      <Trans>
        Rotates the Mesos master and agent log files to prevent filling the
        disk.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-signal.timer": {
    summary: (
      <Trans>Sets the dcos-signal.service interval at once an hour.</Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gunicorn-bouncer.service": {
    summary: (
      <Trans>
        Processes login requests from users, as well as checking if an
        authorization token is valid.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-adminrouter-reload.service": {
    summary: (
      <Trans>
        Restart the Admin Router Nginx server so that it picks up new DNS
        resolutions, for example master.mesos, leader.mesos.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-nginx-reload.timer": {
    summary: (
      <Trans>
        Sets the dcos-adminrouter-reload.service interval at once an hour.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-setup.service": {
    summary: (
      <Trans>
        Specializes the {Config.productName} bootstrap tarball for the
        particular cluster, as well as its cluster role.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-mesos-slave.service": {
    summary: <Trans>Runs a Mesos agent on the node.</Trans>,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-keepalived.service": {
    summary: (
      <Trans>
        Runs keepalived to make a VRRP load balancer that can be used to access
        the masters.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-adminrouter-agent.service": {
    summary: (
      <Trans>
        Runs the {Config.productName} web interface, as well as a reverse proxy
        so that administrative interfaces of {Config.productName} Service can be
        accessed from outside the cluster.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/");
    }
  },
  "dcos-gen-resolvconf.service": {
    summary: (
      <Trans>
        Periodically writes /etc/resolv.conf so that only currently active Mesos
        masters with working Mesos DNS are in it.
      </Trans>
    ),
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/installing/ent/");
    }
  },
  "dcos-mesos-slave-public": {
    summary: <Trans>Runs a publicly accessible Mesos agent on the node.</Trans>,
    getDocumentationURI() {
      return MetadataStore.buildDocsURI("/security/");
    }
  }
};

export default UnitSummaries;
