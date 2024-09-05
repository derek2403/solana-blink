/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
      return [
        {
          // This applies to all routes under /api/actions
          source: '/api/actions/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Content-Encoding, Accept-Encoding' },
            { key: 'Content-Type', value: 'application/json' },
          ],
        },
        {
          // This applies to the actions.json file
          source: '/actions.json',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Content-Type', value: 'application/json' },
          ],
        },
        {
          // This applies to all API routes
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Content-Encoding, Accept-Encoding' },
            { key: 'Content-Type', value: 'application/json' },
          ],
        },
      ];
    },
    // Additional configuration options
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ];
    },
    // You can add more Next.js config options here as needed
  };
  
  