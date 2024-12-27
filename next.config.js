const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();


const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  }
};
 
module.exports = withNextIntl(nextConfig);