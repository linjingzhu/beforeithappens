const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const sharedWebSrc = path.resolve(projectRoot, "..", "src");

const config = getDefaultConfig(projectRoot);

// Expo/Metro project root is mobile/. S4 invite imports ../../src/auth.js
// (repo-root src/auth.js). Without watching that folder, Metro only looks
// at mobile/src/auth.js and the iOS JS bundle fails.
config.watchFolders = [...new Set([...(config.watchFolders || []), sharedWebSrc])];

module.exports = config;
