const path = require("path");

module.exports = {
  webpack: (config, env) => {
    config.resolve.fallback = {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      zlib: require.resolve("browserify-zlib"),
      url: require.resolve("url/"),
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      stream: path.resolve(__dirname, "node_modules/stream-browserify"),
    };

    return config;
  },
};
