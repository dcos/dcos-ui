FROM cypress/base:10

# Expose the 4200 port
EXPOSE 4200

# Copy required files in order to be able to do npm install
WORKDIR /dcos-ui


# Install required components & prepare environment
RUN set -x \
  && apt-get update \
  && apt-get install -y awscli lsof wget jq curl rsync \
  && apt-get clean \
  && curl -o /usr/local/bin/dcos-launch https://downloads.dcos.io/dcos-launch/bin/linux/dcos-launch \
  && curl -o /usr/local/bin/dcos https://downloads.dcos.io/cli/testing/binaries/dcos/linux/x86-64/master/dcos \
  && chmod +x /usr/local/bin/dcos-launch \
  && chmod +x /usr/local/bin/dcos \
  && npm install -g dogapi

# Export mountable volumes
VOLUME /dcos-ui
VOLUME /dcos-ui-plugins
