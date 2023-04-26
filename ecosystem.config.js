module.exports = {
  apps : [
    {
      "ignore_watch" : [
        "node_modules",
        "public/images",
        "cache"
      ],
      "watch_options": {
        "followSymlinks": false,
      },

      script  : "./index.js",
      watch   : true,
      name    : "click-to-chat"
    }
  ]
}