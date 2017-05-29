#!/bin/bash -e

# Takes 2 parameters
# ${1} - deploy branch name
# ${2} - heroku remote name

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

exists=`git show-ref refs/heads/${1}`
if [ -n "$exists" ]; then
    echo "git checkout ${1}"
else
    git checkout -b ${localBranch} master
    gulp css browserify
    git add -f dist/bundle.js dist/css/diff.css dist/css/styles.css
    git commit
    git push -f ${remote} ${localBranch}:master
fi
