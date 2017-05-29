#!/bin/bash -e

# Takes 2 parameters
# ${1} - deploy branch name
# ${2} - heroku remote name

(
# Check and set defaults
if [ -z "${1}" ]; then
    localBranch="heroku-deploy"
else
    localBranch=${1}
fi

if [ -z "${2}" ]; then
    remote="heroku"
else
    remote=${2}
fi

echo ${localBranch}
echo ${remote}

exists=`git show-ref refs/heads/${1}`
if [ -n "$exists" ]; then
    echo "git checkout ${1}"
else
    echo "git checkout -b ${1}"
fi
)
