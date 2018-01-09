#!/bin/bash -e

# @param {string} remote [heroku]       - heroku remote name
# @param {string} deployFrom [master]   - local branch to deploy

# check and set defaults
remote=${1:-heroku}
deployFrom=${2:-master}
deployTo="heroku-deploy"
currentBranch=`git rev-parse --abbrev-ref HEAD`

hasChanges=`git diff-index HEAD --`
if [ -n "$hasChanges" ]; then
    git stash
fi

# create new branch if necessary
exists=`git show-ref refs/heads/${deployTo}`
if [ -n "$exists" ]; then
    git checkout ${deployTo}
    git reset --hard ${deployFrom}
else
    git checkout -b ${deployTo} ${deployFrom}
fi

yarn run build-production
git add -f dist/bundle.* dist/css/* dist/img/* dist/sourceMaps/*
git commit -m "Deploy heroku app"
git push -f ${remote} ${deployTo}:master
git checkout ${currentBranch}

if [ -n "$hasChanges" ]; then
    git stash apply
fi

echo "Finished deployment"
