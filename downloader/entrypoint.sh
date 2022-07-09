#!/bin/sh

while :
do
  yarn build || true

  # wait 6 hours
  sleep 21600
done