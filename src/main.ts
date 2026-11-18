import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Modal,
	Notice,
	Plugin, requestUrl, TFile,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	StatblockTemplateImporterSettings,
	StatblockTemplateImporterSettingsTab,
} from './settings';

// Remember to rename these classes and interfaces!

export default class StatblockTemplateImporter extends Plugin {
	settings!: StatblockTemplateImporterSettings;

	async installUpdates() {
		const templates = this.settings.templateUrls;
		
		const results = await Promise.all(templates.map(async (template) => this.installTemplate(template.url, true)));
		if (results.every((result) => !result)) {
			new Notice('No template updates were found.');
		}
	}
	
	async installTemplate(gitHubUrl: string, automaticUpdate = false): Promise<boolean> {

		let cleanUrl = gitHubUrl.endsWith("/") ? gitHubUrl.slice(0, -1) : gitHubUrl;
		
		let suffix = '';
		
		if (!cleanUrl.includes('/releases/')){
			suffix = '/releases/latest';
		} else {
			cleanUrl = cleanUrl.replace('/tag/',  '/tags/')
		}

		const releaseUrl = `${cleanUrl.replace('https://github.com/', 'https://api.github.com/repos/')}${suffix}`;

		const response = await requestUrl(releaseUrl);
		
		if (response.status !== 200) {
			new Notice(`Failed to fetch release details from ${releaseUrl}. Status: ${response.status}`);
			return false;
		}
		
		const releaseDetails = response.json;

		if (!releaseDetails || !releaseDetails.assets || releaseDetails.assets.length === 0) {
			new Notice(`No assets found in the latest release of ${gitHubUrl}.`);
			return false;
		}
		
		const templateAssets = releaseDetails.assets.filter((a: any) => a.name.endsWith('.atlastemplate'));
		if (templateAssets.length === 0) {
			new Notice(`No .atlastemplate assets found in the latest release of ${gitHubUrl}.`);
			return false;
		}

		const results = await Promise.all(templateAssets.map(async (templateAsset: any) => {
			const templateContentResponse = await requestUrl(templateAsset.browser_download_url);
			if (templateContentResponse.status !== 200) {
				new Notice(`Failed to download template from ${templateAsset.browser_download_url}. Status: ${templateContentResponse.status}`);
				return false;
			}

			const template = templateContentResponse.json;

			const folder = 'atlas-vtt/statblock-templates';

			if (folder && !this.app.vault.getAbstractFileByPath(folder)) {
				try {
					await this.app.vault.createFolder(folder);
				} catch {
					/* folder already exists (race with another note); safe to ignore */
				}
			}
			const templates = this.app.vault.getFolderByPath('atlas-vtt/statblock-templates')?.children;

			const templateContents = await Promise.all(templates?.map(async (file) => ({
				...file,
				content: await this.app.vault.read(file as TFile)
			})) ?? []);

			const existingTemplate = templateContents.find((templateFile) => {
				try {
					const templateJson: { id: string } = JSON.parse(templateFile.content) as { id: string };
					return templateJson.id == template.id;
				} catch (e) {
					return false;
				}
			});

			if (!existingTemplate) {
				await this.app.vault.create(`atlas-vtt/statblock-templates/${templateAsset.name}`, JSON.stringify(template, null, 2));
				new Notice(`Template ${templateAsset.name} installed successfully.`);
				if (!this.settings.templateUrls.some((template) => template.url === gitHubUrl)) {
					this.settings.templateUrls.push({
						name: templateAssets.map((a: any) => a.name.replace('.atlastemplate', '')).join(', '),
						url: gitHubUrl
					});
					await this.saveSettings();
				}
				return true;
			}

			if (existingTemplate && JSON.parse(existingTemplate.content).version !== template.version) {
				const fileToUpdate = this.app.vault.getFileByPath(`atlas-vtt/statblock-templates/${existingTemplate.name}`);
				if (!fileToUpdate) {
					new Notice(`Failed to locate existing template file for ${existingTemplate.name}.`);
					return true;
				}
				await this.app.vault.modify(fileToUpdate as unknown as TFile, JSON.stringify(template, null, 2));
				new Notice(`Template ${templateAsset.name} updated successfully.`);
			}

			if (!automaticUpdate) {
				new Notice(`Failed to install ${templateAsset.name}. It may already be installed or up to date. Try deleting the template file and reinstalling.`);
			}

			return false;
		}));
		
		const cssAssets = releaseDetails.assets.filter((a: any) => a.name.endsWith('.css'));

		await Promise.all(cssAssets.map(async (cssAsset: any) => {
			const cssContentResponse = await requestUrl(cssAsset.browser_download_url);
			if (cssContentResponse.status !== 200) {
				new Notice(`Failed to download CSS from ${cssAsset.browser_download_url}. Status: ${cssContentResponse.status}`);
				return false;
			}

			const cssContent = cssContentResponse.text;

			const folder = `${this.app.vault.configDir}/snippets/`;

			if (folder && !this.app.vault.getAbstractFileByPath(folder)) {
				try {
					await this.app.vault.createFolder(folder);
				} catch {
					/* folder already exists (race with another note); safe to ignore */
				}
			}
			
			await this.app.vault.adapter.write(`${folder}/${cssAsset.name}`, cssContent);

			return true;
		}));
		return results.every((result) => result);
	}
	
		
	
	async onload() {
		await this.loadSettings();
		
		this.addSettingTab(new StatblockTemplateImporterSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<StatblockTemplateImporterSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
