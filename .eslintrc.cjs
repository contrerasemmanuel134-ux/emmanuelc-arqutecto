
module.exports = {
  // Especifica los entornos
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  // Extiende las configuraciones recomendadas
  extends: [
    "eslint:recommended",
    "plugin:astro/recommended",
  ],
  // Opciones del parser
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  overrides: [
    {
      // Para archivos .astro
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      rules: {
        // Aquí puedes sobrescribir reglas específicas para Astro
      },
    },
    {
      // Para archivos .ts
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      extends: [
        "plugin:@typescript-eslint/recommended"
      ],
      rules: {
        // Aquí puedes sobrescribir reglas específicas para TypeScript
      },
    },
  ],
};
