import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://yongseokjo.com",
  output: "static",
  adapter: netlify(),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
