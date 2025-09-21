import { getTranslation  } from "./translations.js";
import nunjucks from "nunjucks";

/**
 * Welcome screen template with alignment options
 * Supports left, center (default), and right alignment
 */
const welcomeScreenTemplate = `
<div
	class="fmd-slide fmd-first-slide fmd-welcome-slide"
	data-fmd-page-progress="0%"
>
	<div class="fmd-grid" style="text-align: {{ alignment }};">
		<div class="fmd-welcome-content">
			{% if title %}
			<h1 class="fmd-welcome-title fmd-form-question">
				{{ title | safe }}
			</h1>
			{% endif %}
			
			{% if content %}
			<div class="fmd-welcome-description fmd-form-description">
				{{ content | safe }}
			</div>
			{% endif %}
		</div>
		
		{% if buttonText %}
		<div class="fmd-next-controls fmd-d-flex" style="justify-content: {% if alignment == 'left' %}flex-start{% elif alignment == 'right' %}flex-end{% else %}center{% endif %};">
			<button type="button" class="fmd-welcome-btn fmd-btn fmd-btn-accent fmd-d-flex fmd-align-items-center fmd-justify-content-center">
				{{ buttonText }}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="fmd-icon fmd-ms-2 fmd-hide-rtl" aria-hidden="true" focusable="false"><path d="M273 239c9.4 9.4 9.4 24.6 0 33.9L113 433c9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l143-143L79 113c9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L273 239z"/></svg>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="fmd-icon fmd-ms-2 fmd-hide-ltr" aria-hidden="true" focusable="false"><path d="M47 239c9.4 9.4 9.4 24.6 0 33.9L207 433c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L97.9 256 241 113c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L47 239z"/></svg>
			</button>
		</div>
		{% endif %}
	</div>
</div>
`;

/**
 * Create a welcome screen slide
 *
 * @param {Object} config - Welcome screen configuration
 * @param {string} config.title - Welcome screen title
 * @param {string} config.content - Welcome screen content/description
 * @param {string} config.buttonText - CTA button text
 * @param {string} config.alignment - Text alignment: "left", "center", or "right" (default: "center")
 * @param {string} localization - Localization setting
 * @returns {string} Welcome screen HTML
 */
function createWelcomeScreen(config, localization) {
	// Set default alignment to center if not specified
	let alignment = config.alignment || "center";

	// Validate alignment value
	const validAlignments = ["left", "center", "right"];
	if (!validAlignments.includes(alignment)) {
		console.warn(
			`[WELCOME-SCREEN] Invalid alignment "${alignment}". Using "center" instead.`,
		);
		alignment = "center";
	}

	// Use Nunjucks to render the template
	nunjucks.configure({ autoescape: false });
	return nunjucks.renderString(welcomeScreenTemplate, {
		title: config.title || "",
		content: config.content || "",
		buttonText:
			config.buttonText || getTranslation(localization, "start-survey-btn"),
		alignment: alignment,
		translations: {
			startSurveyBtn: getTranslation(localization, "start-survey-btn"),
		},
	});
}

export { createWelcomeScreen,
 };
