module.exports = {
  "files": [
    // Catch-all in case we add other JS files
    {
      "path": "dist/*.js",
      "maxSize": "200kB"
    },

    // Main bundles
    {
      "path": "dist/bundle.js",
      "maxSize": "750kB",
      "compression": "none"
    },
    {
      "path": "dist/bundle.js.gz",
      "maxSize": "250kB",
      // This file is pre-compressed, so bundlewatch needs to be told not to
      // compress before comparing.
      "compression": "none"
    }
  ],

  "ci": {
      // We use `main` instead of `master` for the primary branch.
      "trackBranches": ["main"]
  }
};
