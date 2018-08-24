FROM mesosphere/dcos-system-test-driver:latest

# Specify the component versions to use
ENV NODE_VERSION="8.9.4" \
  NPM_VERSION="5.6.0" \
  JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64"

# Expose the 4200 port
EXPOSE 4200

# Copy required files in order to be able to do npm install
WORKDIR /dcos-ui

# Copy the entrypoint script that takes care of executing run-time init tasks,
# such as creating the scaffold in the user's repository
COPY scripts/docker-entrypoint /usr/local/bin/dcos-ui-docker-entrypoint

# Install required components & prepare environment
RUN set -x \
  # Install aws-cli
  && pip install awscli --upgrade \
  # Install node & npm
  && curl -o- https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar -C /usr/local --strip-components=1 -zx \
  && npm install -g npm@${NPM_VERSION} \
  # Install cypress dependencies & JRE (required by Jenkins)
  && echo 'deb http://ftp.debian.org/debian jessie-backports main' >> /etc/apt/sources.list \
  && apt-get update \
  && apt-get install -y xvfb libgtk2.0-0 libnotify-dev libgconf-2-4 libnss3 libxss1 lsof \
  && apt-get install -t jessie-backports -y openjdk-8-jre-headless ca-certificates-java \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  # Post-install java certificates
  /var/lib/dpkg/info/ca-certificates-java.postinst configure \
  # Install npm dependencies (System Tests!)
  && cd /dcos-ui \
  && npm install -g git://github.com/dcos-labs/http-server.git#proxy-secure-flag \
  # Install dcos-launch
  && curl 'https://downloads.dcos.io/dcos-launch/bin/linux/dcos-launch' > /usr/local/bin/dcos-launch \
  && chmod +x /usr/local/bin/dcos-launch \
  # Ensure entrypoint is executable
  && chmod +x /usr/local/bin/dcos-ui-docker-entrypoint \
  # Make sure bash is the default shell
  && rm /bin/sh \
  && ln -sf /bin/bash /bin/sh \
  # Fix system tests as long as upstream dependency has errors
  && pip install 'six==1.10.0' \
  && pip install 'python-dateutil==2.6.0' \
  && pip install 'PyYAML==3.12'

# Define entrypoint
ENTRYPOINT [ "/bin/bash", "/usr/local/bin/dcos-ui-docker-entrypoint" ]

# Export mountable volumes
VOLUME /dcos-ui
VOLUME /dcos-ui-plugins
