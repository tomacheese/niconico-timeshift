#!/bin/sh

while :
do
  yarn build || true

  # wait 1 hour
  sleep 3600
done