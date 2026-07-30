import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.sweetwater.com" },
      { protocol: "https", hostname: "images.thomann.de" },
      { protocol: "https", hostname: "media.musiciansfriend.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "**.fender.com" },
      { protocol: "https", hostname: "**.gibson.com" },
      { protocol: "https", hostname: "**.taylorguitars.com" },
      { protocol: "https", hostname: "**.martinguitar.com" },
      { protocol: "https", hostname: "**.ibanez.com" },
      { protocol: "https", hostname: "**.prsguitars.com" },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
  // Optimise bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
}

export default nextConfig
