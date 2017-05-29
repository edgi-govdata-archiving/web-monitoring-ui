#!/bin/bash -e

# Takes 2 parameters
# ${1} - deploy from - default: master
# ${2} - deploy to - default: heroku-deploy
# ${2} - heroku remote name - default: heroku

# Check and set defaults
if [ -z "${1}" ]; then
    deployFrom="master"
else
    deployFrom=${1}
fi

if [ -z "${2}" ]; then
    deployTo="heroku-deploy"
else
    deployTo=${2}
fi

if [ -z "${3}" ]; then
    remote="heroku"
else
    remote=${3}
fi

exists=`git show-ref refs/heads/${deployTo}`
if [ -n "$exists" ]; then
    git checkout ${deployTo}
    git reset --hard ${deployFrom}
else
    git checkout -b ${deployTo} ${deployFrom}
fi

gulp css browserify
git add -f dist/bundle.js dist/css/diff.css dist/css/styles.css
git commit
git push -f ${remote} ${deployTo}:master
