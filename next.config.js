/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Ponte explícita para chamadas diretas ao backend via namespace dedicado.
      // Mantemos as rotas Next /api/belvo/* para anexar Authorization via cookies/sessão.
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;