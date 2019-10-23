#!/bin/bash

if [ "$PRIVATE_REPO_ACCESS_TOKEN" != "" ]; then
  git config --global --unset url."https://${PRIVATE_REPO_ACCESS_TOKEN}@github.com/".insteadOf
  unset $PRIVATE_REPO_ACCESS_TOKEN
fi
