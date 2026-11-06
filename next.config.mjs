/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      "@react-native-async-storage/async-storage": false,
    };
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "@react-native-async-storage/async-storage",
      "@x402/evm",
      "@x402/core",
      "@x402/svm",
      "@x402/evm/upto/client",
      "@x402/evm/exact/client",
      "@x402/core/client",
      "@x402/svm/exact/client"
    );
    return config;
  },
};

export default nextConfig;

