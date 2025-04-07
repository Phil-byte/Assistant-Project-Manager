// shadcn.config.ts
export const shadcnConfig = {
  $schema: "https://ui.shadcn.dev/schema.json",
  style: "default",
  tailwind: {
    config: "tailwind.config.js",
    css: "src/app/globals.css"
  },
  paths: {
    components: "src/components/ui",
    utils: "src/lib/utils.ts"
  }
}
