#!/bin/bash

if [ "$PRIVATE_REPO_ACCESS_TOKEN" != "" ]; then
  git config --global url."https://${PRIVATE_REPO_ACCESS_TOKEN}@github.com/".insteadOf ssh://git@github.com/
fi
