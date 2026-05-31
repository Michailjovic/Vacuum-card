import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/roborock-vacuum-card.js",
    format: "es",
    inlineDynamicImports: true,
  },
  plugins: [
    resolve(),
    typescript({
      declaration: false,
      sourceMap: false,
    }),
  ],
};
