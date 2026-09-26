// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The reader engine (web/ -> assets/web/) ships as plain assets: an HTML page
// and its script bundle saved as .txt so Metro doesn't compile it.
config.resolver.assetExts.push('html', 'txt');

module.exports = config;
