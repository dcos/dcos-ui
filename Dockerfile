FROM mesosphere/dcos-system-test-driver:latest

# Specify the component versions to use
ENV CYPRESS_VERSION="0.19.1" \
  NODE_VERSION="4.4.7" \
  NPM_VERSION="3.9" \
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

  # Install node 4.4.7 & npm 3.9
  && curl -o- https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar -C /usr/local --strip-components=1 -zx \
  && npm install -g npm@${NPM_VERSION} \

  # Install cypress dependencies & JRE (required by Jenkins)
  && echo 'deb http://ftp.debian.org/debian jessie-backports main' >> /etc/apt/sources.list \
  && apt-get update \
  && apt-get install -y xvfb libgtk2.0-0 libnotify-dev libgconf-2-4 libnss3 libxss1 \
  && apt-get install -t jessie-backports -y openjdk-8-jre-headless ca-certificates-java \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \

  # Post-install java certificates
  /var/lib/dpkg/info/ca-certificates-java.postinst configure \

  # Install npm dependencies
  && cd /dcos-ui \
  && npm install -g cypress-cli git://github.com/johntron/http-server.git#proxy-secure-flag \

  # Install cypress
  && cypress install --cypress-version ${CYPRESS_VERSION} \

  # Install dcos-launch
  && pip install git+git://github.com/dcos/dcos-test-utils@5361c8623cd0751f9312cf79b66dde6f09da1e74 \
  && pip install git+git://github.com/dcos/dcos-launch.git@4a2515f4819f0a7efc051eb5ad2c5ceb34da5975 \
  && chmod +x /usr/local/bin/dcos-launch \

  # Ensure entrypoint is executable
  && chmod +x /usr/local/bin/dcos-ui-docker-entrypoint \

  # Make sure bash is the default shell
  && rm /bin/sh \
  && ln -sf /bin/bash /bin/sh

# Define entrypoint
ENTRYPOINT [ "/bin/bash", "/usr/local/bin/dcos-ui-docker-entrypoint" ]

# Export mountable volumes
VOLUME /dcos-ui
VOLUME /dcos-ui-plugins
