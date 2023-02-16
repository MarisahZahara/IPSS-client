/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    REACT_APP_API: process.env.REACT_APP_API,
    REACT_APP_JWT: process.env.REACT_APP_JWT,
  },
}

module.exports = nextConfig
