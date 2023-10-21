FROM golang:alpine as livedl-builder

RUN apk update && \
  apk upgrade && \
  apk add --no-cache git gcc musl-dev

RUN git clone https://github.com/nnn-revo2012/livedl-forked.git /work/livedl

WORKDIR /work/livedl/src
RUN go build -o /work/livedl/livedl livedl.go

# /work/livedl

FROM node:21-alpine

RUN apk update && \
  apk upgrade

COPY --from=livedl-builder /work/livedl/livedl /bin/livedl
RUN chmod +x /bin/livedl

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install && \
  yarn cache clean

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

COPY src src
COPY tsconfig.json .

ENTRYPOINT [ "/app/entrypoint.sh" ]
