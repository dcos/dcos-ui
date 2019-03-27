FROM mesosphere/dcos-system-test-driver:2019

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
  && apk update \
  && apk upgrade \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" > /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && apk add --update nodejs nodejs-npm \
  # Install cypress dependencies
  && apk del python .python-rundeps \
  && apk add --update --no-cache bash git dumb-init curl make gcc g++ linux-headers binutils-gold gnupg libstdc++ nss libffi-dev openssl-dev python3 \
  # Install node & npm
  && curl -o- https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar -C /usr/local --strip-components=1 -zx \
  && npm install -g --unsafe-perm npm@${NPM_VERSION} \
  # Install System Tests dependencies
  # Install dcos-launch
  && pip install awscli --upgrade \
  && pip install git+git://github.com/dcos/dcos-test-utils@5361c8623cd0751f9312cf79b66dde6f09da1e74\
  && pip install git+git://github.com/dcos/dcos-launch.git@4a2515f4819f0a7efc051eb5ad2c5ceb34da5975 \
  && chmod +x /usr/local/bin/dcos-launch \
  # Ensure entrypoint is executable
  && chmod +x /usr/local/bin/dcos-ui-docker-entrypoint \
  # Make sure bash is the default shell
  && rm /bin/sh \
  && ln -sf /bin/bash /bin/sh \
  && npm install -g --unsafe-perm dogapi

# Define entrypoint
ENTRYPOINT [ "/bin/bash", "/usr/local/bin/dcos-ui-docker-entrypoint" ]

# Export mountable volumes
VOLUME /dcos-ui
VOLUME /dcos-ui-plugins
