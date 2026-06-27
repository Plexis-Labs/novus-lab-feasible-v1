import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: [
    "src/content.ts",
    "src/service-worker.ts"
  ],
  bundle: true,
  outdir: "dist",
  platform: "browser",
  target: "es2020",
  sourcemap: true
});

console.log("✅ Extension built successfully.");