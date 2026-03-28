const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: isProd ? "/transit-layout" : "",
  assetPrefix: isProd ? "/transit-layout/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
