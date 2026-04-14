import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Handle legacy /dashboard/... URLs — (dashboard) is a route group, not a URL segment
      {
        source: "/dashboard/:path+",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
