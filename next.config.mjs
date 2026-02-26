/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve tracker.js as a static file from /public
  // Headers for the collect endpoint — allow cross-origin POST from any site
  async headers() {
    return [
      {
        source: "/api/collect",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
