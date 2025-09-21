import { getTranslation  } from "./translations.js";
import nunjucks from "nunjucks";

/**
 * End slide template with alignment options
 * Supports left, center (default), and right alignment
 * CTA button is optional and can be replaced with redirect functionality
 */
const endSlideTemplate = `
<div
	class="fmd-slide fmd-end-slide"
	data-fmd-page-progress="100%"
>
	<div class="fmd-grid" style="text-align: {{ alignment }};">
		<div class="fmd-end-content">
			{% if title %}
			<h1 class="fmd-end-title fmd-form-question">
				{{ title | safe }}
			</h1>
			{% endif %}
			
			{% if content %}
			<div class="fmd-end-description fmd-form-description">
				{{ content | safe }}
			</div>
			{% endif %}
		</div>
		
		{% if buttonText and not redirectUrl %}
		<div class="fmd-end-controls fmd-d-flex" style="justify-content: {% if alignment == 'left' %}flex-start{% elif alignment == 'right' %}flex-end{% else %}center{% endif %};">
			<button type="button" class="fmd-end-btn fmd-btn fmd-btn-accent fmd-d-flex fmd-align-items-center fmd-justify-content-center">
				{{ buttonText }}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="fmd-icon fmd-ms-2 fmd-hide-rtl" aria-hidden="true" focusable="false"><path d="M273 239c9.4 9.4 9.4 24.6 0 33.9L113 433c9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l143-143L79 113c9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L273 239z"/></svg>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="fmd-icon fmd-ms-2 fmd-hide-ltr" aria-hidden="true" focusable="false"><path d="M47 239c9.4 9.4 9.4 24.6 0 33.9L207 433c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L97.9 256 241 113c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L47 239z"/></svg>
			</button>
		</div>
		{% endif %}
		
		{% if redirectUrl %}
		<div class="fmd-end-redirect fmd-d-flex" style="justify-content: {% if alignment == 'left' %}flex-start{% elif alignment == 'right' %}flex-end{% else %}center{% endif %};">
			<div class="fmd-end-redirect-message">
				{{ redirectMessage | safe }}
			</div>
		</div>
		{% endif %}
	</div>
</div>
`;

/**
 * Create an end slide
 *
 * @param {Object} config - End slide configuration
 * @param {string} config.title - End slide title
 * @param {string} config.content - End slide content/description
 * @param {string} config.buttonText - CTA button text (optional if redirectUrl is provided)
 * @param {string} config.alignment - Text alignment: "left", "center", or "right" (default: "center")
 * @param {string} config.redirectUrl - Optional redirect URL (if provided, button is hidden)
 * @param {number} config.redirectDelay - Redirect delay in milliseconds (default: 3000)
 * @param {string} localization - Localization setting
 * @returns {string} End slide HTML
 */
function createEndSlide(config, localization) {
	// Set default alignment to center if not specified
	let alignment = config.alignment || "center";

	// Validate alignment value
	const validAlignments = ["left", "center", "right"];
	if (!validAlignments.includes(alignment)) {
		console.warn(
			`[END-SLIDE] Invalid alignment "${alignment}". Using "center" instead.`,
		);
		alignment = "center";
	}

	// Determine button text - use config buttonText, fallback to default, or empty if redirect
	let buttonText = "";
	let redirectUrl = "";
	let redirectMessage = "";

	if (config.redirectUrl) {
		redirectUrl = config.redirectUrl;
		const delay = config.redirectDelay || 3000;
		redirectMessage =
			getTranslation(localization, "redirecting-message") ||
			`Redirecting in ${delay / 1000} seconds...`;
	} else {
		buttonText =
			config.buttonText ||
			getTranslation(localization, "create-survey-btn") ||
			"Create a Survey";
	}

	// Use Nunjucks to render the template
	nunjucks.configure({ autoescape: false });
	return nunjucks.renderString(endSlideTemplate, {
		title: config.title || getTranslation(localization, "form-submitted-title"),
		content:
			config.content || getTranslation(localization, "form-submitted-subtitle"),
		buttonText: buttonText,
		alignment: alignment,
		redirectUrl: redirectUrl,
		redirectMessage: redirectMessage,
		translations: {
			createSurveyBtn:
				getTranslation(localization, "create-survey-btn") || "Create a Survey",
		},
	});
}

export { createEndSlide,
 };
