#!/bin/bash

if [ "$NODE_ENV" == "production" ]; then
  if [ "${PRIVATE_REPO_ACCESS_TOKEN:-}" ]; then
    git config --global --unset-all url."https://${PRIVATE_REPO_ACCESS_TOKEN}@github.com/".insteadOf
    unset PRIVATE_REPO_ACCESS_TOKEN
  fi
fi
