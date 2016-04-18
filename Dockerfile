FROM alpine

# install dependencies for imagemin
RUN apk update && apk add \
	autoconf \
	automake \
	build-base \
	file \
	libpng-dev \
	nasm \
	nodejs \
	&& rm -rf /var/cache/apk/*

RUN npm install -g gulp

COPY . /usr/src/dcos-ui
WORKDIR /usr/src/dcos-ui

RUN npm install

CMD ["npm", "run", "serve"]
