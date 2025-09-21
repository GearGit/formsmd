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
export function createEndSlide(config: {
    title: string;
    content: string;
    buttonText: string;
    alignment: string;
    redirectUrl: string;
    redirectDelay: number;
}, localization: string): string;
