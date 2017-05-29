#!/bin/bash -ex

# Takes 2 parameters
# ${1} - heroku remote name - default: heroku
# ${2} - deploy from - default: master

# Check and set defaults
if [ -z "${1}" ]; then
    remote="heroku"
else
    remote=${1}
fi

if [ -z "${2}" ]; then
    deployFrom="master"
else
    deployFrom=${2}
fi

deployTo="heroku-deploy"

currentBranch=`git rev-parse --abbrev-ref HEAD`

# create new branch if necessary
exists=`git show-ref refs/heads/${deployTo}`
if [ -n "$exists" ]; then
    git checkout ${deployTo}
    git reset --hard ${deployFrom}
else
    git checkout -b ${deployTo} ${deployFrom}
fi

gulp css browserify
git add -f dist/bundle.js dist/css/diff.css dist/css/styles.css
git commit -m "Deploy heroku app"
git push -f ${remote} ${deployTo}:master

git checkout ${currentBranch}

echo "Done"
