import {StatblockTemplateImporterSettings} from "./settings";
import {
	Plugin,
} from "obsidian";
export interface IStatblockImporterPlugin extends Plugin {
	settings: StatblockTemplateImporterSettings;
	installTemplate(templateUrl: string): Promise<boolean>;
	saveSettings(): Promise<void>;
	installUpdates(): Promise<void>;
}
