# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    # --- LÍNEA AGREGADA ---
    # Instala las herramientas de Firebase para poder desplegar desde el terminal
    pkgs.firebase-tools
  ];

  # Sets environment variables in the workspace
  env = { };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [ "astro-build.astro-vscode" ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        # --- BLOQUE MODIFICADO ---
        install = ''
          # Instala dependencias en la raíz (para Astro)
          npm ci --prefer-offline --no-audit --no-progress --timing || npm i --no-audit --no-progress --timing
          
          # Añade Tailwind a Astro
          yes | npx astro add tailwind
          
          # Instala dependencias para las Cloud Functions (¡IMPORTANTE!)
          (cd vetealaverga424rt237yru9urj32okp && npm ci --prefer-offline --no-audit --no-progress --timing || npm i --no-audit --no-progress --timing)
        '';
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command =
            [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
          manager = "web";
        };
      };
    };
  };
}
