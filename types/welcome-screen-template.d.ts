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
export function createWelcomeScreen(config: {
    title: string;
    content: string;
    buttonText: string;
    alignment: string;
}, localization: string): string;
