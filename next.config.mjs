/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "utfs.io",
      },
      {
        hostname: "www.google.com",
      },
      {
        hostname: "freesvg.org",
      },
      {
        hostname: "lh3.googleusercontent.com", // Adicione o domínio do Google
      }
    ],
  },
}

export default nextConfig
