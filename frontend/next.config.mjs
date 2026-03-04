import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true
});

export default withPWA({
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  }
});
