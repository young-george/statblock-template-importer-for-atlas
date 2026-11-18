# Statblock Template Installer for Atlas

Easily install shared statblock templates and any associated CSS snippets into Obsidian and Atlas.

## Installation

### Obsidian Community Plugin (recommended for stable releases)
1. Open **Settings**
2. Go to **Community plugins**
3. Click **Browse**
4. Search **"Statblock Template Installer for Atlas"**
5. Click **Install**, then **Enable**

### Manual
1. Download the latest release zip from the [Releases page](https://github.com/young-george/DnD-Beyond-Importer-for-Atlas/releases) (or build from source below)
2. Unzip into your vault's plugin directory:
   ```
   <YourVault>/.obsidian/plugins/statblock-template-installer-for-atlas/
   ```
   The folder needs `main.js`, `manifest.json`, and `styles.css`
3. Go to **Obsidian → Settings → Community Plugins** and enable **Statblock Template Installer for Atlas**

### Build from source
```bash
git clone https://github.com/young-george/statblock-template-importer-for-atlas.git
cd dndbeyond-importer-for-atlas
npm install
npm run build
```
This produces `main.js` in the project root.


## Install a template

To install a statblock template, open the plugin settings, click the add template button (represented by a plus icon), then 
paste the GitHub repository URL or the specific release URL containing the template into the input field. Then click **Install**.
This will download and copy all `.atlastemplate` files from the release into `atlas-vtt/statblock-templates` and all `.css` files into `.obsidian/snippets`.

Go to **Obsidian Settings → Appearance → CSS snippets** to enable any snippets or themes required.

Supported URL formats:
- `https://github.com/young-george/statblock-template-importer-for-atlas`
  - This format will automatically use the `latest` release.
- `https://github.com/young-george/statblock-template-importer-for-atlas/releases/tag/some-release`

## For Statblock creators: Publish a template release

In order to make your statblock template available for installation, you need to create a release on GitHub. The release should contain all `.atlastemplate` files and any `.css` files required for the template.
1. Create a public GitHub repository for your template. You can upload any source files here if you want, but this is not required.
2. Create a release on GitHub. You can do this by going to the homepage of your repository and clicking "Create a new release".
   1. Give your release a tag (e.g., `v1.0.0`) and a title.
   2. Upload all `.atlastemplate` files and any `.css` files required for the template.
   3. Publish the release.
3. Share the URL of your repository or the specific release with others so they can install your template using this plugin.

For more details on creating releases, see the [GitHub releases documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).
