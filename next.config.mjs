/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // required by react-beautiful-dnd
    return config;
  },
};

export default nextConfig;
