const path = require('path');
const withFonts = require('next-fonts');
const withLess = require('next-with-less');
const tsconfig = require('./tsconfig.base.json');

const alias = Object.entries(tsconfig.compilerOptions.paths).reduce((acc, [key, value]) => {
  const cleanedKey = key.replace(/\/*$/, '');
  const cleanedValue = value[0].replace(/\/*$/, '');
  acc[cleanedKey] = path.join(__dirname, cleanedValue);
  return acc;
}, {});

const nextConfig = {
  lessLoaderOptions: {
    lessOptions: {
      strictMath: true
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.statically.io',
        port: '',
        pathname: '',
      },
    ],
  },
  webpack(config) {
    config.resolve.alias = { ...config.resolve.alias, ...alias };
    return config;
  },
  publicRuntimeConfig: {
    adminRole: process.env.ADMIN_ROLE_NAME,
    basicBrandingConfigEditorRole: process.env.NEXT_PUBLIC_BRANDING_CONFIG_EDITOR_ROLE_NAME,
    advancedBrandingConfigEditorRole: process.env.NEXT_PUBLIC_ADVANCED_BRANDING_CONFIG_EDITOR_ROLE_NAME,
    idpCreationRole: process.env.NEXT_PUBLIC_IDP_MANAGER_ROLE_NAME,
    baseOrgUrl: process.env.BASE_ORG_URL,
    baseUrl: process.env.BASE_URL,
    meetingApiKey: process.env.MEETING_API_KEY,
    personalizationApiKey: process.env.PERSONALIZATION_API_KEY,
    chatApiKey: process.env.CHAT_API_KEY,
    meetingServiceUrl: process.env.MEETING_SERVICE_URL,
    chatServiceUrl: process.env.CHAT_SERVICE_URL,
    clientId: process.env.CLIENT_ID,
    hostedUrl: process.env.HOSTED_URL,
    personalizationServiceUrl: process.env.PERSONALIZATION_SERVICE_URL,
    sharedAppName: process.env.SHARED_APP_NAME
  }
};

module.exports = withFonts(withLess(nextConfig));
