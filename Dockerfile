FROM mesosphere/dcos-system-test-driver:latest

# Specify the component versions to use
ENV NODE_VERSION="10.15.2" \
  NPM_VERSION="6.9.0" \
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
  && apt-get clean \
  # Install System Tests dependencies
  # Install dcos-launch
  && pip install git+git://github.com/dcos/dcos-test-utils@5361c8623cd0751f9312cf79b66dde6f09da1e74\
  && pip install git+git://github.com/dcos/dcos-launch.git@4a2515f4819f0a7efc051eb5ad2c5ceb34da5975 \
  && chmod +x /usr/local/bin/dcos-launch \
  # Ensure entrypoint is executable
  && chmod +x /usr/local/bin/dcos-ui-docker-entrypoint \
  # Make sure bash is the default shell
  && rm /bin/sh \
  && ln -sf /bin/bash /bin/sh \
  # Fix system tests as long as upstream dependency has errors
  && pip install 'six==1.10.0' \
  && pip install 'python-dateutil==2.6.0' \
  && pip install 'PyYAML==3.12' \
  && npm install -g dogapi

# Define entrypoint
ENTRYPOINT [ "/bin/bash", "/usr/local/bin/dcos-ui-docker-entrypoint" ]

# Export mountable volumes
VOLUME /dcos-ui
VOLUME /dcos-ui-plugins
