/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // CORS Headers - Moved from original location to keep all headers for the same source together
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "production"
                ? process.env.ALLOWED_ORIGINS
                : "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Origin",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400", // 24 hours
          },
          // Security Headers - Moved from original location to keep all headers for the same source together
          // {
          //   key: "X-Frame-Options",
          //   value: "SAMEORIGIN",
          // },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Enhanced security for API routes
        source: "/api/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // {
          //   key: "X-Frame-Options",
          //   value: "SAMEORIGIN",
          // },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // {
          //   key: "Content-Security-Policy",
          //   value:
          //     "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
          // },
          // API-specific headers - Moved from original location to keep all headers for the same source together
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "production"
                ? process.env.ALLOWED_ORIGINS
                : "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Vary",
            value: "Origin",
          },
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    CORS_ENABLED: process.env.CORS_ENABLED || "true",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable OR NOT ESLint during the build
    ignoreDuringBuilds: true,
    dirs: ["app"], // Only run ESLint on the 'app' directory during production builds (next build)
  },
};

export default nextConfig;
