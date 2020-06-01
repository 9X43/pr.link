#!/bin/bash

__github_username='9X43'
__src_folder='pages'
__private_repositories="${__src_folder}/.private"

# Change protocol to access private repositories
if [ "$NODE_ENV" == "production" ]; then
  if [ "${PRIVATE_REPO_ACCESS_TOKEN:-}" ]; then
    git config --global url."https://${PRIVATE_REPO_ACCESS_TOKEN}@github.com/".insteadOf ssh://git@github.com/
    git config --add --global url."https://${PRIVATE_REPO_ACCESS_TOKEN}@github.com/".insteadOf https://github.com/
  else
    echo 'PRIVATE_REPO_ACCESS_TOKEN is not set.'
    exit 1
  fi
fi

# Clone private repositories
while read __git_project; do
  __git_url="https://github.com/${__github_username}/${__git_project}.git"
  __local_path="${__src_folder}/${__git_project}"

  if [ -e "$__local_path" ]; then
    continue
  fi

  git clone "$__git_url" "$__local_path"
done < "$__private_repositories"