FROM mesosphere/dcos-system-test-driver:latest

# Specify the component versions to use
ENV CYPRESS_VERSION="0.19.1" \
    NODE_VERSION="4.4.7" \
    NPM_VERSION="3.9"

# Expose the 4200 port
EXPOSE 4200

# Copy required files in order to be able to do npm install
WORKDIR /dcos-ui
COPY package.json npm-shrinkwrap.json scripts /dcos-ui/

# Copy the entrypoint script that takes care of executing run-time init tasks,
# such as creating the scaffold in the user's repository
COPY scripts/docker-entrypoint /usr/local/bin/dcos-ui-docker-entrypoint

# Install required components & prepare environment
RUN set -x \

  # Install node 4.4.7 & npm 3.9
  && curl -o- https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar -C /usr/local --strip-components=1 -zx \
  && npm install -g npm@${NPM_VERSION} \

  # Install cypress dependencies
  && apt-get update \
  && apt-get install -y xvfb libgtk2.0-0 libnotify-dev libgconf-2-4 libnss3 libxss1 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \

  # Install npm dependencies
  && cd /dcos-ui \
  && npm install \
  && npm install -g cypress-cli http-server compression-webpack-plugin \

  # Install cypress
  && cypress install --cypress-version ${CYPRESS_VERSION} \

  # Move node_modules out of the directory to make it clean for mounting
  # this will be brought back in by the entry point
  && mv node_modules /var/lib/ \

  # Calculate the checksum of package.json in order to detect changes that
  # will trigger a new npm install
  && sha512sum package.json > /var/lib/package.json.sha512 \

  # Ensure entrypoint is executable
  && chmod +x /usr/local/bin/dcos-ui-docker-entrypoint \

  # Make sure bash is the default shell
  && rm /bin/sh \
  && ln -sf /bin/bash /bin/sh

# Define entrypoint
ENTRYPOINT [ "/bin/bash", "/usr/local/bin/dcos-ui-docker-entrypoint" ]

# Export the working directory
VOLUME /dcos-ui
