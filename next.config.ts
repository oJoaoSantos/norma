import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output leve (só o necessário para correr) para a imagem Docker de produção.
  output: "standalone",
};

export default nextConfig;
