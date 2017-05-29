#!/bin/bash -e

# @param {string} remote [heroku]       - heroku remote name
# @param {string} deployFrom [master]   - local branch to deploy

# Check and set defaults
remote=${1:-heroku}
deployFrom=${2:-master}
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
echo "Finished deployment"
