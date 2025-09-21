#!/usr/bin/env node

"use strict";

const { getDefaultSettings, parseSettings } = require("../src/settings-parse");
const fs = require("fs-extra");
const { cwd } = require("node:process");
var nunjucks = require("nunjucks");
const path = require("path");
var slugify = require("slugify");
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));

/**
 * Fetch survey data from API
 * @param {string} surveyId - The survey ID
 * @param {string} apiBaseUrl - The API base URL
 * @returns {Promise<Object>} Survey data
 */
async function fetchSurveyData(surveyId, apiBaseUrl) {
	try {
		const fetchModule = await import("node-fetch");

		// Fetch basic survey data (no theme handling in build process)
		const url = `${apiBaseUrl}/api/public/surveys/${surveyId}`;

		const response = await fetchModule.default(url);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();

		if (result.success && result.data) {
			return result.data;
		}

		throw new Error("Invalid survey API response format");
	} catch (error) {
		console.error("❌ Error fetching survey data:", error);
		throw error;
	}
}

// Set up the command line arguments
const argv = require("yargs/yargs")(process.argv.slice(2)).options({
	"input": {
		alias: "i",
		default: "src",
		demandOption: true,
		describe: "Input directory",
		type: "string",
	},
	"output": {
		alias: "o",
		default: "site",
		demandOption: true,
		describe: "Output directory",
		type: "string",
	},
	"static-dir-name": {
		alias: "s",
		default: "static",
		demandOption: true,
		describe: "Static directory name (for images, media files, etc.)",
		type: "string",
	},
	"survey-id": {
		alias: "sid",
		describe: "Survey ID for API-driven rendering",
		type: "string",
	},
	"api-base-url": {
		alias: "api",
		default: "http://localhost:3001",
		describe: "API base URL",
		type: "string",
	},
}).argv;

// Set up the directories
// Make sure to remove any and all leading and trailing forward slashes
const inputDir = `${cwd()}/${argv.input.replace(/^\/+|\/+$/g, "")}`;
const outputDir = `${cwd()}/${argv.output.replace(/^\/+|\/+$/g, "")}`;
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}
if (!fs.existsSync(`${outputDir}/content`)) {
	fs.mkdirSync(`${outputDir}/content`);
}
const staticDirName = argv["static-dir-name"]
	.replace(/^\/+|\/+$/g, "")
	.split("/")[0];

// Set up the base
// Use base if it exists in the input folder, otherwise use the library default
const baseFile = fs.existsSync(`${inputDir}/base.html`)
	? `${inputDir}/base.html`
	: path.join(__dirname, "base.html");
const base = fs.readFileSync(baseFile).toString();

// Main processing function
async function processFiles() {
	try {
		// Check if we're using API-driven rendering
		if (argv["survey-id"]) {
			// Fetch survey data from API
			const surveyData = await fetchSurveyData(
				argv["survey-id"],
				argv["api-base-url"],
			);

			// Convert survey data to FormsMD settings format (basic only)
			const settings = {
				...getDefaultSettings(),
				"id": surveyData.surveyId,
				"title": surveyData.title || "Survey",
				"meta-description": surveyData.description || "",
				"page": "form-slides",
				"slide-delimiter": "---",
				"submit-button-text": "OK",
				"restart-button": "hide",
				"localization": "en",
				"dir": "ltr",
			};

			// Create route name from survey ID
			const route = slugify(argv["survey-id"], {
				lower: true,
				strict: true,
			});

			// Use Nunjucks to create the HTML with survey settings
			const htmlContent = nunjucks.renderString(base, {
				route: route,
				settings: settings,
			});

			// Create API-driven template (no markdown needed)
			const apiTemplate = `
// API-driven survey template
// Survey ID: ${argv["survey-id"]}
// API Base URL: ${argv["api-base-url"]}

const instance = new Formsmd("", document, { isFullPage: true });
instance.initWithConfig({
	surveyId: "${argv["survey-id"]}",
	apiBaseUrl: "${argv["api-base-url"]}",
	isApiDriven: true
});
			`.trim();

			// Create the files in the output directory
			fs.writeFileSync(`${outputDir}/${route}.html`, htmlContent);
			fs.writeFileSync(`${outputDir}/content/${route}.md.js`, apiTemplate);
		} else {
			// Traditional markdown-based rendering

			// Read the input directory
			fs.readdir(inputDir, function (err, files) {
				// Handle error
				if (err) {
					return console.error("Unable to read input directory: " + err);
				}

				// Go through each file to find Markdown ones
				files.forEach(function (file) {
					if (file.endsWith(".md")) {
						try {
							// The route is the slugified file name (with extension)
							const route = slugify(file.substring(0, file.length - 3), {
								lower: true,
								strict: true,
							});
							let template = fs.readFileSync(`${inputDir}/${file}`).toString();

							// Parse settings
							const parsedTemplateAndSettings = parseSettings(template);
							const settings = {
								...getDefaultSettings(),
								...parsedTemplateAndSettings.settings,
							};

							// Use Nunjucks to create the HTML
							const htmlContent = nunjucks.renderString(base, {
								route: route,
								settings: settings,
							});

							// Escape all backticks from template and prepare it for the output
							template = template.replace(/`/g, "\\`");
							template = ["`", template, "`.formsmd();"].join("\n");

							// Create the files in the output directory
							fs.writeFileSync(`${outputDir}/${route}.html`, htmlContent);
							fs.writeFileSync(`${outputDir}/content/${route}.md.js`, template);
						} catch (err) {
							console.error(err);
						}
					}
				});
			});
		}
	} catch (error) {
		console.error("❌ Error processing files:", error);
		process.exit(1);
	}
}

// Execute the main processing function
processFiles()
	.then(() => {
		// Copy the Forms.md CSS and JS files
		try {
			fs.copySync(path.join(__dirname, "..", "dist"), `${outputDir}/formsmd`);
		} catch (err) {
			console.error(err);
		}

		// Copy the static directory if one exists
		if (fs.existsSync(`${inputDir}/${staticDirName}`)) {
			try {
				fs.copySync(
					`${inputDir}/${staticDirName}`,
					`${outputDir}/${staticDirName}`,
				);
			} catch (err) {
				console.error(err);
			}
		}
	})
	.catch((error) => {
		console.error("❌ Build failed:", error);
		process.exit(1);
	});
