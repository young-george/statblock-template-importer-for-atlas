import {
	App, Modal, Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	SettingGroup,
	TFile,
	WorkspaceLeaf
} from "obsidian";
import MyPlugin from './main';
import {denoBuiltin} from "globals";
import {IStatblockImporterPlugin} from "./types";

export interface StatblockTemplateImporterSettings {
	templateUrls: {name: string, url: string}[];
}

export const DEFAULT_SETTINGS: StatblockTemplateImporterSettings = {
	templateUrls: [],
};

export class StatblockTemplateImporterSettingsTab extends PluginSettingTab {
	plugin: IStatblockImporterPlugin;

	constructor(app: App, plugin: IStatblockImporterPlugin) {
		super(app, plugin as Plugin);
		this.plugin = plugin;
	}
	
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createDiv({ cls: 'statblock-importer-settings-tab' });
		const settingGroup = new SettingGroup(containerEl)
			.setHeading("Templates")
			.addExtraButton(button => {
				button
					.setIcon('refresh-cw')
					.setTooltip('Updates all installed templates')
					.onClick(async () => {
						await this.plugin.installUpdates();
					});
			})
			.addExtraButton(button => {
				button
					.setIcon('plus-with-circle')
					.setTooltip('Add new template')
					.onClick(async () => {
						new SampleModal(this.app, this.plugin).openWithCallback(url => {
							this.plugin.saveSettings().then(() => {
								this.display();
							})
						});
					})
			});

			if(this.plugin.settings.templateUrls.length == 0) {
				settingGroup.addSetting(cb => {
					cb.setName("No templates installed")
						.setDesc("You can add a new template using the + button.")
						.addExtraButton(button => {
							button
								.setIcon('plus-with-circle')
								.setTooltip('Add new template')
								.onClick(async () => {
									new SampleModal(this.app, this.plugin).openWithCallback(url => {
										this.plugin.saveSettings().then(() => {
											this.display();
										})
									});
								})
						});
				});
			}
		
			this.plugin.settings.templateUrls.forEach((value, index) => {
				settingGroup.addSetting(cb => {
					cb.setName(value.name)
						.setDesc(value.url)
						.addExtraButton((button) => {
							button
								.setIcon('trash')
								.setTooltip('Delete item')
								.onClick(async () => {
									this.plugin.settings.templateUrls.splice(index, 1);
									await this.plugin.saveSettings();
									this.display();
								});
						});
				});
			});
			
			new SettingGroup(containerEl)
				.addSetting(cb => {
					cb
						.setName("CSS Snippets & Themes")
						.setDesc("CSS snippets & themes for templates are installed into .obsidian/snippets. You can enable them in Settings > Appearance > CSS Snippets.")
				});
			
			// containerEl.createDiv()
			// 	.createSpan({text: 'CSS snippets for templates are installed into .obsidian/snippets. You can enable them in Settings > Appearance > CSS Snippets.'});
	}
}



class SampleModal extends Modal {
	
	statblockUrl: string = '';
	plugin: IStatblockImporterPlugin;
	private callback?: (url: string) => void;

	constructor(app: App, plugin: IStatblockImporterPlugin) {
		super(app);
		this.plugin = plugin;
	}
	
	openWithCallback(callback: (url: string) => void) {
		this.callback = callback;
		this.open();
	}
	
	onOpen() {
		const { contentEl } = this;
		this.setTitle("Install Statblock Template");

		new Setting(contentEl)
			.setName("Statblock template GitHub repo URL")
			.setDesc("Paste the url to the GitHub repository or the specific release containing the statblock template")
			.setClass("statblock-template-import-url-input")
			.addText((text) =>
				text
					.setPlaceholder("https://github.com/username/repo")
					.setValue(this.statblockUrl)
					.onChange((value) => {
						this.statblockUrl = value;
					})
			);
		
		new Setting(contentEl)
			.addButton(button => {
				button
					.setButtonText("Cancel")
					.onClick(() => {
						this.close();
					});
			})
			.addButton(button => {
				button
					.setButtonText("Install")
					.setCta()
					.onClick(async () => {
						if (this.statblockUrl) {
							if (this.plugin.settings.templateUrls.some((template) => template.url === this.statblockUrl)) {
								new Notice("Template already installed.");
								return;
							}
							
							if (await this.plugin.installTemplate(this.statblockUrl)) {
								this.callback?.(this.statblockUrl);
								this.close();
							}
						} else {
							new Notice("Please enter a valid GitHub repository URL.");
						}
					});
			})
			
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
