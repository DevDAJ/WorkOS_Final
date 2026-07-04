import adapter from "@sveltejs/adapter-netlify";

const config = {
  compilerOptions: {
    runes: ({ filename }) =>
      filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
  },
  kit: {
    adapter: adapter({
      edge: false,
      split: false,
    }),
    alias: {
      $generated: "./src/generated",
      $features: "./src/features",
    },
  },
};

export default config;
