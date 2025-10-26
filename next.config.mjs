/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "example.com",
			},
					{
						protocol: "http",
						hostname: "example.com",
					},
			{
				protocol: "https",
				hostname: "*.blob.vercel-storage.com",
			},
		],
	},
};

export default nextConfig;
