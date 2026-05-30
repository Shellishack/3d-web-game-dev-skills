# 3D Web Game Dev Skills

Codex skills for building 3D web game prototypes and low-poly game assets.

## Skills

### `generate-low-poly-model`

Guides agents through creating low-poly Three.js models and exporting them as glTF or GLB assets. It includes a bundled procedural model library at:

```text
generate-low-poly-model/scripts/procedural-low-poly-models.js
```

The library exports fixed, parameterized factories for:

- Animals: dog, cat, horse, deer, goat, tiger, bear, panda, monkey, bird, chicken, fish.
- Humans: human, child, worker, adventurer, robot.
- Objects and plants: oak tree, pine tree, palm tree, flower, grass clump, bush, rock, crate, barrel, mushroom.

Each factory accepts `(THREE, params = {})`, returns a named `THREE.Group`, uses export-friendly low-poly primitives, and stores generation metadata in `group.userData.procedural`.

### `initialize-game-repo`

Guides agents through bootstrapping a modern 3D game prototype repository with:

- React and Vite for the web app.
- Babylon.js for the 3D scene.
- Electron scripts for desktop builds.
- Source files under `app/`.
- Web and desktop npm script conventions.

## Using These Skills

Place this repository where Codex can discover local skills, or copy an individual skill folder into your Codex skills directory. Each skill folder contains a valid `SKILL.md` with required frontmatter.

## Install With `npx`

This repo includes a dependency-free CLI that lets users choose which bundled skills to install.

From npm after publication:

```bash
npx 3d-web-game-dev-skills
```

Directly from GitHub:

```bash
npx github:Shellishack/3d-web-game-dev-skills
```

Useful commands:

```bash
# List available skills
npx github:Shellishack/3d-web-game-dev-skills -- --list

# Install all bundled skills to ~/.codex/skills
npx github:Shellishack/3d-web-game-dev-skills -- --all

# Install one skill
npx github:Shellishack/3d-web-game-dev-skills -- --skill generate-low-poly-model

# Install to a custom directory
npx github:Shellishack/3d-web-game-dev-skills -- --target ./skills

# Replace an existing installed skill folder
npx github:Shellishack/3d-web-game-dev-skills -- --skill generate-low-poly-model --force
```

The CLI binary is named `skills`, so after a global install it can also be run as:

```bash
skills
```

Example skill folder layout:

```text
generate-low-poly-model/
  SKILL.md
  scripts/
    procedural-low-poly-models.js
```

## License

MIT
