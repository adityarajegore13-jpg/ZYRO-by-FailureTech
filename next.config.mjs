/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // बिल्ड करताना TypeScript चे एरर्स इग्नोर करेल
    ignoreBuildErrors: true,
  },
  eslint: {
    // बिल्ड करताना ESLint चे एरर्स इग्नोर करेल
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

