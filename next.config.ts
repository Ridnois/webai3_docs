import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx"],
  turbopack: {},
};

export default withContentlayer(nextConfig);
