/*!
 * Forms.md
 * @author Tahmid Khan Nafee <tahmid.hm.dev@gmail.com>
 * @license BUSL-1.1
 * Copyright (c) 2024 Tahmid Khan Nafee
 */

import { parseDataBlocks } from "./data-blocks-parse.js";
import { isNumeric } from "./helpers.js";
import { renderer } from "./marked-renderer.js";
import { getDefaultSettings, parseSettings } from "./settings-parse.js";
import { parseSpreadsheetData } from "./spreadsheet-data-parse.js";
import {
	createStyles,
	madeInLoaderTemplate,
	createBodyTemplate,
	createContentTemplate,
} from "./templates-create.js";
import { getTranslation } from "./translations.js";
import { renderSlideFromDefinition } from "./slides-parse.js";
import { createWelcomeScreen } from "./welcome-screen-template.js";
import createDOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import { marked } from "marked";
import nunjucks from "nunjucks";

class Formsmd {
	options = {
		colorScheme: "light",
		errorFieldKey: "field",
		errorMessageKey: "message",
		footer: "",
		formsmdBranding: "",
		getHeaders: {},
		isFullPage: false,
		paddingInlineBottom: 20,
		paddingInlineHorizontal: 0,
		paddingInlineTop: 20,
		pageProgress: "",
		postData: {},
		postHeaders: {},
		prioritizeURLFormData: false,
		recaptcha: {
			siteKey: "",
			action: "submit",
			badgePosition: "bottomleft",
			hideBadge: false,
		},
		sanitize: true,
		saveState: true,
		sendFilesAsBase64: false,
		setColorSchemeAttrsAgain: true,
		slideControls: "",
		startSlide: 0,
		themeDark: {
			accent: "rgb(138, 180, 248)",
			accentForeground: "rgb(0, 0, 0)",
			backgroundColor: "rgb(20, 20, 20)",
			color: "rgb(240, 240, 240)",
		},
		themeLight: {
			accent: "rgb(30, 55, 153)",
			accentForeground: "rgb(255, 255, 255)",
			backgroundColor: "rgb(255, 255, 255)",
			color: "rgb(0, 0, 0)",
		},
	};

	/**
	 * Google reCAPTCHA attributes.
	 *
	 * @typedef {Object} RecaptchaType
	 * @property {string} [siteKey] Google reCAPTCHA site key.
	 * @property {string} [action] The action name. Default is `"submit"`.
	 * @property {"bottomleft"|"bottomright"|"inline"} [badgePosition] The position of the reCAPTCHA badge. Default is `"bottomleft"`.
	 * @property {boolean} [hideBadge] Whether to hide the reCAPTCHA badge. Default is `false`.
	 */

	/**
	 * Theme for the page or form.
	 *
	 * @typedef {Object} ThemeType
	 * @property {string} [accent] The primary color (must be HTML name, hex code, or RGB) used on buttons, form fields, etc.
	 * @property {string} [accentForeground] The text color (must be HTML name, hex code, or RGB) used on `accent` background, for example, the text on buttons.
	 * @property {string} [backgroundColor] The `background-color` of the page (must be HTML name, hex code, or RGB).
	 * @property {string} [color] The `color` of the text on the page (must be HTML name, hex code, or RGB).
	 */

	/**
	 * Options for the page or form.
	 *
	 * @typedef {Object} OptionsType
	 * @property {"light"|"dark"} [colorScheme] The default or initial color scheme of the page. Default is `"light"`.
	 * @property {string} [errorFieldKey] The key used to identify the field in error objects. Default is `"field"`.
	 * @property {string} [errorMessageKey] The key used to identify the error message in error objects. Default is `"message"`.
	 * @property {"hide"|"show"} [footer] Controls visibility of the footer.
	 * @property {"hide"|"show"} [formsmdBranding] Controls visibility of the Forms.md branding.
	 * @property {Object} [getHeaders] Headers for GET requests.
	 * @property {boolean} [isFullPage] Whether to render in full page mode. Default is `false`.
	 * @property {number} [paddingInlineBottom] Padding bottom for inline pages or forms. Default is `20`.
	 * @property {number} [paddingInlineHorizontal] Horizontal padding for inline pages or forms. Default is `0`.
	 * @property {number} [paddingInlineTop] Padding top for inline pages or forms. Default is `20`.
	 * @property {"hide"|"show"|"decorative"} [pageProgress] Controls visibility and function of the page progress.
	 * @property {Object} [postData] Extra data sent with POST requests.
	 * @property {Object} [postHeaders] Headers for POST requests.
	 * @property {boolean} [prioritizeURLFormData] Whether to prioritize URL form data. Default is `false`.
	 * @property {RecaptchaType} [recaptcha] The Google reCAPTCHA attributes.
	 * @property {boolean} [sanitize] Whether to sanitize template. Default is `true`.
	 * @property {boolean} [saveState] Whether to save form data in local storage. Default is `true`.
	 * @property {boolean} [sendFilesAsBase64] Whether to send files as base64. Default is `false`.
	 * @property {boolean} [setColorSchemeAttrsAgain] Whether to set color scheme attributes again.
	 * @property {"hide"|"show"} [slideControls] Controls visibility of next and previous buttons.
	 * @property {number} [startSlide] The index of the first slide to make active. Default is `0`.
	 * @property {ThemeType} [themeDark] Dark theme.
	 * @property {ThemeType} [themeLight] Light theme.
	 */

	/**
	 * Create an instance of the class.
	 *
	 * @param {string} template
	 * @param {Document|HTMLElement|Element} container
	 * @param {OptionsType} options
	 */
	constructor(template, container, options) {
		this.container = container;

		// Set the options for use
		if (options) {
			// Color Scheme
			if (options.colorScheme === "light" || options.colorScheme === "dark") {
				this.options.colorScheme = options.colorScheme;
			}
			// Error field key
			if (
				options.errorFieldKey !== undefined &&
				typeof options.errorFieldKey === "string"
			) {
				this.options.errorFieldKey = options.errorFieldKey;
			}
			// Error message key
			if (
				options.errorMessageKey !== undefined &&
				typeof options.errorMessageKey === "string"
			) {
				this.options.errorMessageKey = options.errorMessageKey;
			}
			// Footer
			if (options.footer === "hide" || options.footer === "show") {
				this.options.footer = options.footer;
			}
			// Forms.md branding
			if (
				options.formsmdBranding === "hide" ||
				options.formsmdBranding === "show"
			) {
				this.options.formsmdBranding = options.formsmdBranding;
			}
			// GET headers
			if (
				options.getHeaders !== undefined &&
				typeof options.getHeaders === "object"
			) {
				this.options.getHeaders = {
					...this.options.getHeaders,
					...options.getHeaders,
				};
			}
			// Is full page
			if (
				options.isFullPage !== undefined &&
				typeof options.isFullPage === "boolean"
			) {
				this.options.isFullPage = options.isFullPage;
			}
			// Padding inline bottom
			if (
				options.paddingInlineBottom !== undefined &&
				typeof options.paddingInlineBottom === "number"
			) {
				this.options.paddingInlineBottom = options.paddingInlineBottom;
			}
			// Padding inline horizontal
			if (
				options.paddingInlineHorizontal !== undefined &&
				typeof options.paddingInlineHorizontal === "number"
			) {
				this.options.paddingInlineHorizontal = options.paddingInlineHorizontal;
			}
			// Padding inline top
			if (
				options.paddingInlineTop !== undefined &&
				typeof options.paddingInlineTop === "number"
			) {
				this.options.paddingInlineTop = options.paddingInlineTop;
			}
			// Page progress
			if (
				options.pageProgress === "hide" ||
				options.pageProgress === "show" ||
				options.pageProgress === "decorative"
			) {
				this.options.pageProgress = options.pageProgress;
			}
			// POST data
			if (
				options.postData !== undefined &&
				typeof options.postData === "object"
			) {
				this.options.postData = {
					...this.options.postData,
					...options.postData,
				};
			}
			// POST headers
			if (
				options.postHeaders !== undefined &&
				typeof options.postHeaders === "object"
			) {
				this.options.postHeaders = {
					...this.options.postHeaders,
					...options.postHeaders,
				};
			}
			// Prioritize form data from URLs
			if (
				options.prioritizeURLFormData !== undefined &&
				typeof options.prioritizeURLFormData === "boolean"
			) {
				this.options.prioritizeURLFormData = options.prioritizeURLFormData;
			}
			// Google reCAPTCHA
			if (
				options.recaptcha !== undefined &&
				typeof options.recaptcha === "object"
			) {
				if (
					options.recaptcha.siteKey !== undefined &&
					typeof options.recaptcha.siteKey === "string"
				) {
					this.options.recaptcha.siteKey = options.recaptcha.siteKey;
				}
				if (
					options.recaptcha.action !== undefined &&
					typeof options.recaptcha.action === "string"
				) {
					this.options.recaptcha.action = options.recaptcha.action;
				}
				if (
					options.recaptcha.badgePosition !== undefined &&
					typeof options.recaptcha.badgePosition === "string"
				) {
					this.options.recaptcha.badgePosition =
						options.recaptcha.badgePosition;
				}
				if (
					options.recaptcha.hideBadge !== undefined &&
					typeof options.recaptcha.hideBadge === "boolean"
				) {
					this.options.recaptcha.hideBadge = options.recaptcha.hideBadge;
				}
			}
			// Sanitize
			if (
				options.sanitize !== undefined &&
				typeof options.sanitize === "boolean"
			) {
				this.options.sanitize = options.sanitize;
			}
			// Save state
			if (
				options.saveState !== undefined &&
				typeof options.saveState === "boolean"
			) {
				this.options.saveState = options.saveState;
			}
			// Send files as base64
			if (
				options.sendFilesAsBase64 !== undefined &&
				typeof options.sendFilesAsBase64 === "boolean"
			) {
				this.options.sendFilesAsBase64 = options.sendFilesAsBase64;
			}
			// Set color scheme attributes again
			if (
				options.setColorSchemeAttrsAgain !== undefined &&
				typeof options.setColorSchemeAttrsAgain === "boolean"
			) {
				this.options.setColorSchemeAttrsAgain =
					options.setColorSchemeAttrsAgain;
			} else if (!this.options.isFullPage) {
				this.options.setColorSchemeAttrsAgain = false;
			}
			// Slide controls
			if (
				options.slideControls === "hide" ||
				options.slideControls === "show"
			) {
				this.options.slideControls = options.slideControls;
			}
			// Start slide
			if (
				options.startSlide !== undefined &&
				typeof options.startSlide === "number"
			) {
				this.options.startSlide = options.startSlide;
			}
			// Theme dark
			if (
				options.themeDark !== undefined &&
				typeof options.themeDark === "object"
			) {
				if (
					options.themeDark.accent !== undefined &&
					typeof options.themeDark.accent === "string"
				) {
					this.options.themeDark.accent = options.themeDark.accent;
				}
				if (
					options.themeDark.accentForeground !== undefined &&
					typeof options.themeDark.accentForeground === "string"
				) {
					this.options.themeDark.accentForeground =
						options.themeDark.accentForeground;
				}
				if (
					options.themeDark.backgroundColor !== undefined &&
					typeof options.themeDark.backgroundColor === "string"
				) {
					this.options.themeDark.backgroundColor =
						options.themeDark.backgroundColor;
				}
				if (
					options.themeDark.color !== undefined &&
					typeof options.themeDark.color === "string"
				) {
					this.options.themeDark.color = options.themeDark.color;
				}
			}
			// Theme light
			if (
				options.themeLight !== undefined &&
				typeof options.themeLight === "object"
			) {
				if (
					options.themeLight.accent !== undefined &&
					typeof options.themeLight.accent === "string"
				) {
					this.options.themeLight.accent = options.themeLight.accent;
				}
				if (
					options.themeLight.accentForeground !== undefined &&
					typeof options.themeLight.accentForeground === "string"
				) {
					this.options.themeLight.accentForeground =
						options.themeLight.accentForeground;
				}
				if (
					options.themeLight.backgroundColor !== undefined &&
					typeof options.themeLight.backgroundColor === "string"
				) {
					this.options.themeLight.backgroundColor =
						options.themeLight.backgroundColor;
				}
				if (
					options.themeLight.color !== undefined &&
					typeof options.themeLight.color === "string"
				) {
					this.options.themeLight.color = options.themeLight.color;
				}
			}
		}

		// Set up the settings from the options
		const templateSettingsFromOptions = [];

		let colorScheme = this.options.colorScheme;
		const templateContainsColorScheme = template.match(
			/#!\s*color-scheme\s*=\s*(light|dark)/,
		);
		if (templateContainsColorScheme) {
			colorScheme = templateContainsColorScheme[1];
		} else {
			templateSettingsFromOptions.push(`#! color-scheme = ${colorScheme}`);
		}

		let theme = this.options.themeLight;
		let themeAltScheme = this.options.themeDark;
		if (colorScheme === "dark") {
			theme = this.options.themeDark;
			themeAltScheme = this.options.themeLight;
		}
		templateSettingsFromOptions.push(
			`#! accent = ${theme.accent} || ${themeAltScheme.accent}`,
		);
		templateSettingsFromOptions.push(
			`#! accent-foreground = ${theme.accentForeground} || ${themeAltScheme.accentForeground}`,
		);
		templateSettingsFromOptions.push(
			`#! background-color = ${theme.backgroundColor} || ${themeAltScheme.backgroundColor}`,
		);
		templateSettingsFromOptions.push(
			`#! color = ${theme.color} || ${themeAltScheme.color}`,
		);

		if (this.options.formsmdBranding !== undefined) {
			templateSettingsFromOptions.push(
				`#! formsmd-branding = ${this.options.formsmdBranding}`,
			);
		}
		if (this.options.footer !== undefined) {
			templateSettingsFromOptions.push(`#! footer = ${this.options.footer}`);
		}
		if (this.options.pageProgress !== undefined) {
			templateSettingsFromOptions.push(
				`#! page-progress = ${this.options.pageProgress}`,
			);
		}
		if (this.options.slideControls !== undefined) {
			templateSettingsFromOptions.push(
				`#! slide-controls = ${this.options.slideControls}`,
			);
		}

		// Set the template
		this._template = `${templateSettingsFromOptions.join("\n")}\n\n${template}`;
	}

	/**
	 * Set the state to defaults.
	 */
	setStateToDefaults = () => {
		const instance = this;

		instance.state = {
			bindDivTemplates: {},
			data: {},
			fieldTypes: {},
			formData: {},
			settings: getDefaultSettings(),
			slideData: {
				currentIndex: 0,
				slideDefinitions: [],
				endSlideDefinition: "",
				availableSlides: 1,
			},
			// NEW: Lifecycle management state
			lifecycle: {
				questionCache: new Map(), // questionId -> {questionData, slideDefinition, slideElement}
				questionPath: [], // Array of questionIds in order
				userResponses: new Map(), // questionId -> responseData
				currentQuestionIndex: -1,
				currentQuestion: null,
				currentSlideType: "question", // 'welcome', 'question', 'end'
			},
			// NEW: Survey configuration state
			surveyConfig: {
				welcomeScreen: null,
				endScreen: null,
			},
		};
	};

	/**
	 * Add a single attribute value to an HTML element.
	 *
	 * @param {HTMLElement} elem
	 * @param {string} name
	 * @param {string} value
	 */
	setSingleAttribute = (elem, name, value) => {
		const attrs = elem.getAttribute(name) || "";
		const attrsArr = attrs
			.replace(/\s\s+/g, " ")
			.split(" ")
			.filter(function (v) {
				return v !== "";
			});
		attrsArr.push(value);
		elem.setAttribute(name, attrsArr.join(" "));
	};

	/**
	 * Remove a single attribute value from an HTML element.
	 *
	 * @param {HTMLElement} elem
	 * @param {string} name
	 * @param {string} value
	 */
	removeSingleAttribute = (elem, name, value) => {
		const attrs = elem.getAttribute(name) || "";
		const attrsArr = attrs
			.replace(/\s\s+/g, " ")
			.split(" ")
			.filter(function (v) {
				return v !== "";
			});
		const index = attrsArr.indexOf(value);
		if (index > -1) {
			attrsArr.splice(index, 1);
		}
		if (attrsArr.length > 0) {
			elem.setAttribute(name, attrsArr.join(" "));
		} else {
			elem.removeAttribute(name);
		}
	};

	/**
	 * Get the prefix for the page/form id.
	 *
	 * @returns {string}
	 */
	getIdPrefix = () => {
		const instance = this;

		return instance.state.settings.id !== ""
			? `${instance.state.settings.id}:`
			: "";
	};

	/**
	 * Set the preferred color scheme (if one is found in the local storage).
	 * Depending on the preference from settings, either the domain-wide or the
	 * page-specific value is used.
	 */
	setPreferredColorScheme = () => {
		const instance = this;

		const rootElem = instance.container.querySelector(".fmd-root");
		const localStorageKey =
			rootElem.getAttribute("data-fmd-color-scheme-scope") === "isolate"
				? `formsmd:${instance.getIdPrefix()}${window.location.hostname}${
						window.location.pathname
					}color-scheme`
				: "formsmd:color-scheme";
		const preferredColorScheme = localStorage.getItem(localStorageKey);
		if (preferredColorScheme) {
			rootElem.setAttribute("data-fmd-color-scheme", preferredColorScheme);
		}
	};

	/**
	 * Toggle color scheme. If the preferred color scheme (from settings) is set
	 * to "isolate", the preference is saved (and used) only for that page.
	 * Otherwise, it is saved (and used) domain-wide.
	 *
	 * @param {MouseEvent} e
	 */
	toggleColorScheme = (e) => {
		const instance = this;

		e.preventDefault();
		const rootElem = instance.container.querySelector(".fmd-root");
		const localStorageKey =
			instance.state.settings["color-scheme-scope"] === "isolate"
				? `formsmd:${instance.getIdPrefix()}${window.location.hostname}${
						window.location.pathname
					}color-scheme`
				: "formsmd:color-scheme";
		const currentColorScheme = rootElem.getAttribute("data-fmd-color-scheme");
		if (currentColorScheme === "light") {
			rootElem.setAttribute("data-fmd-color-scheme", "dark");
			localStorage.setItem(localStorageKey, "dark");
		} else if (currentColorScheme === "dark") {
			rootElem.setAttribute("data-fmd-color-scheme", "light");
			localStorage.setItem(localStorageKey, "light");
		}
	};

	/**
	 * Create a random 32 characters id separated by dashes.
	 *
	 * @returns {string}
	 */
	createRandomId = () => {
		const characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let id = "";
		for (let i = 0; i < 32; i++) {
			id += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
	};

	/**
	 * Get or create response id. This uniquely identifies one single form
	 * response. The id is created on initialization (unless one already
	 * exists), and it is removed when the user reaches the end slide.
	 *
	 * @returns {string}
	 */
	getOrCreateResponseId = () => {
		const instance = this;

		const localStorageKey = `formsmd:${instance.getIdPrefix()}${
			window.location.hostname
		}${window.location.pathname}response-id`;
		let responseId = localStorage.getItem(localStorageKey);
		if (!responseId) {
			responseId = instance.createRandomId();
			localStorage.setItem(localStorageKey, responseId);
		}
		return responseId;
	};

	/**
	 * Remove response id. This is called when the user reaches the end slide.
	 */
	removeResponseId = () => {
		const instance = this;

		const localStorageKey = `formsmd:${instance.getIdPrefix()}${
			window.location.hostname
		}${window.location.pathname}response-id`;
		localStorage.removeItem(localStorageKey);
	};

	/**
	 * Save form field value in local storage.
	 *
	 * @param {string} name
	 * @param {*} value
	 */
	saveFieldValue = (name, value) => {
		const instance = this;

		const localStorageKey = `formsmd:${instance.getIdPrefix()}${
			window.location.hostname
		}${window.location.pathname}form-data`;
		let savedFormData = localStorage.getItem(localStorageKey) || "{}";
		savedFormData = JSON.parse(savedFormData);
		savedFormData[name] = value;
		localStorage.setItem(localStorageKey, JSON.stringify(savedFormData));
	};

	/**
	 * Remove form data from local storage. This is called when the user reaches
	 * the end slide.
	 */
	removeSavedFormData = () => {
		const instance = this;

		const localStorageKey = `formsmd:${instance.getIdPrefix()}${
			window.location.hostname
		}${window.location.pathname}form-data`;
		localStorage.removeItem(localStorageKey);
	};

	/**
	 * Re-render the bind <div> and <span> elements.
	 *
	 * @param {string} name
	 */
	reRenderBindElems = (name) => {
		const instance = this;

		// Re-render the bind <div> elements
		instance.container
			.querySelectorAll(`div[data-fmd-bind-${name}]`)
			.forEach((div) => {
				const template =
					instance.state.bindDivTemplates[
						div.getAttribute("data-fmd-bind-template-ref")
					];
				marked.use({
					renderer: renderer,
					markedSettings: {
						"css-prefix": instance.state.settings["css-prefix"],
						"form-delimiter": instance.state.settings["form-delimiter"],
						"id": instance.state.settings.id,
						"localization": instance.state.settings.localization,
					},
				});
				let parsedTemplate = marked.parse(
					nunjucks.renderString(template, {
						...instance.state.data,
						...instance.state.formData,
					}),
				);
				if (instance.options.sanitize) {
					const DOMPurify = createDOMPurify(window);
					parsedTemplate = DOMPurify.sanitize(parsedTemplate);
				}
				div.innerHTML = parsedTemplate;

				// Highlight code blocks again
				div.querySelectorAll("pre code").forEach((codeBlock) => {
					hljs.highlightElement(codeBlock);
				});

				// Add event listeners again
				instance.addEventListeners(div, false);
			});

		// Re-render the bind <span> elements
		instance.container
			.querySelectorAll(`span[data-fmd-bind-${name}]`)
			.forEach((span) => {
				span.innerText = instance.state.formData[name];
			});
	};

	/**
	 * Get value of a set of radio buttons or checkboxes.
	 *
	 * @param {string} name
	 * @param {string} inputClass
	 * @param {"radio"|"checkbox"} type
	 * @returns {string|Array.<string>}
	 */
	getRadioCheckboxValue = (name, inputClass, type) => {
		const instance = this;

		// For radio buttons, the single checked value is returned
		if (type === "radio") {
			let value = "";
			const input = instance.container.querySelector(
				`.${inputClass}[type="radio"][name="${name}"]:checked`,
			);
			if (input) {
				value = input.value;
			}
			return value;
		}
		// For checkboxes, an array of checked values is returned
		else if (type === "checkbox") {
			const value = [];
			instance.container
				.querySelectorAll(
					`.${inputClass}[type="checkbox"][name="${name}"]:checked`,
				)
				.forEach((input) => {
					value.push(input.value);
				});
			return value;
		}
	};

	/**
	 * Set value of a set of radio buttons or checkboxes.
	 *
	 * @param {string} name
	 * @param {string} inputClass
	 * @param {"radio"|"checkbox"} type
	 * @param {string|Array.<string>} value
	 */
	setRadioCheckboxValue = (name, inputClass, type, value) => {
		const instance = this;

		// For radio buttons, the value is a single string
		if (type === "radio") {
			if (typeof value === "string") {
				value = value.trim();
			}
			const input = instance.container.querySelector(
				`.${inputClass}[type="radio"][name="${name}"][value="${value}"]`,
			);
			if (input) {
				input.checked = true;
			}
		}
		// For checkboxes, the value is an array of strings
		else if (type === "checkbox") {
			const values = {};
			for (const item of value) {
				values[item.trim()] = true;
			}
			instance.container
				.querySelectorAll(`.${inputClass}[type="checkbox"][name="${name}"]`)
				.forEach((input) => {
					input.checked = false;
					if (values[input.value]) {
						input.checked = true;
					}
				});
		}
	};

	/**
	 * Given a country calling code <select>, update placeholder of the
	 * corresponding telephone input using the selected <option>.
	 *
	 * @param {HTMLSelectElement} countryCodeSelect
	 */
	setTelInputPlaceholder = (countryCodeSelect) => {
		const telInput = countryCodeSelect
			.closest(".fmd-form-field")
			.querySelector('.fmd-form-str-input[type="tel"]');
		const selected = countryCodeSelect.selectedOptions[0];
		if (telInput && selected) {
			telInput.setAttribute(
				"placeholder",
				selected.getAttribute("data-fmd-placeholder"),
			);
		}
	};

	/**
	 * Set form data to state (value and type). Also re-render the bind <div>
	 * and <span> elements.
	 */
	setFormDataToState = () => {
		const instance = this;

		// Text fields
		instance.container
			.querySelectorAll(
				'input.fmd-form-str-input[type="text"], input.fmd-form-str-input[type="email"], input.fmd-form-str-input[type="url"], input.fmd-form-str-input[type="tel"], textarea.fmd-form-str-input',
			)
			.forEach((elem) => {
				let name = elem.getAttribute("name");
				const value = elem.value;
				const type = elem.getAttribute("type") || "text";
				instance.state.formData[name] = value;
				instance.state.fieldTypes[name] = type;
				instance.reRenderBindElems(name);
			});

		// Number fields
		instance.container
			.querySelectorAll('input.fmd-form-num-input[type="number"]')
			.forEach((elem) => {
				const name = elem.getAttribute("name");
				const value = isNumeric(elem.value) ? Number(elem.value) : null;
				instance.state.formData[name] = value;
				instance.state.fieldTypes[name] = "number";
				instance.reRenderBindElems(name);
			});

		// Select fields
		instance.container
			.querySelectorAll("select.fmd-form-str-select")
			.forEach((elem) => {
				const name = elem.getAttribute("name");
				const value = elem.value;
				instance.state.formData[name] = value;
				instance.state.fieldTypes[name] = "select";
				instance.reRenderBindElems(name);
			});

		// Choice fields
		instance.container
			.querySelectorAll(
				".fmd-form-check:first-child input.fmd-form-str-check-input",
			)
			.forEach((elem) => {
				const name = elem.getAttribute("name");
				const type = elem.getAttribute("type");
				const value = instance.getRadioCheckboxValue(
					name,
					"fmd-form-str-check-input",
					type,
				);
				instance.state.formData[name] = value;
				instance.state.fieldTypes[name] = "choice";
				instance.reRenderBindElems(name);
			});

		// Number choice fields
		instance.container
			.querySelectorAll("input.fmd-form-num-check-input:first-child")
			.forEach((elem) => {
				const name = elem.getAttribute("name");
				let value = instance.getRadioCheckboxValue(
					name,
					"fmd-form-num-check-input",
					"radio",
				);
				value = value ? parseInt(value) : null;
				instance.state.formData[name] = value;
				instance.state.fieldTypes[name] = "num-choice";
				instance.reRenderBindElems(name);
			});

		// Datetime fields
		instance.container
			.querySelectorAll(
				'input.fmd-form-datetime-input[type="datetime-local"], input.fmd-form-datetime-input[type="date"], input.fmd-form-datetime-input[type="time"]',
			)
			.forEach((elem) => {
				let name = elem.getAttribute("name");
				const value = elem.value;
				const type = elem.getAttribute("type");
				instance.state.formData[name] = value;
				instance.state.fieldTypes[name] = type;
				instance.reRenderBindElems(name);
			});
	};

	/**
	 * Set form data from URL parameters: set value in the DOM, update state,
	 * conditionally update local storage, and re-render the bind <div> and
	 * <span> elements. The local storage is updated if this function is called
	 * AFTER setting the saved form data (in local storage).
	 *
	 * @param {boolean} updateLocalStorage
	 */
	setFormDataFromURL = (updateLocalStorage) => {
		const instance = this;

		const urlParams = new URLSearchParams(window.location.search);
		for (const urlParam of urlParams) {
			let name = urlParam[0];
			let value = urlParam[1];

			// Make sure URL parameters are id-scoped
			if (instance.state.settings.id !== "") {
				if (name.startsWith(`${instance.state.settings.id}:`)) {
					name = name.replace(`${instance.state.settings.id}:`, "");
				} else {
					continue;
				}
			}

			// Text field
			if (
				instance.state.fieldTypes[name] === "text" ||
				instance.state.fieldTypes[name] === "email" ||
				instance.state.fieldTypes[name] === "url" ||
				instance.state.fieldTypes[name] === "tel"
			) {
				const input = instance.container.querySelector(
					`.fmd-form-str-input[name="${name}"]`,
				);
				if (input) {
					input.value = value;
					instance.state.formData[name] = value;
					if (updateLocalStorage && instance.options.saveState) {
						instance.saveFieldValue(name, value);
					}
					instance.reRenderBindElems(name);
				}
			}

			// Number field
			if (instance.state.fieldTypes[name] === "number") {
				const input = instance.container.querySelector(
					`.fmd-form-num-input[name="${name}"]`,
				);
				if (input && isNumeric(value)) {
					value = Number(value);
					input.value = value;
					instance.state.formData[name] = value;
					if (updateLocalStorage && instance.options.saveState) {
						instance.saveFieldValue(name, value);
					}
					instance.reRenderBindElems(name);
				}
			}

			// Select field
			if (instance.state.fieldTypes[name] === "select") {
				const select = instance.container.querySelector(
					`.fmd-form-str-select[name="${name}"]`,
				);
				if (select) {
					const options = select.querySelectorAll("option");
					for (const option of options) {
						if (option.getAttribute("value") === value) {
							select.value = value;
							instance.state.formData[name] = value;
							if (updateLocalStorage && instance.options.saveState) {
								instance.saveFieldValue(name, value);
							}
							instance.reRenderBindElems(name);
							break;
						}
					}
					if (select.classList.contains("fmd-form-countrycode-select")) {
						instance.setTelInputPlaceholder(select);
					}
				}
			}

			// Choice field
			if (instance.state.fieldTypes[name] === "choice") {
				const input = instance.container.querySelector(
					`.fmd-form-str-check-input[name="${name}"]`,
				);
				if (input) {
					const type = input.getAttribute("type");

					// Set value, for checkbox, convert to array first
					if (type === "checkbox") {
						value = value.split(",");
					}
					instance.setRadioCheckboxValue(
						name,
						"fmd-form-str-check-input",
						type,
						value,
					);

					// Get value again, set to state, etc.
					value = instance.getRadioCheckboxValue(
						name,
						"fmd-form-str-check-input",
						type,
					);
					instance.state.formData[name] = value;
					if (updateLocalStorage && instance.options.saveState) {
						instance.saveFieldValue(name, value);
					}
					instance.reRenderBindElems(name);
				}
			}

			// Number choice field
			if (instance.state.fieldTypes[name] === "num-choice") {
				const input = instance.container.querySelector(
					`.fmd-form-num-check-input[name="${name}"]`,
				);
				if (input) {
					instance.setRadioCheckboxValue(
						name,
						"fmd-form-num-check-input",
						"radio",
						value,
					);
					value = instance.getRadioCheckboxValue(
						name,
						"fmd-form-num-check-input",
						"radio",
					);
					value = value ? parseInt(value) : null;
					instance.state.formData[name] = value;
					if (updateLocalStorage && instance.options.saveState) {
						instance.saveFieldValue(name, value);
					}
					instance.reRenderBindElems(name);
				}
			}

			// Datetime field
			if (
				instance.state.fieldTypes[name] === "datetime-local" ||
				instance.state.fieldTypes[name] === "date" ||
				instance.state.fieldTypes[name] === "time"
			) {
				const input = instance.container.querySelector(
					`.fmd-form-datetime-input[name="${name}"]`,
				);
				if (input) {
					input.value = value;
					instance.state.formData[name] = value;
					if (updateLocalStorage && instance.options.saveState) {
						instance.saveFieldValue(name, value);
					}
					instance.reRenderBindElems(name);
				}
			}
		}
	};

	/**
	 * Set form data saved in local storage: set value in the DOM, update state,
	 * and re-render the bind <div> and <span> elements.
	 */
	setSavedFormData = () => {
		const instance = this;

		const localStorageKey = `formsmd:${instance.getIdPrefix()}${
			window.location.hostname
		}${window.location.pathname}form-data`;
		const savedFormData = localStorage.getItem(localStorageKey);
		if (!savedFormData) {
			return;
		}
		for (const [name, value] of Object.entries(JSON.parse(savedFormData))) {
			// Text field
			if (
				instance.state.fieldTypes[name] === "text" ||
				instance.state.fieldTypes[name] === "email" ||
				instance.state.fieldTypes[name] === "url" ||
				instance.state.fieldTypes[name] === "tel"
			) {
				const input = instance.container.querySelector(
					`.fmd-form-str-input[name="${name}"]`,
				);
				if (input) {
					input.value = value;
					instance.state.formData[name] = value;
					instance.reRenderBindElems(name);
				}
			}

			// Number field
			if (instance.state.fieldTypes[name] === "number") {
				const input = instance.container.querySelector(
					`.fmd-form-num-input[name="${name}"]`,
				);
				if (input) {
					input.value = value;
					instance.state.formData[name] = value;
					instance.reRenderBindElems(name);
				}
			}

			// Select field
			if (instance.state.fieldTypes[name] === "select") {
				const select = instance.container.querySelector(
					`.fmd-form-str-select[name="${name}"]`,
				);
				if (select) {
					const options = select.querySelectorAll("option");
					for (const option of options) {
						if (option.getAttribute("value") === value) {
							select.value = value;
							instance.state.formData[name] = value;
							instance.reRenderBindElems(name);
							break;
						}
					}
					if (select.classList.contains("fmd-form-countrycode-select")) {
						instance.setTelInputPlaceholder(select);
					}
				}
			}

			// Choice field
			if (instance.state.fieldTypes[name] === "choice") {
				const input = instance.container.querySelector(
					`.fmd-form-str-check-input[name="${name}"]`,
				);
				if (input) {
					const type = input.getAttribute("type");
					instance.setRadioCheckboxValue(
						name,
						"fmd-form-str-check-input",
						type,
						value,
					);
					instance.state.formData[name] = instance.getRadioCheckboxValue(
						name,
						"fmd-form-str-check-input",
						type,
					);
					instance.reRenderBindElems(name);
				}
			}

			// Number choice field
			if (instance.state.fieldTypes[name] === "num-choice") {
				const input = instance.container.querySelector(
					`.fmd-form-num-check-input[name="${name}"]`,
				);
				if (input) {
					instance.setRadioCheckboxValue(
						name,
						"fmd-form-num-check-input",
						"radio",
						String(value),
					);
					instance.state.formData[name] = instance.getRadioCheckboxValue(
						name,
						"fmd-form-num-check-input",
						"radio",
					);
					instance.reRenderBindElems(name);
				}
			}

			// Datetime field
			if (
				instance.state.fieldTypes[name] === "datetime-local" ||
				instance.state.fieldTypes[name] === "date" ||
				instance.state.fieldTypes[name] === "time"
			) {
				const input = instance.container.querySelector(
					`.fmd-form-datetime-input[name="${name}"]`,
				);
				if (input) {
					input.value = value;
					instance.state.formData[name] = value;
					instance.reRenderBindElems(name);
				}
			}
		}
	};

	/**
	 * Given a form field element, remove all errors (and everything related).
	 *
	 * @param {HTMLElement} formField
	 */
	removeFieldErrors = (formField) => {
		const instance = this;

		// Remove all errors
		formField.querySelectorAll(".fmd-error").forEach((error) => {
			error.remove();
		});

		// Form fields with errors will have a type attribute
		const type = formField.getAttribute("data-fmd-type");

		// Remove WAI-ARIA tags
		// Choice field
		if (type === "radio" || type === "checkbox") {
			formField
				.querySelectorAll(".fmd-form-str-check-input")
				.forEach((input) => {
					input.removeAttribute("aria-invalid");
					input.removeAttribute("aria-describedby");
				});
		}
		// Number choice field
		else if (type === "num-radio") {
			formField
				.querySelectorAll(".fmd-form-num-check-input")
				.forEach((input) => {
					input.removeAttribute("aria-invalid");
					const name = input.getAttribute("name");
					instance.removeSingleAttribute(
						input,
						"aria-describedby",
						`${instance.getIdPrefix()}id_${name}-error`,
					);
				});
		}
		// Datetime field
		else if (type === "datetime-local" || type === "date" || type === "time") {
			formField
				.querySelectorAll(".fmd-form-datetime-input")
				.forEach((input) => {
					input.removeAttribute("aria-invalid");
					input.removeAttribute("aria-describedby");
				});
		}
		// File field
		else if (type === "file") {
			formField.querySelectorAll(".fmd-form-file-input").forEach((input) => {
				input.removeAttribute("aria-invalid");
				input.removeAttribute("aria-describedby");
			});
		}
	};

	/**
	 * Handle the inputs of text form fields: update value in the state, save
	 * value in local storage, remove errors and re-render the bind <div> and
	 * <span> elements.
	 *
	 * @param {InputEvent} e
	 */
	textFieldOnInput = (e) => {
		const instance = this;

		const name = e.target.getAttribute("name");
		const value = e.target.value;
		instance.state.formData[name] = value;
		if (instance.options.saveState) {
			instance.saveFieldValue(name, value);
		}
		instance.removeFieldErrors(e.target.closest(".fmd-form-field"));
		instance.reRenderBindElems(name);
	};

	/**
	 * Handle the inputs of number form fields: update value in the state, save
	 * value in local storage, remove errors and re-render the bind <div> and
	 * <span> elements.
	 *
	 * @param {InputEvent} e
	 */
	numberFieldOnInput = (e) => {
		const instance = this;

		const name = e.target.getAttribute("name");
		const value = isNumeric(e.target.value) ? Number(e.target.value) : null;
		instance.state.formData[name] = value;
		if (instance.options.saveState) {
			instance.saveFieldValue(name, value);
		}
		instance.removeFieldErrors(e.target.closest(".fmd-form-field"));
		instance.reRenderBindElems(name);
	};

	/**
	 * Handle the inputs of select form fields: update value in the state, save
	 * value in local storage, remove errors and re-render the bind <div> and
	 * <span> elements. If the select box is a country calling code select, then
	 * also update the placeholder of the corresponding telephone input.
	 *
	 * @param {InputEvent} e
	 */
	selectFieldOnInput = (e) => {
		const instance = this;

		const name = e.target.getAttribute("name");
		const value = e.target.value;
		instance.state.formData[name] = value;
		if (instance.options.saveState) {
			instance.saveFieldValue(name, value);
		}
		instance.removeFieldErrors(e.target.closest(".fmd-form-field"));
		instance.reRenderBindElems(name);

		// Update placeholder of telephone input if country calling code <select>
		if (e.target.classList.contains("fmd-form-countrycode-select")) {
			instance.setTelInputPlaceholder(e.target);
		}
	};

	/**
	 * Handle the inputs of choice form fields: update value in the state, save
	 * value in local storage, remove errors and re-render the bind <div> and
	 * <span> elements.
	 *
	 * @param {InputEvent} e
	 */
	choiceFieldOnInput = (e) => {
		const instance = this;

		const name = e.target.getAttribute("name");
		const type = e.target.getAttribute("type");
		const value = instance.getRadioCheckboxValue(
			name,
			"fmd-form-str-check-input",
			type,
		);
		instance.state.formData[name] = value;
		if (instance.options.saveState) {
			instance.saveFieldValue(name, value);
		}
		instance.removeFieldErrors(e.target.closest(".fmd-form-field"));
		instance.reRenderBindElems(name);
	};

	/**
	 * Handle the inputs of number choice form fields: update value in the
	 * state, save value in local storage, remove errors and re-render the bind
	 * <div> and <span> elements.
	 *
	 * @param {InputEvent} e
	 */
	numChoiceFieldOnInput = (e) => {
		const instance = this;

		const name = e.target.getAttribute("name");
		const value = parseInt(
			instance.getRadioCheckboxValue(name, "fmd-form-num-check-input", "radio"),
		);
		instance.state.formData[name] = value;
		if (instance.options.saveState) {
			instance.saveFieldValue(name, value);
		}
		instance.removeFieldErrors(e.target.closest(".fmd-form-field"));
		instance.reRenderBindElems(name);
	};

	/**
	 * Handle the inputs of datetime form fields: update value in the state,
	 * save value in local storage, remove errors and re-render the bind <div>
	 * and <span> elements.
	 *
	 * @param {InputEvent} e
	 */
	datetimeFieldOnInput = (e) => {
		const instance = this;

		const name = e.target.getAttribute("name");
		const value = e.target.value;
		instance.state.formData[name] = value;
		if (instance.options.saveState) {
			instance.saveFieldValue(name, value);
		}
		instance.removeFieldErrors(e.target.closest(".fmd-form-field"));
		instance.reRenderBindElems(name);
	};

	/**
	 * Handle the inputs of file form fields: reset and update the wrapping
	 * <label> depending on the file chosen.
	 *
	 * @param {InputEvent} e
	 */
	fileFieldOnInput = (e) => {
		const instance = this;

		// Get the wrapper and inner section
		const label = e.target.closest(".fmd-form-file-label");
		const fileExistsSection = label.querySelector(".fmd-file-exists-section");

		// Reset first
		instance.removeFieldErrors(e.target.closest(".fmd-form-field"));
		label.classList.remove("fmd-file-exists");
		fileExistsSection.innerHTML = "";

		// Get the file and update wrapper depending on type
		const imageFileTypes = [
			"image/apng",
			"image/bmp",
			"image/gif",
			"image/jpeg",
			"image/pjpeg",
			"image/png",
			"image/svg+xml",
			"image/tiff",
			"image/webp",
			"image/x-icon",
		];
		const file = e.target.files[0];
		if (file) {
			// Bug fix where you can drag in a non-image file and have it be accepted
			// This bug exists on Chrome for macOS (and maybe others)
			let fileValid = true;
			if (
				e.target.getAttribute("accept") === "image/*" &&
				!imageFileTypes.includes(file.type)
			) {
				e.target.value = "";
				fileValid = false;
			}

			if (fileValid) {
				if (imageFileTypes.includes(file.type)) {
					fileExistsSection.innerHTML = [
						`<span class="fmd-form-file-img-container">`,
						`	<img src="${URL.createObjectURL(file)}" alt="${file.name}">`,
						`</span>`,
						`<span class="fmd-d-block fmd-mt-3">`,
						`	<strong class="fmd-text-accent">${file.name}</strong>`,
						`</span>\n`,
					].join("\n");
				} else {
					fileExistsSection.innerHTML = [
						`<span class="fmd-form-file-img-container">`,
						`	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="fmd-icon" aria-hidden="true" focusable="false"><path d="M352 448l0-256-112 0c-26.5 0-48-21.5-48-48l0-112L64 32C46.3 32 32 46.3 32 64l0 384c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32zm-.5-288c-.7-2.8-2.1-5.4-4.2-7.4L231.4 36.7c-2.1-2.1-4.6-3.5-7.4-4.2L224 144c0 8.8 7.2 16 16 16l111.5 0zM0 64C0 28.7 28.7 0 64 0L220.1 0c12.7 0 24.9 5.1 33.9 14.1L369.9 129.9c9 9 14.1 21.2 14.1 33.9L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64z"/></svg>`,
						`</span>`,
						`<span class="fmd-d-block fmd-mt-3">`,
						`	<strong class="fmd-text-accent">${file.name}</strong>`,
						`</span>\n`,
					].join("\n");
				}
				label.classList.add("fmd-file-exists");
			}
		}
	};

	/**
	 * Set the height of a <textarea> element.
	 *
	 * @param {HTMLTextAreaElement} textarea
	 */
	setTextareaHeight = (textarea) => {
		textarea.style.height = "";
		const computedStyle = window.getComputedStyle(textarea);
		const newHeight =
			parseFloat(textarea.scrollHeight) +
			parseFloat(computedStyle.borderTopWidth) +
			parseFloat(computedStyle.borderBottomWidth);
		textarea.style.height = String(newHeight) + "px";
	};

	/**
	 * Set the height of a <textarea> element on input.
	 *
	 * @param {InputEvent} e
	 */
	setTextareaHeightOnInput = (e) => {
		const instance = this;

		instance.setTextareaHeight(e.target);
	};

	/**
	 * Reset file input when the corresponding reset button is clicked.
	 *
	 * @param {MouseEvent} e
	 */
	fileInputResetBtnOnClick = (e) => {
		const instance = this;

		// Get the input, wrapper and inner section
		const fileInput = e.target
			.closest(".fmd-form-field")
			.querySelector('.fmd-form-file-input[type="file"]');
		const label = e.target
			.closest(".fmd-form-field")
			.querySelector(".fmd-form-file-label");
		const fileExistsSection = label.querySelector(".fmd-file-exists-section");

		// Reset
		if (fileInput && label && fileExistsSection) {
			fileInput.value = "";
			instance.removeFieldErrors(e.target.closest(".fmd-form-field"));
			label.classList.remove("fmd-file-exists");
			fileExistsSection.innerHTML = "";
		}
	};

	/**
	 * Given a <button> element, set it to the processing state.
	 *
	 * @param {HTMLButtonElement} btn
	 */
	setBtnProcessing = (btn) => {
		const instance = this;

		btn.classList.add("fmd-btn-processing");
		const localization = instance.state.settings.localization;
		btn.setAttribute("aria-label", getTranslation(localization, "loading"));
	};

	/**
	 * Given a <button> element, remove its processing state.
	 *
	 * @param {HTMLButtonElement} btn
	 */
	removeBtnProcessing = (btn) => {
		const instance = this;

		btn.classList.remove("fmd-btn-processing");
		btn.removeAttribute("aria-label");
		const localization = instance.state.settings.localization;
		const footerPreviousBtn = instance.container.querySelector(
			".fmd-footer .fmd-previous-btn",
		);
		const footerNextBtn = instance.container.querySelector(
			".fmd-footer .fmd-next-btn",
		);
		if (btn === footerPreviousBtn) {
			btn.setAttribute(
				"aria-label",
				getTranslation(localization, "previous-btn"),
			);
		} else if (btn === footerNextBtn) {
			btn.setAttribute("aria-label", getTranslation(localization, "next-btn"));
		}
	};

	/**
	 * Given a slide element, remove all errors (and everything related).
	 *
	 * @param {HTMLElement} slide
	 */
	removeSlideErrors = (slide) => {
		const instance = this;

		// Remove all field errors
		slide.querySelectorAll(".fmd-form-field").forEach((formField) => {
			instance.removeFieldErrors(formField);
		});

		// Remove all slide errors
		slide.querySelectorAll(".fmd-error").forEach((error) => {
			error.remove();
		});

		// Remove WAI-ARIA tag from CTA button
		const ctaBtn =
			slide.querySelector(".fmd-submit-btn") ||
			slide.querySelector(".fmd-next-btn");
		ctaBtn.removeAttribute("aria-describedby");
	};

	/**
	 * Add an error inside the given form field element.
	 *
	 * @param {HTMLElement} formField
	 * @param {string} errorId
	 * @param {string} message
	 */
	addFieldError = (formField, errorId, message) => {
		const error = document.createElement("div");
		error.setAttribute("id", errorId);
		error.innerHTML = [
			`<div class="fmd-error">`,
			`	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="fmd-icon fmd-error-icon" aria-hidden="true" focusable="false"><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>`,
			`	${message}`,
			`</div>`,
		].join("\n");
		formField.insertAdjacentElement("beforeend", error);
	};

	/**
	 * Given a <form> element, validate and add errors if necessary. By default,
	 * most form fields rely entirely on built-in client-side validation that is
	 * found in browsers.
	 *
	 * @param {HTMLFormElement} form
	 * @returns {boolean} form is valid or not
	 */
	formValid = (form) => {
		const instance = this;

		const localization = instance.state.settings.localization;

		// Remove all form errors (reset)
		instance.removeSlideErrors(form);

		// By default, form is valid
		let isFormValid = true;
		const formFieldsWithError = [];

		// Go through form fields to validate
		// These fields will have a type attribute
		form
			.querySelectorAll(
				'.fmd-form-field[data-fmd-type="radio"][data-fmd-required], .fmd-form-field[data-fmd-type="checkbox"][data-fmd-required], .fmd-form-field[data-fmd-type="num-radio"][data-fmd-required], .fmd-form-field[data-fmd-type="datetime-local"], .fmd-form-field[data-fmd-type="date"], .fmd-form-field[data-fmd-type="time"], .fmd-form-field[data-fmd-type="file"]',
			)
			.forEach((formField) => {
				const name = formField.getAttribute("data-fmd-name");
				const type = formField.getAttribute("data-fmd-type");

				// Required choice fields
				if (type === "radio" || type === "checkbox") {
					const value = instance.getRadioCheckboxValue(
						name,
						"fmd-form-str-check-input",
						type,
					);
					if (value.length === 0) {
						isFormValid = false;
						formFieldsWithError.push(formField);

						// Add error
						const errorId = `${instance.getIdPrefix()}id_${name}-error`;
						instance.addFieldError(
							formField,
							errorId,
							getTranslation(localization, "choice-field-required"),
						);

						// Add WAI-ARIA tags to the inputs
						formField
							.querySelectorAll(".fmd-form-str-check-input")
							.forEach((input) => {
								input.setAttribute("aria-invalid", "true");
								input.setAttribute("aria-describedby", errorId);
							});
					}
				}
				// Required number choice fields
				else if (type === "num-radio") {
					const value = instance.getRadioCheckboxValue(
						name,
						"fmd-form-num-check-input",
						"radio",
					);
					if (value.length === 0) {
						isFormValid = false;
						formFieldsWithError.push(formField);

						// Add error
						const errorId = `${instance.getIdPrefix()}id_${name}-error`;
						instance.addFieldError(
							formField,
							errorId,
							getTranslation(localization, "number-choice-field-required"),
						);

						// Add WAI-ARIA tags to the inputs
						formField
							.querySelectorAll(".fmd-form-num-check-input")
							.forEach((input) => {
								input.setAttribute("aria-invalid", "true");
								instance.setSingleAttribute(input, "aria-describedby", errorId);
							});
					}
				}
				// Datetime fields
				else if (
					type === "datetime-local" ||
					type === "date" ||
					type === "time"
				) {
					const value = formField.querySelector(
						`.fmd-form-datetime-input[name="${name}"]`,
					).value;

					// Set up the pattern and error translation key
					let pattern = /.*/;
					let errorTranslationKey = "";
					if (type === "datetime-local") {
						pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
						errorTranslationKey = "datetime-input-error";
					} else if (type === "date") {
						pattern = /^\d{4}-\d{2}-\d{2}$/;
						errorTranslationKey = "date-input-error";
					} else if (type === "time") {
						pattern = /^\d{2}:\d{2}$/;
						errorTranslationKey = "time-input-error";
					}

					if (value !== "" && !value.match(pattern)) {
						isFormValid = false;
						formFieldsWithError.push(formField);

						// Add error
						const errorId = `${instance.getIdPrefix()}id_${name}-error`;
						instance.addFieldError(
							formField,
							errorId,
							getTranslation(localization, errorTranslationKey),
						);

						// Add WAI-ARIA tags to the input
						formField
							.querySelectorAll(".fmd-form-datetime-input")
							.forEach((input) => {
								input.setAttribute("aria-invalid", "true");
								input.setAttribute("aria-describedby", errorId);
							});
					}
				}
				// File fields
				else if (type === "file") {
					const sizeLimit = Number(
						formField.getAttribute("data-fmd-size-limit"),
					);
					const file = formField.querySelector(".fmd-form-file-input").files[0];
					if (file) {
						const fileSize = (file.size / 1024 / 1024).toFixed(4);
						if (fileSize > sizeLimit) {
							isFormValid = false;
							formFieldsWithError.push(formField);

							// Add error
							const errorId = `${instance.getIdPrefix()}id_${name}-error`;
							instance.addFieldError(
								formField,
								errorId,
								getTranslation(localization, "file-input-size-error"),
							);

							// Add WAI-ARIA tags to the input
							formField
								.querySelectorAll(".fmd-form-file-input")
								.forEach((input) => {
									input.setAttribute("aria-invalid", "true");
									input.setAttribute("aria-describedby", errorId);
								});
						}
					}
				}
			});

		// Focus on the first form field with error
		if (formFieldsWithError.length > 0) {
			const inputToFocus = formFieldsWithError[0].querySelector(
				".fmd-form-str-check-input, .fmd-form-num-check-input, .fmd-form-datetime-input, .fmd-form-file-input",
			);
			if (inputToFocus) {
				inputToFocus.focus();
			}
		}

		return isFormValid;
	};

	/**
	 * When an error occurs during form submission or slide transition, add an
	 * error inside the slide element that contains the messages (if any).
	 *
	 * @param {HTMLElement} slide
	 * @param {HTMLButtonElement} ctaBtn
	 * @param {Array.<string>} messages
	 */
	addSlideError = (slide, ctaBtn, messages) => {
		const instance = this;

		const localization = instance.state.settings.localization;
		const error = document.createElement("div");
		const errorId = `${instance.getIdPrefix()}id_slide-${
			instance.state.slideData.currentIndex
		}-error`;
		error.setAttribute("id", errorId);
		const messageList = [];
		if (messages.length > 0) {
			messageList.push('<ul class="fmd-error-list">');
			for (const message of messages) {
				messageList.push(`<li>${message}</li>`);
			}
			messageList.push("</ul>");
		}
		error.innerHTML = [
			`<div class="fmd-error">`,
			`	<div class="fmd-error-inner">`,
			`		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="fmd-icon fmd-error-icon" aria-hidden="true" focusable="false"><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>`,
			`		${getTranslation(localization, "slide-error")}`,
			`	</div>`,
			`	${messageList.join("\n")}`,
			`</div>`,
		].join("\n");
		ctaBtn.setAttribute("aria-describedby", errorId);
		slide.insertAdjacentElement("beforeend", error);
	};

	/**
	 * GET data from remote source. A remote source here is anything outside of
	 * the actual template.
	 *
	 * @returns {Promise<string>}
	 */
	getRemoteData = () => {
		const instance = this;

		// If the page is a file, return resolved promise
		// This way, the page can load quickly (useful when drafting)
		if (window.location.protocol === "file:") {
			console.warn("Remote data not loaded: HTML page is a file (CORS issue).");
			return Promise.resolve("").then((result) => {
				return result;
			});
		}

		// GET url not provided in settings (return resolved promise)
		if (instance.state.settings["get-url"] === undefined) {
			return Promise.resolve("").then((result) => {
				return result;
			});
		}

		// Fetch data using GET url
		return fetch(instance.state.settings["get-url"], {
			method: "GET",
			headers: instance.options.getHeaders,
		})
			.then((response) => {
				if (response.ok) {
					return response.text();
				} else {
					console.error("Network response not ok.");
					return "";
				}
			})
			.catch((error) => {
				console.error(error);
				return "";
			});
	};

	/**
	 * Convert timezone offset (in minutes) to the +HH:mm or -HH:mm format.
	 *
	 * @param {number} minutes
	 * @returns {String}
	 */
	convertTimezoneOffset = (minutes) => {
		const sign = minutes > 0 ? "-" : "+";
		const absoluteMinutes = Math.abs(minutes);
		const hours = Math.floor(absoluteMinutes / 60);
		const mins = absoluteMinutes % 60;

		// Pad hours and minutes with leading zeros if necessary
		const HH = String(hours).padStart(2, "0");
		const mm = String(mins).padStart(2, "0");

		return `${sign}${HH}:${mm}`;
	};

	/**
	 * Execute Google reCAPTCHA v3 validation.
	 *
	 * @returns {Promise<string>} The Google reCAPTCHA token
	 */
	executeRecaptcha = () => {
		const instance = this;

		return new Promise((resolve) => {
			if (!instance.options.recaptcha.siteKey) {
				resolve("");
				return;
			}

			if (!window.grecaptcha) {
				console.error("CAPTCHA not loaded. Please try again.");
				resolve("");
				return;
			}

			window.grecaptcha.ready(() => {
				window.grecaptcha
					.execute(instance.options.recaptcha.siteKey, {
						action: instance.options.recaptcha.action,
					})
					.then((token) => resolve(token))
					.catch((error) => {
						console.error("CAPTCHA execution error:", error);
						resolve("");
					});
			});
		});
	};

	/**
	 * Convert a file to base64
	 *
	 * @param {File} file
	 * @returns {Promise<string>}
	 */
	fileToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result.split(",")[1]);
			reader.onerror = (error) => reject(error);
		});
	};

	/**
	 * POST form data.
	 *
	 * @param {boolean} postCondition
	 * @param {boolean} end
	 * @returns {Promise<{ok: boolean, json: Object}>}
	 */
	postFormData = (postCondition, end) => {
		const instance = this;

		// If the post condition is false, return resolved promise
		if (!postCondition) {
			return Promise.resolve({ ok: true, json: {} }).then((result) => {
				return result;
			});
		}

		// If the page is a file, return resolved promise
		// This way, the form can continue working (useful when drafting)
		if (window.location.protocol === "file:") {
			console.warn("Form data not sent: HTML page is a file (CORS issue).");
			return Promise.resolve({ ok: true, json: {} }).then((result) => {
				return result;
			});
		}

		// POST url not provided in settings (return resolved promise)
		// True is returned with a console warning
		// Again, this way, the form can continue working (useful when drafting)
		if (instance.state.settings["post-url"] === undefined) {
			console.warn('Form data not sent: "post-url" setting not found.');
			return Promise.resolve({ ok: true, json: {} }).then((result) => {
				return result;
			});
		}

		// Create the form data to send
		const formData = new FormData();

		// Set the POST data from the options
		for (const [key, value] of Object.entries(instance.options.postData)) {
			formData.append(key, value);
		}

		// Set the form data from the state
		// Make sure to add the user timezone offset to the local datetime inputs
		let timezoneOffset = "";
		try {
			timezoneOffset = instance.convertTimezoneOffset(
				new Date().getTimezoneOffset(),
			);
		} catch (error) {
			console.error(error);
		}
		for (const [key, value] of Object.entries(instance.state.formData)) {
			if (instance.state.fieldTypes[key] === "datetime-local") {
				formData.append(key, `${value}${timezoneOffset}`);
			} else {
				formData.append(key, value);
			}
		}

		// Add the password inputs (these are not in the state)
		instance.container
			.querySelectorAll('.fmd-form-password-input[type="password"]')
			.forEach((input) => {
				formData.append(input.getAttribute("name"), input.value);
			});

		// Process files - either append directly or convert to base64
		const processFiles = async () => {
			const _fileFields = [];
			const fileInputs = instance.container.querySelectorAll(
				'.fmd-form-file-input[type="file"]',
			);

			for (const input of fileInputs) {
				const name = input.getAttribute("name");
				const file = input.files[0];

				if (file) {
					if (instance.options.sendFilesAsBase64) {
						try {
							const base64String = await instance.fileToBase64(file);
							formData.append(name, base64String);
							formData.append(`${name}Filename`, file.name);
							formData.append(`${name}Type`, file.type);
						} catch (error) {
							console.error(`Error converting file to base64: ${error}`);
							formData.append(name, file);
						}
					} else {
						formData.append(name, file);
					}
					_fileFields.push(name);
				}
			}

			if (_fileFields.length > 0) {
				formData.append("_fileFields", _fileFields.toString());
			}
		};

		// Add the current file clear checks (these are not in the state)
		instance.container
			.querySelectorAll('.fmd-form-file-clear-check-input[type="checkbox"]')
			.forEach((input) => {
				const name = input.getAttribute("name");
				formData.append(name, input.checked);
			});

		// Set the extra fields
		formData.append("_end", end ? end : "");
		formData.append("_rid", instance.getOrCreateResponseId());
		formData.append(
			"_sheetName",
			instance.state.settings["post-sheet-name"] || "",
		);
		formData.append("_submitted", new Date().toUTCString());

		// Process all files first
		return processFiles().then(() => {
			// Get and use reCAPTCHA token if site key provided
			if (instance.options.recaptcha.siteKey) {
				return instance.executeRecaptcha().then((token) => {
					formData.append("_captcha", token);
					return fetch(instance.state.settings["post-url"], {
						method: "POST",
						headers: instance.options.postHeaders,
						body: formData,
					})
						.then((response) =>
							response
								.json()
								.then((json) => {
									return { ok: response.ok, json: json };
								})
								.catch((error) => {
									console.error(error);
									return { ok: response.ok, json: {} };
								}),
						)
						.catch((error) => {
							console.error(error);
							return { ok: false, json: {} };
						});
				});
			}

			// No reCAPTCHA needed, just send the form data
			return fetch(instance.state.settings["post-url"], {
				method: "POST",
				headers: instance.options.postHeaders,
				body: formData,
			})
				.then((response) =>
					response
						.json()
						.then((json) => {
							return { ok: response.ok, json: json };
						})
						.catch((error) => {
							console.error(error);
							return { ok: response.ok, json: {} };
						}),
				)
				.catch((error) => {
					console.error(error);
					return { ok: false, json: {} };
				});
		});
	};

	/**
	 * Go through each slide (before the current one) to get the previous one to
	 * make active (depending on the jump condition).
	 *
	 * @returns {{slide: HTMLElement, index: number}} the previous slide and its
	 * index
	 */
	getPrevSlide = () => {
		const instance = this;

		const currentIndex = instance.state.slideData.currentIndex;
		const slides = instance.container.querySelectorAll(".fmd-slide");
		let prevSlide = slides[currentIndex];
		let prevSlideIndex = currentIndex;

		// Go through each slide (before the current one)
		for (let i = currentIndex - 1; i >= 0; i--) {
			const slide = slides[i];

			// If jump condition not present, this is the previous slide
			if (!slide.hasAttribute("data-fmd-jump")) {
				prevSlide = slide;
				prevSlideIndex = i;
				break;
			}

			// Use Nunjucks to check jump condition
			nunjucks.configure({ autoescape: false });
			const jumpCondition = nunjucks.renderString(
				`{% if ${slide.getAttribute("data-fmd-jump")} %}true{% endif %}`,
				{
					...instance.state.data,
					...instance.state.formData,
				},
			);
			if (jumpCondition === "true") {
				prevSlide = slide;
				prevSlideIndex = i;
				break;
			}
		}

		return {
			slide: prevSlide,
			index: prevSlideIndex,
		};
	};

	/**
	 * Get survey settings and theme from API
	 *
	 * @returns {Promise<Object>} survey data
	 */
	getSurveyFromAPI = async () => {
		const instance = this;

		// Get survey ID from configuration
		const surveyId =
			instance.state.apiConfig?.surveyId || instance.options.surveyId;
		if (!surveyId) {
			throw new Error("Survey ID is required but not provided");
		}
		const apiBaseUrl =
			instance.state.apiConfig?.apiBaseUrl ||
			instance.options.apiBaseUrl ||
			"http://localhost:3001";

		try {
			const response = await fetch(
				`${apiBaseUrl}/public/surveys/${surveyId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success && result.data) {
				return result.data;
			}

			throw new Error("Invalid survey API response format");
		} catch (error) {
			console.error("❌ Error fetching survey:", error);
			throw error;
		}
	};

	/**
	 * Get the next question from the API
	 *
	 * @param {Object} currentResponse - Current question response data
	 * @returns {Promise<{question: Object, isEndSlide: boolean}>} the next question data
	 */
	getNextQuestionFromAPI = async (currentResponse = null) => {
		const instance = this;

		// Get survey ID from configuration
		const surveyId =
			instance.state.apiConfig?.surveyId || instance.options.surveyId;
		if (!surveyId) {
			throw new Error("Survey ID is required but not provided");
		}
		const apiBaseUrl =
			instance.state.apiConfig?.apiBaseUrl ||
			instance.options.apiBaseUrl ||
			"http://localhost:3001";

		try {
			// Use persistent session ID stored in localStorage or generate new one
			let sessionId = null;
			try {
				sessionId = localStorage.getItem(`formsmd_session_${surveyId}`);
			} catch (e) {
				// localStorage not available
			}
			
			if (!sessionId) {
				// Generate unique session ID
				sessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
					? crypto.randomUUID() 
					: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				
				// Store in localStorage if available
				try {
					localStorage.setItem(`formsmd_session_${surveyId}`, sessionId);
				} catch (e) {
					// localStorage not available, continue with generated ID
				}
			}
			
			const requestBody = {
				sessionId: sessionId,
			};

			// Add current question response if provided
			if (currentResponse) {
				requestBody.currentQuestionId = currentResponse.questionId;
				requestBody.response = {
					value: currentResponse.value,
					timeSpent: currentResponse.timeSpent || 0,
				};
			}

		const response = await fetch(
			`${apiBaseUrl}/public/surveys/${surveyId}/question`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			},
		);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success && result.data) {
				const { status, question, progress } = result.data;

				if (status === "question" && question) {
					// Convert API question to slide definition
					const slideDefinition =
						instance.convertAPIQuestionToSlideDefinition(question);
					const isEndSlide =
						question.slideType === "end" ||
						question.type === "end";

					return {
						question: question,
						slideDefinition: slideDefinition,
						isEndSlide: isEndSlide,
						progress: progress,
					};
				} else if (status === "completed") {
					return {
						question: null,
						slideDefinition: null,
						isEndSlide: progress?.isLastQuestion || false, // Use progress data to determine if end screen should be shown
						progress: progress,
					};
				}
			}

			throw new Error("Invalid API response format");
		} catch (error) {
			console.error("❌ Error fetching next question:", error);
			throw error;
		}
	};

	/**
	 * Initialize the form from API data
	 */
	initializeFromAPI = async () => {
		const instance = this;

		// Record the start time for loader delay calculation
		const loaderStartTime = Date.now();

		// Configurable minimum loader display time (in milliseconds)
		// You can adjust this value to test different delay times
		const minLoaderTime = instance.options.minLoaderTime || 1500; // 1.5 seconds default

		try {
			// Get survey settings and theme
			const surveyData = await instance.getSurveyFromAPI();

			// Store welcome/end screen configuration
			if (surveyData.welcomeScreen) {
				instance.state.surveyConfig.welcomeScreen = surveyData.welcomeScreen;
			}
			if (surveyData.endScreen) {
				instance.state.surveyConfig.endScreen = surveyData.endScreen;
			}

			// Apply survey theme and settings
			instance.applySurveyTheme(surveyData);

			// Set up the form structure first
			instance.setupFormStructure();

			// Get first question (could be welcome, regular, or end)
			const firstQuestionData = await instance.getNextQuestionFromAPI();

			// Store the current question data in state
			instance.state.currentQuestion = firstQuestionData.question;

			// Initialize lifecycle state with first question
			if (firstQuestionData.question && firstQuestionData.question.questionId) {
				instance.state.lifecycle.questionPath.push(
					firstQuestionData.question.questionId,
				);
				instance.state.lifecycle.currentQuestionIndex = 0;
				instance.state.lifecycle.currentQuestion = firstQuestionData.question;
			}

			// Create first slide from API question with lifecycle management
			const firstSlideDefinition = instance.convertAPIQuestionToSlideDefinition(
				firstQuestionData.question,
			);
			const firstSlide = instance.createQuestionLifecycle(
				firstQuestionData.question,
				firstSlideDefinition,
				firstQuestionData.isEndSlide,
				firstQuestionData.question.slideType || "question",
			);

			// Add event listeners
			instance.addEventListeners(instance.container, true);

			// Calculate remaining time to meet minimum loader display time
			const elapsedTime = Date.now() - loaderStartTime;
			const remainingTime = Math.max(0, minLoaderTime - elapsedTime);

			// Hide loader and show content after the calculated delay
			setTimeout(() => {
				instance.container
					.querySelector(".fmd-loader-container")
					.classList.add("fmd-d-none");

				// Make first slide active
				firstSlide.classList.add("fmd-slide-active");
				instance.hasNewActiveSlide(firstSlide, 1, true);
			}, remainingTime);
		} catch (error) {
			console.error("❌ Error initializing from API:", error);

			// Show error message
			const loaderContainer = instance.container.querySelector(
				".fmd-loader-container",
			);
			if (loaderContainer) {
				loaderContainer.innerHTML = `
					<div class="fmd-text-center">
						<div class="fmd-error">
							<div class="fmd-error-inner">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="fmd-icon fmd-error-icon" aria-hidden="true" focusable="false">
									<path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path>
								</svg>
								Failed to load survey. Please try again.
							</div>
						</div>
					</div>
				`;
			}
		}
	};

	/**
	 * Initialize the form with API configuration
	 */
	initializeWithApiConfig = (config) => {
		const instance = this;

		// Store API configuration
		instance.state.apiConfig = {
			surveyId: config.surveyId,
			apiBaseUrl: config.apiBaseUrl,
		};

		// Set up basic template for API-driven mode
		instance.template = ""; // Empty template for API-driven mode

		// Update API endpoints to use the configured survey ID
		instance.getSurveyFromAPI = async () => {
			const surveyData = await fetchSurveyData(
				config.surveyId,
				config.apiBaseUrl,
			);
			return surveyData;
		};

		instance.getNextQuestionFromAPI = async (currentResponse = null) => {
			return await fetchNextQuestion(
				config.surveyId,
				config.apiBaseUrl,
				currentResponse,
			);
		};

		// Set up the basic DOM structure for API-driven mode
		instance.setupApiDrivenStructure();

		// Start API initialization
		instance.initializeFromAPI();
	};

	/**
	 * Initialize FormsMD with configuration
	 */
	initWithConfig = (config) => {
		const instance = this;

		// Update options with API configuration
		if (config.isApiDriven) {
			instance.options.isApiDriven = true;
			instance.options.surveyId = config.surveyId;
			instance.options.apiBaseUrl = config.apiBaseUrl;
		}

		// Initialize
		instance.init();
	};

	/**
	 * Apply survey theme and settings
	 *
	 * @param {Object} surveyData - Survey data from API
	 */
	applySurveyTheme = (surveyData) => {
		const instance = this;

		// Apply theme colors if available
		if (surveyData.theme) {
			const rootElem = instance.container.querySelector(".fmd-root");
			if (rootElem) {
				// Convert hex colors to RGB and apply
				if (surveyData.theme.backgroundColor) {
					const rgb = hexToRgb(surveyData.theme.backgroundColor);
					if (rgb) {
						rootElem.style.setProperty("--fmd-body-bg-r", rgb.r);
						rootElem.style.setProperty("--fmd-body-bg-g", rgb.g);
						rootElem.style.setProperty("--fmd-body-bg-b", rgb.b);
						rootElem.style.setProperty(
							"--fmd-body-bg-rgb",
							`${rgb.r}, ${rgb.g}, ${rgb.b}`,
						);
					}
				}

				if (surveyData.theme.textColor) {
					const rgb = hexToRgb(surveyData.theme.textColor);
					if (rgb) {
						rootElem.style.setProperty(
							"--fmd-body-color-rgb",
							`${rgb.r}, ${rgb.g}, ${rgb.b}`,
						);
						rootElem.style.setProperty("--fmd-body-color-r", rgb.r);
						rootElem.style.setProperty("--fmd-body-color-g", rgb.g);
						rootElem.style.setProperty("--fmd-body-color-b", rgb.b);
					}
				}

				if (surveyData.theme.buttonColor || surveyData.theme.accent) {
					const rgb = hexToRgb(
						surveyData.theme.buttonColor || surveyData.theme.accent,
					);
					if (rgb) {
						rootElem.style.setProperty(
							"--fmd-accent-rgb",
							`${rgb.r}, ${rgb.g}, ${rgb.b}`,
						);
						rootElem.style.setProperty("--fmd-accent-r", rgb.r);
						rootElem.style.setProperty("--fmd-accent-g", rgb.g);
						rootElem.style.setProperty("--fmd-accent-b", rgb.b);
					}
				}

				if (surveyData.theme.accentForeground) {
					const rgb = hexToRgb(surveyData.theme.accentForeground);
					if (rgb) {
						rootElem.style.setProperty(
							"--fmd-accent-foreground-rgb",
							`${rgb.r}, ${rgb.g}, ${rgb.b}`,
						);
						rootElem.style.setProperty("--fmd-accent-foreground-r", rgb.r);
						rootElem.style.setProperty("--fmd-accent-foreground-g", rgb.g);
						rootElem.style.setProperty("--fmd-accent-foreground-b", rgb.b);
					}
				}
			}
		}

		// Store survey data for later use
		instance.state.surveyData = surveyData;
	};

	/**
	 * Get current form data for API submission using questionId-based approach
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {Object} originalQuestion - The original question object from API
	 * @returns {Object} Form data with questionId, value, and timeSpent
	 */
	getCurrentFormData = (activeSlide, originalQuestion = null) => {
		const instance = this;

		// Get questionId from original question or extract from DOM
		let questionId;
		if (originalQuestion && originalQuestion.questionId) {
			questionId = originalQuestion.questionId;
		} else {
			// Find the current question ID from the slide
			const formField = activeSlide.querySelector("[data-fmd-name]");
			if (!formField) {
				console.log("🔍 DEBUG: No form field found with data-fmd-name");
				return null;
			}
			questionId = formField.getAttribute("data-fmd-name");
		}

		console.log(`🔍 DEBUG: Processing questionId: ${questionId}`);

		// Get question type and configuration
		const questionType =
			originalQuestion?.type ||
			this.getQuestionTypeFromDOM(activeSlide, questionId);
		const questionConfig = originalQuestion?.options || {};

		console.log(`🔍 DEBUG: Question type: ${questionType}`);

		// Extract value based on question type
		let value = this.extractValueByQuestionType(
			activeSlide,
			questionId,
			questionType,
			questionConfig,
		);

		console.log(`🔍 DEBUG: Extracted value: ${JSON.stringify(value)}`);

		// Calculate time spent (simple implementation)
		const timeSpent = Math.floor(Math.random() * 30) + 5; // Random time for demo

		const formData = {
			questionId: questionId,
			value: value,
			timeSpent: timeSpent,
		};
		
		console.log(`🔍 DEBUG: Final form data: ${JSON.stringify(formData)}`);
		return formData;
	};

	/**
	 * Get question type from DOM if not provided in original question
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {string} questionId - The question ID
	 * @returns {string} Question type
	 */
	getQuestionTypeFromDOM = (activeSlide, questionId) => {
		// Look for fieldset with data-fmd-name (choice inputs)
		const fieldset = activeSlide.querySelector(
			`fieldset[data-fmd-name="${questionId}"]`,
		);
		if (fieldset) {
			const fieldType = fieldset.getAttribute("data-fmd-type");
			if (fieldType === "radio") {
				return "choice_input";
			}
			if (fieldType === "checkbox") {
				return "choice_input";
			}
			if (fieldType === "num-radio") {
				return "rating_input";
			}
		}

		// Look for individual input elements
		let input = activeSlide.querySelector(`input[name="${questionId}"]`);
		
		// If not found, try with data-fmd-name attribute
		if (!input) {
			input = activeSlide.querySelector(`input[data-fmd-name="${questionId}"]`);
		}
		
		// If still not found, try to find any input in the slide
		if (!input) {
			input = activeSlide.querySelector('input');
		}
		
		if (input) {
			const inputType = input.getAttribute("type");
			console.log(`🔍 DEBUG: Found input with type: ${inputType} for questionId: ${questionId}`);
			if (
				inputType === "text" ||
				inputType === "email" ||
				inputType === "url"
			) {
				return "text_input";
			}
			if (inputType === "number") {
				return "number_input";
			}
			if (inputType === "tel") {
				return "text_input";
			}
			if (
				inputType === "datetime-local" ||
				inputType === "date" ||
				inputType === "time"
			) {
				return "datetime_input";
			}
		}

		// Look for textarea
		let textarea = activeSlide.querySelector(`textarea[name="${questionId}"]`);
		if (!textarea) {
			textarea = activeSlide.querySelector(`textarea[data-fmd-name="${questionId}"]`);
		}
		if (!textarea) {
			textarea = activeSlide.querySelector('textarea');
		}
		if (textarea) {
			return "text_input";
		}

		// Look for select
		let select = activeSlide.querySelector(`select[name="${questionId}"]`);
		if (!select) {
			select = activeSlide.querySelector(`select[data-fmd-name="${questionId}"]`);
		}
		if (!select) {
			select = activeSlide.querySelector('select');
		}
		if (select) {
			return "choice_input";
		}

		// Default fallback
		console.log(`🔍 DEBUG: No input found, defaulting to text_input for questionId: ${questionId}`);
		return "text_input";
	};

	/**
	 * Extract value based on question type using questionId
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {string} questionId - The question ID
	 * @param {string} questionType - The question type
	 * @param {Object} questionConfig - Question configuration (options, etc.)
	 * @returns {string|number|Array} Extracted value
	 */
	extractValueByQuestionType = (
		activeSlide,
		questionId,
		questionType,
		questionConfig,
	) => {
		switch (questionType) {
			case "choice_input":
				return this.extractChoiceInputValue(
					activeSlide,
					questionId,
					questionConfig,
				);
			case "text_input":
			case "email_input":
			case "urlinput":
			case "telinput":
				return this.extractTextInputValue(activeSlide, questionId);
			case "number_input":
				return this.extractNumberInputValue(activeSlide, questionId);
			case "rating_input":
			case "opinion_scale":
				return this.extractRatingInputValue(activeSlide, questionId);
			case "datetime_input":
			case "dateinput":
			case "timeinput":
				return this.extractDateTimeInputValue(activeSlide, questionId);
			case "file_input":
				return this.extractFileInputValue(activeSlide, questionId);
			default:
				return this.extractTextInputValue(activeSlide, questionId);
		}
	};

	/**
	 * Extract value from choice input (radio/checkbox)
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {string} questionId - The question ID
	 * @param {Object} questionConfig - Question configuration
	 * @returns {string|Array} Extracted value
	 */
	extractChoiceInputValue = (activeSlide, questionId, questionConfig) => {
		// Check if it's multiple choice (checkbox) or single choice (radio)
		const isMultiple = questionConfig?.multiple || false;

		// Get the actual radio button name from the first radio button
		let actualRadioName = questionId;
		const allRadioButtons = activeSlide.querySelectorAll('input[type="radio"]'); // ✅ Add this line
		if (allRadioButtons.length > 0) {
			actualRadioName = allRadioButtons[0].name;
		}

		if (isMultiple) {
			// Multiple choice - return array of selected values
			const checkedInputs = activeSlide.querySelectorAll(
				`input[name="${actualRadioName}"]:checked`,
			);
			const values = [];
			checkedInputs.forEach((input) => {
				values.push(input.value);
			});
			return values;
		} else {
			// Single choice - return single selected value
			const checkedInput = activeSlide.querySelector(
				`input[name="${actualRadioName}"]:checked`,
			);
			return checkedInput ? checkedInput.value : "";
		}
	};

	/**
	 * Extract value from text input
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {string} questionId - The question ID
	 * @returns {string} Extracted value
	 */
	extractTextInputValue = (activeSlide, questionId) => {
		// Try multiple selectors to find the input field
		let input = activeSlide.querySelector(`input[name="${questionId}"]`);
		let textarea = activeSlide.querySelector(`textarea[name="${questionId}"]`);
		
		// If not found, try with data-fmd-name attribute
		if (!input && !textarea) {
			input = activeSlide.querySelector(`input[data-fmd-name="${questionId}"]`);
			textarea = activeSlide.querySelector(`textarea[data-fmd-name="${questionId}"]`);
		}
		
		// If still not found, try to find any input/textarea in the slide
		if (!input && !textarea) {
			input = activeSlide.querySelector('input[type="text"], input[type="email"], input[type="url"], input[type="tel"]');
			textarea = activeSlide.querySelector('textarea');
		}

		if (input) {
			console.log(`🔍 DEBUG: Found input value: "${input.value}" for questionId: ${questionId}`);
			return input.value || "";
		} else if (textarea) {
			console.log(`🔍 DEBUG: Found textarea value: "${textarea.value}" for questionId: ${questionId}`);
			return textarea.value || "";
		}

		console.log(`🔍 DEBUG: No input/textarea found for questionId: ${questionId}`);
		return "";
	};

	/**
	 * Extract value from number input
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {string} questionId - The question ID
	 * @returns {number|null} Extracted value
	 */
	extractNumberInputValue = (activeSlide, questionId) => {
		// Try multiple selectors to find the number input field
		let input = activeSlide.querySelector(`input[name="${questionId}"]`);
		
		// If not found, try with data-fmd-name attribute
		if (!input) {
			input = activeSlide.querySelector(`input[data-fmd-name="${questionId}"]`);
		}
		
		// If still not found, try to find any number input in the slide
		if (!input) {
			input = activeSlide.querySelector('input[type="number"]');
		}

		if (input && input.value) {
			console.log(`🔍 DEBUG: Found number input value: "${input.value}" for questionId: ${questionId}`);
			const numValue = parseFloat(input.value);
			return isNaN(numValue) ? null : numValue;
		}
		
		console.log(`🔍 DEBUG: No number input found for questionId: ${questionId}`);
		return null;
	};

	/**
	 * Extract value from rating input
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {string} questionId - The question ID
	 * @returns {number|null} Extracted value
	 */
	extractRatingInputValue = (activeSlide, questionId) => {
		const checkedInput = activeSlide.querySelector(
			`input[name="${questionId}"]:checked`,
		);
		if (checkedInput && checkedInput.value) {
			const numValue = parseInt(checkedInput.value);
			return isNaN(numValue) ? null : numValue;
		}
		return null;
	};

	/**
	 * Extract value from datetime input
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {string} questionId - The question ID
	 * @returns {string} Extracted value
	 */
	extractDateTimeInputValue = (activeSlide, questionId) => {
		const input = activeSlide.querySelector(`input[name="${questionId}"]`);
		return input ? input.value || "" : "";
	};

	/**
	 * Extract value from file input
	 *
	 * @param {HTMLElement} activeSlide - The current active slide
	 * @param {string} questionId - The question ID
	 * @returns {string} Extracted value
	 */
	extractFileInputValue = (activeSlide, questionId) => {
		const input = activeSlide.querySelector(`input[name="${questionId}"]`);
		if (input && input.files && input.files.length > 0) {
			return input.files[0].name; // Return filename for now
		}
		return "";
	};

	/**
	 * Set up the basic DOM structure for API-driven mode
	 */
	setupApiDrivenStructure = () => {
		const instance = this;

		// Set up basic settings for API-driven mode
		instance.state.settings = {
			...instance.state.settings,
			"id": instance.options.surveyId,
			"title": "Loading Survey...",
			"page": "form-slides",
			"slide-delimiter": "---",
			"submit-button-text": "OK",
			"restart-button": "hide",
			"localization": "en",
			"dir": "ltr",
		};

		// Set up basic template
		instance.template = "";

		// Set up basic data
		instance.state.data = {};

		// Get or create response id
		instance.getOrCreateResponseId();
	};

	/**
	 * Set up the basic form structure
	 */
	setupFormStructure = () => {
		const instance = this;

		// Create main container structure
		const mainContainer = instance.container.querySelector(".fmd-main");
		if (mainContainer) {
			mainContainer.innerHTML = `
				<div class="fmd-main-container">
					<div class="fmd-loader-container">
						<div class="fmd-text-center fmd-mb-3">
							<div class="fmd-specific-fs-14">Loading...</div>
						</div>
						<div class="fmd-loader-progress" role="status" aria-label="Loading"></div>
					</div>
					<!-- Slides will be inserted here dynamically -->
				</div>
			`;
		}
	};

	/**
	 * Convert API question to slide definition format
	 *
	 * @param {Object} question - The question object from API
	 * @returns {string} slide definition in markdown format
	 */
	convertAPIQuestionToSlideDefinition = (question) => {
		const instance = this;

		// Handle welcome screen questions
		if (question.type === "welcome") {
			// Create a special slide definition for welcome screens
			// This will be rendered using the welcome screen template
			return {
				type: "welcome",
				questionId: question.questionId,
				title: question.question || question.title,
				content: question.content || question.description,
				buttonText: question.options?.buttonText || question.buttonText,
				alignment:
					question.options?.alignment || question.alignment || "center",
				showProgress: question.showProgress !== false,
			};
		}

		// Handle end screen questions
		if (question.type === "end") {
			// Create a special slide definition for end screens
			return {
				type: "end",
				questionId: question.questionId,
				title: question.question || question.title,
				content: question.content || question.description,
				buttonText: question.buttonText,
				showProgress: question.showProgress !== false,
			};
		}

		// Map API question types to FormsMD field types (FormsMD expects lowercase, no underscores)
		let fieldType = "textinput";
		if (question.type === "choice_input") {
			fieldType = "choiceinput";
		} else if (question.type === "number_input") {
			fieldType = "numberinput";
		} else if (question.type === "rating_input") {
			fieldType = "ratinginput";
		} else if (question.type === "datetime_input") {
			fieldType = "datetimeinput";
		} else if (question.type === "file_input") {
			fieldType = "fileinput";
		} else if (question.type === "opinion_scale") {
			fieldType = "opinionscale";
		} else if (question.type === "country_calling_code") {
			fieldType = "country_calling_code";
		} else if (question.type === "email_input") {
			fieldType = "emailinput";
		} else if (question.type === "url_input") {
			fieldType = "urlinput";
		} else if (question.type === "tel_input") {
			fieldType = "telinput";
		}

		// Build the slide definition
		let slideDefinition = `\n`;

		// Add progress if available
		if (question.order) {
			slideDefinition += `|> ${Math.round((question.order / 5) * 100)}%\n\n`;
		}

		// Build the field definition
		slideDefinition += `${question.questionId}${question.required ? "\\*" : ""} = ${fieldType}(\n`;
		slideDefinition += `| question = ${question.question}\n`;

		// Add field-specific properties
		if (
			question.type === "choice_input" &&
			question.options &&
			question.options.choices
		) {
			const choices = question.options.choices.map((choice) => choice.text);
			slideDefinition += `| choices = ${choices.join(", ")}\n`;
		} else if (question.type === "choice_input" && question.choices) {
			// Fallback for old format
			slideDefinition += `| choices = ${question.choices.join(", ")}\n`;
		}

		if (question.description) {
			slideDefinition += `| description = ${question.description}\n`;
		}

		slideDefinition += `)\n`;

		return slideDefinition;
	};

	/**
	 * Create the next slide from its definition and insert it into the DOM
	 *
	 * @param {string} slideDefinition
	 * @param {boolean} isEndSlide
	 * @returns {HTMLElement} the created slide element
	 */
	createNextSlide = (slideDefinition, isEndSlide, isLastQuestion = false) => {
		const instance = this;

		// Debug logging

		// Import required functions (now using static imports)
		// const { renderSlideFromDefinition } = require("./slides-parse");
		// const { createContentTemplate } = require("./templates-create");

		let slideHtml;

		if (isEndSlide) {
			// Handle end slide - this should not happen in createNextSlide
			// End slides should be handled by createQuestionLifecycle
			console.warn("createNextSlide called with isEndSlide=true, this should not happen");
			slideHtml = '<div class="fmd-slide fmd-end-slide"><div class="fmd-grid"><div class="fmd-text-center"><h1>End Slide</h1></div></div></div>';
		} else {
			// Render regular slide
			slideHtml = renderSlideFromDefinition(
				slideDefinition,
				instance.state.settings.page === "form-slides" ? true : false,
				false, // isFirstSlide
				{
					showRestartBtn:
						instance.state.settings["restart-button"] === "show" ? true : false,
					submitBtnText: instance.state.settings["submit-button-text"] || "",
				},
				instance.state.settings.localization,
				isLastQuestion, // isLastQuestion
			);
		}

		// Create DOM element from HTML
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = slideHtml;
		const slideElement = tempDiv.firstElementChild;

		// // Insert the slide into the DOM
		// const mainContainer = instance.container.querySelector(
		// 	".fmd-main-container",
		// );

		// // Remove any existing slides to prevent form element conflicts
		// const existingSlides = mainContainer.querySelectorAll(
		// 	".fmd-slide:not(.fmd-first-slide)",
		// );
		// existingSlides.forEach((slide) => {
		// 	if (slide !== slideElement) {
		// 		slide.remove();
		// 	}
		// });

		// mainContainer.appendChild(slideElement);

		// // Process the slide content (markdown, etc.)
		// instance.processSlideContent(slideElement);

		// // Add event listeners to the new slide
		// instance.addEventListeners(slideElement, false);

		// // Update available slides count
		// instance.state.slideData.availableSlides++;

		// Debug logging for slide insertion

		// Debug logging

		return slideElement;
	};

	/**
	 * Lifecycle Manager - Create question with caching
	 */
	createQuestionLifecycle = (
		questionData,
		slideDefinition,
		isEndSlide = false,
		slideType = "question",
		isLastQuestion = false,
	) => {
		const instance = this;

		let slideElement;

		// Handle different slide types
		if (
			slideType === "welcome" ||
			(slideDefinition && slideDefinition.type === "welcome")
		) {
			// Create welcome slide using the slide definition data
			const welcomeData =
				slideDefinition && slideDefinition.type === "welcome"
					? slideDefinition
					: questionData;
			const welcomeHtml = instance.renderWelcomeSlide(welcomeData, welcomeData);
			slideElement = instance.createContentSlide(welcomeHtml);
		} else if (
			slideType === "end" ||
			(slideDefinition && slideDefinition.type === "end")
		) {
			// Create end slide using the slide definition data
			const endData =
				slideDefinition && slideDefinition.type === "end"
					? slideDefinition
					: questionData;
			const endHtml = instance.renderEndSlide(endData, endData);
			slideElement = instance.createContentSlide(endHtml);
		} else {
			// Create regular question slide (DOM element only, no insertion)
			slideElement = instance.createNextSlide(slideDefinition, isEndSlide, isLastQuestion);

			// ✅ ADD BACK: DOM insertion and cleanup logic here
			// Insert the slide into the DOM
			const mainContainer = instance.container.querySelector(
				".fmd-main-container",
			);

			// Remove any existing slides to prevent form element conflicts
			const existingSlides = mainContainer.querySelectorAll(
				".fmd-slide:not(.fmd-first-slide)",
			);
			existingSlides.forEach((slide) => {
				if (slide !== slideElement) {
					slide.remove();
				}
			});

			mainContainer.appendChild(slideElement);

			// Process the slide content (markdown, etc.)
			instance.processSlideContent(slideElement);

			// Add event listeners to the new slide
			instance.addEventListeners(slideElement, false);

			// Update available slides count
			instance.state.slideData.availableSlides++;

			// ✅ ADD: Fade transition call here
			// Get the current active slide for transition
			const activeSlide = instance.container.querySelector(".fmd-slide-active");
			if (activeSlide) {
				// Trigger fade out of current slide and fade in of new slide
				instance.fadeInNextSlide(activeSlide, slideElement);
			}
		}

		// Store question data in cache if not end slide and has questionId
		if (slideType === "question" && questionData && questionData.questionId) {
			instance.state.lifecycle.questionCache.set(questionData.questionId, {
				questionData,
				slideDefinition,
				slideElement: null, // Will be set when destroyed
			});
		}

		return slideElement;
	};

	/**
	 * Lifecycle Manager - Destroy question and cache it
	 */
	destroyQuestionLifecycle = (slideElement) => {
		const instance = this;

		if (!slideElement) {
			return;
		}

		// Store the slide element in cache for potential reuse
		const questionId = slideElement
			.querySelector("[data-fmd-name]")
			?.getAttribute("data-fmd-name");
		if (questionId && instance.state.lifecycle.questionCache.has(questionId)) {
			const cachedQuestion =
				instance.state.lifecycle.questionCache.get(questionId);
			cachedQuestion.slideElement = slideElement.cloneNode(true);
		}

		// Remove from DOM
		slideElement.remove();
	};

	/**
	 * Get the currently active slide
	 */
	getActiveSlide = () => {
		const instance = this;
		return instance.container.querySelector(".fmd-slide-active");
	};

	/**
	 * Reset button processing state - ensures all buttons are enabled and functional
	 */
	resetButtonProcessingState = () => {
		const instance = this;
		const rootElem = instance.container.querySelector(".fmd-root");

		// Remove processing state from all buttons
		const processingButtons = instance.container.querySelectorAll(
			".fmd-btn-processing",
		);
		processingButtons.forEach((btn) => {
			instance.removeBtnProcessing(btn);
		});

		// Enable all clicks on root element
		rootElem.removeEventListener("click", instance.disableAllClicks, true);

		// Ensure the active slide's buttons are clean and functional
		const activeSlide = instance.getActiveSlide();

		if (activeSlide) {
			// Remove any lingering processing classes from the active slide
			const activeSlideButtons = activeSlide.querySelectorAll(
				".fmd-btn-processing",
			);

			activeSlideButtons.forEach((btn) => {
				instance.removeBtnProcessing(btn);
			});

			// Log all buttons on the active slide
			const allButtons = activeSlide.querySelectorAll(
				"button, input[type='submit']",
			);
		}
	};

	/**
	 * Show a slide (make it active)
	 */
	showSlide = (slideElement) => {
		const instance = this;

		// Remove active class from all slides
		instance.container
			.querySelectorAll(".fmd-slide-active")
			.forEach((slide) => {
				slide.classList.remove("fmd-slide-active");
			});

		// Add active class to the target slide
		slideElement.classList.add("fmd-slide-active");

		// Update slide index
		const slides = instance.container.querySelectorAll(".fmd-slide");
		const slideIndex = Array.from(slides).indexOf(slideElement);
		if (slideIndex !== -1) {
			instance.hasNewActiveSlide(slideElement, slideIndex, false);
		}

		// Reset button processing state for the new slide
		instance.resetButtonProcessingState();
	};

	/**
	 * Navigation Manager - Navigate to specific question
	 */
	navigateToQuestion = async (targetIndex) => {
		const instance = this;
		const { lifecycle } = instance.state;

		if (targetIndex < 0 || targetIndex >= lifecycle.questionPath.length) {
			console.error("Invalid question index:", targetIndex);
			return;
		}

		const targetQuestionId = lifecycle.questionPath[targetIndex];
		const activeSlide = instance.getActiveSlide();

		// Check if question is cached
		const cachedQuestion = lifecycle.questionCache.get(targetQuestionId);

		if (cachedQuestion) {
			// Use cached question
			const slideElement = cachedQuestion.slideElement
				? cachedQuestion.slideElement.cloneNode(true)
				: instance.createNextSlide(cachedQuestion.slideDefinition, false);

			// Insert into DOM
			const mainContainer = instance.container.querySelector(
				".fmd-main-container",
			);
			mainContainer.appendChild(slideElement);

			// Restore user response if exists
			const userResponse = lifecycle.userResponses.get(targetQuestionId);
			if (userResponse) {
				instance.restoreUserResponse(slideElement, userResponse);
			}

			// Update state
			lifecycle.currentQuestionIndex = targetIndex;
			lifecycle.currentQuestion = cachedQuestion.questionData;
			instance.state.currentQuestion = cachedQuestion.questionData;

			// Use existing transition logic if we have an active slide
			if (activeSlide) {
				instance.fadeInNextSlide(activeSlide, slideElement);
			} else {
				instance.showSlide(slideElement);
				// showSlide already calls resetButtonProcessingState
			}
		} else {
			// Question not cached - this shouldn't happen for previous questions
			console.error("Question not found in cache:", targetQuestionId);
		}
	};

	/**
	 * Restore user response to a slide
	 */
	restoreUserResponse = (slideElement, response) => {
		const instance = this;

		const formField = slideElement.querySelector(
			`[data-fmd-name="${response.questionId}"]`,
		);
		if (!formField) {
			return;
		}

		// Restore value based on field type
		if (formField.type === "radio" || formField.type === "checkbox") {
			if (formField.type === "radio") {
				const radioButton = slideElement.querySelector(
					`input[type="radio"][value="${response.value}"]`,
				);
				if (radioButton) {
					radioButton.checked = true;
				}
			} else {
				// Checkbox - response.value should be an array
				const values = Array.isArray(response.value)
					? response.value
					: [response.value];
				values.forEach((value) => {
					const checkbox = slideElement.querySelector(
						`input[type="checkbox"][value="${value}"]`,
					);
					if (checkbox) {
						checkbox.checked = true;
					}
				});
			}
		} else {
			formField.value = response.value || "";
		}
	};

	/**
	 * Handle answer changes and branching
	 */
	handleAnswerChange = async (questionId, newResponse) => {
		const instance = this;
		const { lifecycle } = instance.state;

		// Update user response
		lifecycle.userResponses.set(questionId, newResponse);

		// Find the index of the changed question
		const changedIndex = lifecycle.questionPath.indexOf(questionId);
		if (changedIndex === -1) {
			return;
		}

		// Invalidate all subsequent questions (branching)
		const questionsToInvalidate = lifecycle.questionPath.slice(
			changedIndex + 1,
		);
		questionsToInvalidate.forEach((qId) => {
			lifecycle.questionCache.delete(qId);
			lifecycle.userResponses.delete(qId);
		});

		// Remove invalidated questions from path
		lifecycle.questionPath.splice(changedIndex + 1);

		// If we're currently on an invalidated question, go back to the changed question
		if (lifecycle.currentQuestionIndex > changedIndex) {
			await instance.navigateToQuestion(changedIndex);
		}
	};

	/**
	 * Enhanced back navigation
	 */
	handleBackNavigation = () => {
		const instance = this;
		const { lifecycle } = instance.state;

		const previousIndex = lifecycle.currentQuestionIndex - 1;
		if (previousIndex >= 0) {
			instance.navigateToQuestion(previousIndex);
		}
	};

	/**
	 * Enhanced forward navigation
	 */
	handleForwardNavigation = () => {
		const instance = this;
		const { lifecycle } = instance.state;

		const nextIndex = lifecycle.currentQuestionIndex + 1;
		if (nextIndex < lifecycle.questionPath.length) {
			instance.navigateToQuestion(nextIndex);
		}
	};

	/**
	 * Render welcome slide
	 */
	renderWelcomeSlide = (question, config) => {
		const instance = this;

		// Import the welcome screen template (now using static imports)
		// const { createWelcomeScreen } = require("./welcome-screen-template");

		// Create welcome screen HTML using the template
		return createWelcomeScreen(config, instance.state.settings.localization);
	};

	/**
	 * Render end slide
	 */
	renderEndSlide = (question, config) => {
		const instance = this;
		// const { getTranslation } = require("./translations");
		// var nunjucks = require("nunjucks");

		// Extract settings from question data
		const title = question?.question || question?.title;
		const content = question?.content || question?.description;
		const buttonText =
			question?.options?.ctaText || question?.options?.buttonText;
		const alignment = question?.options?.alignment || "center";
		const redirectUrl = question?.options?.redirectUrl;
		const redirectDelay = question?.options?.redirectDelay || 3000;

		// End slide template - mirrors welcome screen structure
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
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="fmd-icon fmd-ms-2 fmd-hide-ltr" aria-hidden="true" focusable="false"><path d="M47 239c9.4 9.4 9.4 24.6 0 33.9L207 433c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L97.9 256 241 113c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L273 239z"/></svg>
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

		// Determine button text and redirect settings
		let finalButtonText = "";
		let finalRedirectUrl = "";
		let redirectMessage = "";

		if (redirectUrl) {
			finalRedirectUrl = redirectUrl;
			redirectMessage =
				getTranslation(
					instance.state.settings.localization,
					"redirecting-message",
				) || `Redirecting in ${redirectDelay / 1000} seconds...`;
		} else {
			finalButtonText =
				buttonText ||
				getTranslation(
					instance.state.settings.localization,
					"create-survey-btn",
				) ||
				"Create a Survey";
		}

		// Use Nunjucks to render the template
		nunjucks.configure({ autoescape: false });
		return nunjucks.renderString(endSlideTemplate, {
			title:
				title ||
				getTranslation(
					instance.state.settings.localization,
					"form-submitted-title",
				),
			content:
				content ||
				getTranslation(
					instance.state.settings.localization,
					"form-submitted-subtitle",
				),
			buttonText: finalButtonText,
			alignment: alignment,
			redirectUrl: finalRedirectUrl,
			redirectMessage: redirectMessage,
		});
	};

	/**
	 * Render content slide (generic)
	 */
	renderContentSlide = (slideType, question, config) => {
		const instance = this;

		if (slideType === "welcome") {
			return instance.renderWelcomeSlide(question, config);
		} else if (slideType === "end") {
			return instance.renderEndSlide(question, config);
		}

		return null;
	};

	/**
	 * Handle end screen navigation
	 */
	handleEndNavigation = () => {
		const instance = this;
		// Get current question to check for redirect settings
		const currentQuestion = instance.state.currentQuestion;

		// Check if there's a redirect URL configured
		if (currentQuestion?.options?.redirectUrl) {
			const redirectUrl = currentQuestion.options.redirectUrl;
			const redirectDelay = currentQuestion.options.redirectDelay || 3000;

			// Redirect after delay
			setTimeout(() => {
				window.location.href = redirectUrl;
			}, redirectDelay);
		} else {
			// Default CTA action - redirect to Forms.md or configured URL
			const defaultCTAUrl =
				currentQuestion?.options?.ctaUrl || "https://forms.md";

			window.location.href = defaultCTAUrl;
		}
	};

	/**
	 * Create content slide from HTML
	 */
	createContentSlide = (slideHtml) => {
		const instance = this;

		// Create DOM element from HTML
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = slideHtml;
		const slideElement = tempDiv.firstElementChild;

		// Insert the slide into the DOM
		const mainContainer = instance.container.querySelector(
			".fmd-main-container",
		);
		mainContainer.appendChild(slideElement);

		// Process the slide content (markdown, etc.)
		instance.processSlideContent(slideElement);

		// Add event listeners to the new slide
		instance.addEventListeners(slideElement, false);

		// Update available slides count
		instance.state.slideData.availableSlides++;

		return slideElement;
	};

	/**
	 * Process slide content (markdown parsing, highlighting, etc.)
	 *
	 * @param {HTMLElement} slideElement
	 */
	processSlideContent = (slideElement) => {
		const instance = this;

		// Process markdown content
		slideElement.querySelectorAll("markdown").forEach((markdownElement) => {
			const content = markdownElement.innerHTML;

			// Parse markdown
			marked.use({
				renderer: renderer,
				markedSettings: {
					"css-prefix": instance.state.settings["css-prefix"],
					"form-delimiter": instance.state.settings["form-delimiter"],
					"id": instance.state.settings.id,
					"localization": instance.state.settings.localization,
				},
			});

			let parsedContent = marked.parse(content);

			// Sanitize if needed
			if (instance.options.sanitize) {
				const DOMPurify = createDOMPurify(window);
				parsedContent = DOMPurify.sanitize(parsedContent);
			}

			// Replace markdown element with parsed content
			markdownElement.outerHTML = parsedContent;
		});

		// Highlight code blocks
		slideElement.querySelectorAll("pre code").forEach((codeBlock) => {
			hljs.highlightElement(codeBlock);
		});

		// Set heights of <textarea> elements (in case of default values)
		slideElement
			.querySelectorAll("textarea.fmd-form-str-input")
			.forEach((textarea) => {
				instance.setTextareaHeight(textarea);
			});
	};

	/**
	 * Get the CSS slide transition duration (in milliseconds).
	 *
	 * @returns {number}
	 */
	getSlideTransitionDuration = () => {
		const instance = this;

		const rootElem = instance.container.querySelector(".fmd-root");

		// If the duration is saved on the root element, return saved duration
		if (rootElem.hasAttribute("data-fmd-slide-transition-duration")) {
			return Number(
				rootElem.getAttribute("data-fmd-slide-transition-duration"),
			);
		}
		// Otherwise, calculate duration from CSS, save on root element, and return
		else {
			let duration =
				window
					.getComputedStyle(rootElem)
					.getPropertyValue("--fmd-slide-transition-duration") || "200ms";
			duration = Number(duration.slice(0, -2));
			rootElem.setAttribute("data-fmd-slide-transition-duration", duration);
			return duration;
		}
	};

	/**
	 * When a new slide becomes active, do the following: update state, handle
	 * page progress (if applicable), handle the display and state of the footer
	 * slide control buttons, scroll to top and autofocus (if applicable).
	 *
	 * @param {HTMLElement} slide
	 * @param {number} index
	 * @param {boolean} fromInit
	 */
	hasNewActiveSlide = (slide, index, fromInit) => {
		const instance = this;

		// Update state
		instance.state.slideData.currentIndex = index;

		// Handle page progress (if applicable)
		const pageProgress = instance.container.querySelector(".fmd-page-progress");
		let slidePageProgress;
		if (slide.hasAttribute("data-fmd-page-progress")) {
			slidePageProgress = slide.getAttribute("data-fmd-page-progress");
		} else if (slide.classList.contains("fmd-first-slide")) {
			slidePageProgress = "0%";
		} else if (slide.classList.contains("fmd-end-slide")) {
			slidePageProgress = "100%";
		}
		if (
			pageProgress &&
			slidePageProgress !== undefined &&
			instance.state.settings["page-progress"] !== "decorative"
		) {
			const localization = instance.state.settings.localization;
			pageProgress.setAttribute("role", "progressbar");
			pageProgress.setAttribute(
				"aria-label",
				getTranslation(localization, "page-progress"),
			);
			pageProgress.setAttribute("aria-valuemin", "0");
			pageProgress.setAttribute("aria-valuemax", "100");
			pageProgress.setAttribute(
				"aria-valuenow",
				slidePageProgress.replace("%", ""),
			);
			pageProgress
				.querySelector(".fmd-progress-bar")
				.setAttribute("style", `width: ${slidePageProgress}`);
		}

		// The timeout makes sure that the slide animation has completed
		setTimeout(function () {
			// Scroll
			if (instance.options.isFullPage) {
				window.scroll({ top: 0 });
			} else {
				instance.container.scroll({ top: 0 });

				// Scroll into view if no part of the container is within the viewport
				const rect = instance.container.getBoundingClientRect();
				if (!fromInit && !(rect.top < window.innerHeight && rect.bottom > 0)) {
					instance.container.scrollIntoView();
				}
			}

			// Handle the display and state of the footer slide control buttons
			const footerBtnGroup = instance.container.querySelector(
				".fmd-footer .fmd-btn-group",
			);
			if (footerBtnGroup) {
				const footerPreviousBtn =
					footerBtnGroup.querySelector(".fmd-previous-btn");
				const footerNextBtn = footerBtnGroup.querySelector(".fmd-next-btn");

				// Reset first
				footerBtnGroup.classList.remove("fmd-d-none");
				footerPreviousBtn.disabled = false;
				footerNextBtn.disabled = false;

				// Disable previous button for first slide
				// Hide both for end slide
				if (slide.classList.contains("fmd-first-slide")) {
					footerPreviousBtn.disabled = true;
				} else if (slide.classList.contains("fmd-end-slide")) {
					footerBtnGroup.classList.add("fmd-d-none");
				}

				// Also disable previous button if slide contains the specific attribute
				if (slide.hasAttribute("data-fmd-disable-prev-btn")) {
					footerPreviousBtn.disabled = true;
				}
			}

			// Autofocus (if applicable)
			if (!fromInit || (fromInit && instance.options.isFullPage)) {
				if (instance.state.settings.autofocus === "all-slides") {
					const elemToAutofocus = slide.querySelector(
						"input.fmd-form-str-input, textarea.fmd-form-str-input, input.fmd-form-num-input, select.fmd-form-str-select, input.fmd-form-str-check-input, input.fmd-form-num-check-input, input.fmd-form-datetime-input, input.fmd-form-file-input",
					);
					if (elemToAutofocus) {
						elemToAutofocus.focus();
					}
				} else {
					const elemToAutofocus = slide.querySelector("[data-fmd-autofocus]");
					if (elemToAutofocus) {
						elemToAutofocus.focus();
					}
				}
			}

			// Set heights of <textarea> elements (in case of default values)
			slide
				.querySelectorAll("textarea.fmd-form-str-input")
				.forEach((textarea) => {
					instance.setTextareaHeight(textarea);
				});
		}, instance.getSlideTransitionDuration() * 2);
	};

	/**
	 * Fade out active slide and fade in next slide. The timeouts make sure that
	 * the animations work properly.
	 *
	 * @param {HTMLElement} activeSlide
	 * @param {HTMLElement} nextSlide
	 */
	fadeInNextSlide = (activeSlide, nextSlide) => {
		const instance = this;

		const rootElem = instance.container.querySelector(".fmd-root");
		rootElem.classList.add("fmd-during-slide-transition");
		activeSlide.classList.add("fmd-fade-out-to-top");
		setTimeout(function () {
			activeSlide.classList.remove("fmd-slide-active");
			nextSlide.classList.add("fmd-fade-in-from-bottom");
			nextSlide.classList.add("fmd-slide-active");
			setTimeout(function () {
				nextSlide.classList.remove("fmd-fade-in-from-bottom");
				activeSlide.classList.remove("fmd-fade-out-to-top");
				setTimeout(function () {
					rootElem.classList.remove("fmd-during-slide-transition");

					// RESET BUTTON PROCESSING STATE AFTER TRANSITION COMPLETES
					// This ensures the new slide starts with clean, enabled buttons
					instance.resetButtonProcessingState();
				}, instance.getSlideTransitionDuration());
			}, instance.getSlideTransitionDuration());
		}, instance.getSlideTransitionDuration());
	};

	/**
	 * Fade out active slide and fade in previous slide. The timeouts make sure
	 * that the animations work properly.
	 *
	 * @param {HTMLElement} activeSlide
	 * @param {HTMLElement} prevSlide
	 */
	fadeInPrevSlide = (activeSlide, prevSlide) => {
		const instance = this;

		const rootElem = instance.container.querySelector(".fmd-root");
		rootElem.classList.add("fmd-during-slide-transition");
		activeSlide.classList.add("fmd-fade-out-to-bottom");
		setTimeout(function () {
			activeSlide.classList.remove("fmd-slide-active");
			prevSlide.classList.add("fmd-fade-in-from-top");
			prevSlide.classList.add("fmd-slide-active");
			setTimeout(function () {
				prevSlide.classList.remove("fmd-fade-in-from-top");
				activeSlide.classList.remove("fmd-fade-out-to-bottom");
				setTimeout(function () {
					rootElem.classList.remove("fmd-during-slide-transition");

					// RESET BUTTON PROCESSING STATE AFTER TRANSITION COMPLETES
					// This ensures the restored slide starts with clean, enabled buttons
					instance.resetButtonProcessingState();
				}, instance.getSlideTransitionDuration());
			}, instance.getSlideTransitionDuration());
		}, instance.getSlideTransitionDuration());
	};

	/**
	 * Disable all clicks. This is added when the slide transition starts, and
	 * removed after the slide transition has ended (or if there is an error).
	 *
	 * @param {MouseEvent} e
	 */
	disableAllClicks = (e) => {
		e.stopPropagation();
		e.preventDefault();
		return false;
	};

	/**
	 * Get error messages from the JSON response received during form submission.
	 * By default, it is assumed that the errors in the response will use the
	 * OpenAPI format. However, this function can be overridden to make sure
	 * other formats are supported.
	 *
	 * @param {Object} json
	 * @returns {Array.<string>}
	 */
	getSubmissionErrors = (json) => {
		const instance = this;

		const messages = [];
		if (json.errors && Array.isArray(json.errors)) {
			for (const error of json.errors) {
				if (
					error[instance.options.errorFieldKey] &&
					error[instance.options.errorMessageKey]
				) {
					messages.push(
						`${error[instance.options.errorFieldKey]}: ${error[instance.options.errorMessageKey]}`,
					);
				} else if (error[instance.options.errorMessageKey]) {
					messages.push(error[instance.options.errorMessageKey]);
				}
			}
		}
		return messages;
	};

	/**
	 * Called when the user reaches the end slide. This function can be
	 * overridden to do something when the user reaches completion.
	 *
	 * @param {Object} json
	 */
	onCompletion = (json) => {};

	/**
	 * Go to the next slide.
	 *
	 * @param {HTMLElement} activeSlide
	 */
	nextSlide = (activeSlide) => {
		const instance = this;

		// Disable all clicks on root element
		const rootElem = instance.container.querySelector(".fmd-root");
		rootElem.addEventListener("click", instance.disableAllClicks, true);

		// Set CTA button and footer previous and next buttons to processing
		const ctaBtn =
			activeSlide.querySelector(".fmd-submit-btn") ||
			activeSlide.querySelector(".fmd-next-btn");

		instance.setBtnProcessing(ctaBtn);
		const footerPreviousBtn = instance.container.querySelector(
			".fmd-footer .fmd-previous-btn",
		);
		if (footerPreviousBtn) {
			instance.setBtnProcessing(footerPreviousBtn);
		}
		const footerNextBtn = instance.container.querySelector(
			".fmd-footer .fmd-next-btn",
		);
		if (footerNextBtn) {
			instance.setBtnProcessing(footerNextBtn);
		}

		// Validate form (if active slide is <form> element)
		if (activeSlide.tagName === "FORM") {
			// Form is not valid
			if (!instance.formValid(activeSlide)) {
				// Remove all buttons from their processing states
				instance.container
					.querySelectorAll(".fmd-btn-processing")
					.forEach((btn) => {
						instance.removeBtnProcessing(btn);
					});

				// Enable all clicks on root element
				rootElem.removeEventListener("click", instance.disableAllClicks, true);

				return;
			}
		} else {
			// Remove all slide errors (reset)
			instance.removeSlideErrors(activeSlide);
		}

		// Get current form data for submission
		const currentFormData = instance.getCurrentFormData(
			activeSlide,
			instance.state.currentQuestion,
		);

		// Store user response in lifecycle state
		if (currentFormData && instance.state.currentQuestion) {
			instance.state.lifecycle.userResponses.set(
				instance.state.currentQuestion.questionId,
				currentFormData,
			);
		}

		// Check if we've already submitted this response to prevent duplicate submissions
		if (currentFormData && instance.state.currentQuestion) {
			const questionId = instance.state.currentQuestion.questionId;
			const existingResponse = instance.state.lifecycle.userResponses.get(questionId);
			if (existingResponse && existingResponse.submitted) {
				console.log(`🔍 Response already submitted for question ${questionId}, skipping API call`);
				return; // Skip API call if already submitted
			}
		}

		// Get the next question from API
		instance
			.getNextQuestionFromAPI(currentFormData)
			.then((nextSlideData) => {
				// Mark response as submitted after successful API call
				if (currentFormData && instance.state.currentQuestion) {
					const questionId = instance.state.currentQuestion.questionId;
					const response = instance.state.lifecycle.userResponses.get(questionId);
					if (response) {
						response.submitted = true;
						instance.state.lifecycle.userResponses.set(questionId, response);
					}
				}
				// Check if we have a next slide definition
				if (!nextSlideData.slideDefinition) {
					// Survey completed - check if we should show an end slide
					if (nextSlideData.isEndSlide) {
						// Create end slide for survey completion
						const endSlideData = {
							type: "end",
							title: "Survey Completed",
							content: "Thank you for completing the survey!",
							buttonText: "Restart Survey"
						};
						
						const endSlide = instance.createQuestionLifecycle(
							endSlideData,
							null, // No slide definition for end slide
							true, // isEndSlide
							"end"
						);
						
						// Handle the end slide directly without calling handleNextSlideSuccess
						// to avoid duplicate processing
						instance.fadeInNextSlide(activeSlide, endSlide);
						
						// Handle the new active slide after transition completes
						setTimeout(() => {
							instance.hasNewActiveSlide(
								endSlide,
								nextSlideData.progress?.currentQuestion || 1,
								false,
							);
						}, instance.getSlideTransitionDuration() * 3);
						
						// Call completion function
						setTimeout(() => {
							instance.onCompletion({ success: true });
						}, instance.getSlideTransitionDuration() * 3);
						
						return;
					} else {
						// Survey completed but no end screen configured - just call completion
						instance.onCompletion({ success: true });
						
						// Remove all buttons from their processing states
						instance.container
							.querySelectorAll(".fmd-btn-processing")
							.forEach((btn) => {
								instance.removeBtnProcessing(btn);
							});

						// Enable all clicks on root element
						rootElem.removeEventListener(
							"click",
							instance.disableAllClicks,
							true,
						);
						
						return;
					}
				}

				// Detect slide type from API response
				const slideType = nextSlideData.question.slideType || "question";
				instance.state.lifecycle.currentSlideType = slideType;

				// Check if this is the last question based on progress data
				const isLastQuestion =
					nextSlideData.progress?.isLastQuestion ||
					nextSlideData.progress?.currentQuestion >=
						nextSlideData.progress?.totalQuestions;

				// Add to question path if it's a new question (not welcome/end)
				if (
					slideType === "question" &&
					nextSlideData.question &&
					nextSlideData.question.questionId
				) {
					instance.state.lifecycle.questionPath.push(
						nextSlideData.question.questionId,
					);
					instance.state.lifecycle.currentQuestionIndex =
						instance.state.lifecycle.questionPath.length - 1;
				}

				// Create the next slide with lifecycle management
				const nextSlide = instance.createQuestionLifecycle(
					nextSlideData.question,
					nextSlideData.slideDefinition,
					nextSlideData.isEndSlide,
					slideType,
					nextSlideData.progress?.isLastQuestion || false,
				);

				// Update the current question data in state
				instance.state.currentQuestion = nextSlideData.question;
				instance.state.lifecycle.currentQuestion = nextSlideData.question;

				// Store progress data from API response
				instance.state.progress = nextSlideData.progress;

				// Continue with the rest of the process
				instance.handleNextSlideSuccess(activeSlide, nextSlide, nextSlideData);
			})
			.catch((error) => {
				console.error("❌ Error getting next question:", error);

				// Add error to the slide
				instance.addSlideError(activeSlide, ctaBtn, [
					"Failed to load next question. Please try again.",
				]);

				// Remove all buttons from their processing states
				instance.container
					.querySelectorAll(".fmd-btn-processing")
					.forEach((btn) => {
						instance.removeBtnProcessing(btn);
					});

				// Enable all clicks on root element
				rootElem.removeEventListener("click", instance.disableAllClicks, true);
			});

		return; // Exit early since we're handling the async flow
	};

	/**
	 * Handle successful next slide creation
	 *
	 * @param {HTMLElement} activeSlide
	 * @param {HTMLElement} nextSlide
	 * @param {Object} nextSlideData
	 */
	handleNextSlideSuccess = (activeSlide, nextSlide, nextSlideData) => {
		const instance = this;
		const rootElem = instance.container.querySelector(".fmd-root");

		// Skip postFormData in API-driven mode since we already handled the API call
		if (instance.options.isApiDriven) {
			// If next slide is the end slide: remove response id, remove form
			// data from local storage, and redirect (if applicable)
			if (nextSlideData.isEndSlide) {
				instance.removeResponseId();
				instance.removeSavedFormData();
				const redirect = nextSlide.getAttribute("data-fmd-redirect");
				if (redirect) {
					window.location.href = redirect;
					return;
				}
			}

			// Fade in next slide
			instance.fadeInNextSlide(activeSlide, nextSlide);

			// Handle the new active slide
			instance.hasNewActiveSlide(
				nextSlide,
				nextSlideData.progress?.currentQuestion || 1,
				false,
			);

			// Call the on completion function if end slide
			if (nextSlideData.isEndSlide) {
				setTimeout(function () {
					instance.onCompletion({ success: true });
				}, instance.getSlideTransitionDuration() * 3);
			}
			return;
		}

		// Traditional mode - POST form data
		const postCondition =
			instance.state.settings.page === "form-slides" &&
			(activeSlide.hasAttribute("data-fmd-post") || nextSlideData.isEndSlide)
				? true
				: false;
		instance
			.postFormData(postCondition, nextSlideData.isEndSlide)
			.then((promiseResult) => {
				// Success
				if (promiseResult.ok) {
					// If next slide is the end slide: remove response id, remove form
					// data from local storage, and redirect (if applicable)
					if (nextSlideData.isEndSlide) {
						instance.removeResponseId();
						instance.removeSavedFormData();
						const redirect = nextSlide.getAttribute("data-fmd-redirect");
						if (redirect) {
							window.location.href = redirect;
							return;
						}
					}

					// Fade in next slide
					instance.fadeInNextSlide(activeSlide, nextSlide);

					// Handle the new active slide
					instance.hasNewActiveSlide(
						nextSlide,
						nextSlideData.progress?.currentQuestion || 1,
						false,
					);
				}
				// Error
				else {
					// Add error
					let errorMessages = [];
					try {
						errorMessages = instance.getSubmissionErrors(promiseResult.json);
					} catch (error) {
						console.error(error);
					}
					instance.addSlideError(activeSlide, ctaBtn, errorMessages);
				}

				// Button processing state is now reset in fadeInNextSlide after transition completes
				// Call the on completion function if end slide
				if (nextSlideData.isEndSlide) {
					setTimeout(function () {
						instance.onCompletion(promiseResult.json);
					}, instance.getSlideTransitionDuration() * 3);
				}
			});
	};

	/**
	 * Go to the previous slide using lifecycle management.
	 *
	 * @param {HTMLElement} activeSlide
	 */
	prevSlide = (activeSlide) => {
		const instance = this;
		const { lifecycle } = instance.state;

		// Check if we can go back
		const previousIndex = lifecycle.currentQuestionIndex - 1;
		if (previousIndex < 0) {
			console.error("Cannot go back - already at first question");
			return;
		}

		// Disable all clicks on root element
		const rootElem = instance.container.querySelector(".fmd-root");
		rootElem.addEventListener("click", instance.disableAllClicks, true);

		// Set CTA button and footer previous and next buttons to processing
		const ctaBtn =
			activeSlide.querySelector(".fmd-submit-btn") ||
			activeSlide.querySelector(".fmd-next-btn");
		instance.setBtnProcessing(ctaBtn);
		const footerPreviousBtn = instance.container.querySelector(
			".fmd-footer .fmd-previous-btn",
		);
		if (footerPreviousBtn) {
			instance.setBtnProcessing(footerPreviousBtn);
		}
		const footerNextBtn = instance.container.querySelector(
			".fmd-footer .fmd-next-btn",
		);
		if (footerNextBtn) {
			instance.setBtnProcessing(footerNextBtn);
		}

		// Use lifecycle navigation
		instance.navigateToQuestion(previousIndex).then(() => {
			// Remove all buttons from their processing states
			instance.container
				.querySelectorAll(".fmd-btn-processing")
				.forEach((btn) => {
					instance.removeBtnProcessing(btn);
				});

			// Enable all clicks on root element
			// Timeout makes sure that the slide animation has completed
			setTimeout(function () {
				rootElem.removeEventListener("click", instance.disableAllClicks, true);
			}, instance.getSlideTransitionDuration() * 3);
		});
	};

	/**
	 * Copy code to clipboard. The code block (<pre> element) closest to the
	 * copy button is the target.
	 *
	 * @param {MouseEvent} e
	 */
	copyCode = (e) => {
		const instance = this;

		e.preventDefault();
		const copyBtn = e.target;
		const codeBlock = copyBtn.closest(".fmd-code-wrapper").querySelector("pre");

		// Copy code to clipboard
		const range = document.createRange();
		range.selectNode(codeBlock);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
		document.execCommand("copy");
		window.getSelection().removeAllRanges();

		// Show confirmation
		copyBtn.innerHTML = getTranslation(
			instance.state.settings.localization,
			"copy-btn-success",
		);

		// Hide confirmation after 2 seconds
		setTimeout(function () {
			copyBtn.innerHTML = getTranslation(
				instance.state.settings.localization,
				"copy-btn",
			);
		}, 2000);
	};

	/**
	 * Add all the event listeners.
	 *
	 * @param {HTMLElement} container
	 * @param {boolean} fromInit
	 */
	addEventListeners = (container, fromInit) => {
		const instance = this;

		console.log(
			"🔘 DEBUG: addEventListeners called with container:",
			container,
		);

		if (fromInit) {
			// Blur header when scrolling over content
			// This is done only for full page (header is always blurred inline)
			const header = instance.container.querySelector(".fmd-header");
			if (header && instance.options.isFullPage) {
				const pageProgress =
					instance.container.querySelector(".fmd-page-progress");
				const pageProgressHeight = pageProgress ? pageProgress.offsetHeight : 0;
				const heightToBlur = (pageProgressHeight + header.offsetHeight) / 3;
				window.addEventListener(
					"scroll",
					function () {
						if (window.scrollY > heightToBlur) {
							header.classList.add("fmd-header-bg-blur");
						} else {
							header.classList.remove("fmd-header-bg-blur");
						}
					},
					false,
				);
			}

			// Toggle color scheme button
			instance.container
				.querySelectorAll(".fmd-toggle-color-scheme-btn")
				.forEach((btn) => {
					btn.addEventListener("click", instance.toggleColorScheme);
				});

			// Footer previous button
			instance.container
				.querySelectorAll(".fmd-footer .fmd-previous-btn")
				.forEach((btn) => {
					btn.addEventListener("click", function (e) {
						if (!btn.classList.contains("fmd-btn-processing")) {
							const activeSlide =
								instance.container.querySelector(".fmd-slide-active");
							instance.prevSlide(activeSlide);
						}
					});
				});

			// Footer next button
			instance.container
				.querySelectorAll(".fmd-footer .fmd-next-btn")
				.forEach((btn) => {
					btn.addEventListener("click", function (e) {
						if (!btn.classList.contains("fmd-btn-processing")) {
							const activeSlide =
								instance.container.querySelector(".fmd-slide-active");
							if (activeSlide.tagName === "FORM") {
								activeSlide.querySelector(".fmd-submit-btn").click();
							} else {
								instance.nextSlide(activeSlide);
							}
						}
					});
				});

			// Restart buttons
			instance.container.querySelectorAll(".fmd-restart-btn").forEach((btn) => {
				btn.addEventListener("click", function (e) {
					if (instance.options.isFullPage) {
						window.location.reload();
					} else {
						instance._init(false);
					}
				});
			});
		}

		// <form> submit - ALWAYS add these listeners (not just on init)
		let forms = container.querySelectorAll("form");
		// If the container itself is a form, include it
		if (container.tagName === "FORM") {
			forms = [container, ...forms];
		}

		forms.forEach((form, index) => {
			form.addEventListener("submit", function (e) {
				e.preventDefault();

				instance.nextSlide(e.target);
			});
		});

		// Slide next buttons - ALWAYS add these listeners (not just on init)
		const nextButtons = container.querySelectorAll(".fmd-slide .fmd-next-btn");
		console.log(
			"🔘 DEBUG: Found next buttons for event listeners:",
			nextButtons.length,
		);
		nextButtons.forEach((btn, index) => {
			console.log(
				`🔘 DEBUG: Adding click listener to next button ${index}:`,
				btn,
			);
			btn.addEventListener("click", function (e) {
				if (!btn.classList.contains("fmd-btn-processing")) {
					const parentSlide = btn.closest(".fmd-slide");
					instance.nextSlide(parentSlide);
				}
			});
		});

		// Welcome screen buttons - use direct API call
		const welcomeButtons = container.querySelectorAll(".fmd-welcome-btn");
		console.log(
			"🔘 DEBUG: Found welcome buttons for event listeners:",
			welcomeButtons.length,
		);
		welcomeButtons.forEach((btn, index) => {
			console.log(
				`🔘 DEBUG: Adding click listener to welcome button ${index}:`,
				btn,
			);
			btn.addEventListener("click", async function (e) {
				// Disable the button to prevent multiple clicks
				btn.disabled = true;

				// For welcome screens, send current question ID with "started" value
				const welcomeData = {
					value: "started",
					questionId: instance.state.currentQuestion?.questionId,
				};

				try {
					// Get next question from API
					const nextQuestionData =
						await instance.getNextQuestionFromAPI(welcomeData);

					// Process the response and create next slide
					if (nextQuestionData.question && nextQuestionData.slideDefinition) {
						instance.processQuestionResponse(nextQuestionData);
					} else {
						console.error("❌ No valid question data received from API");
						btn.disabled = false; // Re-enable button on error
					}
				} catch (error) {
					console.error("❌ Error getting next question:", error);
					btn.disabled = false; // Re-enable button on error
				}
			});
		});

		// End screen buttons - ALWAYS add these listeners
		const endButtons = container.querySelectorAll(".fmd-end-btn");
		console.log(
			"🔘 DEBUG: Found end buttons for event listeners:",
			endButtons.length,
		);
		endButtons.forEach((btn, index) => {
			console.log(
				`🔘 DEBUG: Adding click listener to end button ${index}:`,
				btn,
			);
			btn.addEventListener("click", function (e) {
				instance.handleEndNavigation();
			});
		});

		// Copy buttons
		container.querySelectorAll(".fmd-copy-btn").forEach((btn) => {
			btn.addEventListener("click", instance.copyCode);
		});

		// <input> elements
		container
			.querySelectorAll(
				"input.fmd-form-str-input, input.fmd-form-num-input, input.fmd-form-str-check-input, input.fmd-form-num-check-input, input.fmd-form-datetime-input, input.fmd-form-file-input",
			)
			.forEach((input) => {
				if (
					input.getAttribute("type") === "text" ||
					input.getAttribute("type") === "email" ||
					input.getAttribute("type") === "url" ||
					input.getAttribute("type") === "tel"
				) {
					input.addEventListener("input", instance.textFieldOnInput);
				} else if (input.getAttribute("type") === "number") {
					input.addEventListener("input", instance.numberFieldOnInput);
				} else if (
					input.getAttribute("type") === "radio" ||
					input.getAttribute("type") === "checkbox"
				) {
					if (input.classList.contains("fmd-form-str-check-input")) {
						input.addEventListener("input", instance.choiceFieldOnInput);
					} else if (input.classList.contains("fmd-form-num-check-input")) {
						input.addEventListener("input", instance.numChoiceFieldOnInput);
					}
				} else if (
					input.getAttribute("type") === "datetime-local" ||
					input.getAttribute("type") === "date" ||
					input.getAttribute("type") === "time"
				) {
					input.addEventListener("input", instance.datetimeFieldOnInput);
				} else if (input.getAttribute("type") === "file") {
					input.addEventListener("change", instance.fileFieldOnInput);
				}
			});

		// <textarea> elements
		container
			.querySelectorAll("textarea.fmd-form-str-input")
			.forEach((textarea) => {
				textarea.addEventListener("input", instance.textFieldOnInput);
				textarea.addEventListener("input", instance.setTextareaHeightOnInput);
			});

		// <select> elements
		container
			.querySelectorAll("select.fmd-form-str-select")
			.forEach((select) => {
				select.addEventListener("input", instance.selectFieldOnInput);
			});

		// File input reset buttons
		container.querySelectorAll(".fmd-form-file-reset-btn").forEach((btn) => {
			btn.addEventListener("click", instance.fileInputResetBtnOnClick);
		});
	};

	/**
	 * Load the Google reCAPTCHA v3 script asynchronously.
	 */
	loadRecaptchaScript = () => {
		const instance = this;

		if (!instance.options.recaptcha.siteKey || window.grecaptcha) {
			return;
		}

		// Return if script already loaded
		const scriptId = `captcha-${instance.options.recaptcha.siteKey}`;
		if (document.getElementById(scriptId)) {
			return;
		}

		// Load script
		const script = document.createElement("script");
		script.setAttribute("id", scriptId);
		script.src = `https://www.google.com/recaptcha/api.js?render=${instance.options.recaptcha.siteKey}&badge=${instance.options.recaptcha.badgePosition}`;
		document.head.appendChild(script);

		// Hide badge if needed
		if (instance.options.recaptcha.hideBadge) {
			const styleSheet = document.createElement("style");
			styleSheet.textContent = ".grecaptcha-badge { visibility: hidden; }";
			document.head.appendChild(styleSheet);
		}
	};

	/**
	 * Initialize settings, set data defined in the template, fetch and set data
	 * from remote source, and create the templates.
	 *
	 * @param {boolean} isFirstInit
	 */
	_init = (isFirstInit) => {
		const instance = this;

		// Load Google reCAPTCHA script if site key provided
		if (isFirstInit && instance.options.recaptcha.siteKey) {
			instance.loadRecaptchaScript();
		}

		// Set the state to defaults
		instance.setStateToDefaults();

		// Check if we have API configuration
		if (instance.options.isApiDriven && instance.options.surveyId) {
			instance.initializeWithApiConfig({
				surveyId: instance.options.surveyId,
				apiBaseUrl: instance.options.apiBaseUrl || "http://localhost:3000",
			});
			return; // Skip traditional initialization for API-driven mode
		} else {
			// Initialize from API instead of static template
			instance.initializeFromAPI();
		}

		// Add the root and body in case of inline
		if (!instance.options.isFullPage) {
			let rootElemClass = "fmd-root fmd-root-inline";
			let rootElemStyle = "";

			// Handle padding inline bottom
			rootElemClass += " fmd-pb-custom";
			rootElemStyle += ` --fmd-content-padding-bottom-custom: ${instance.options.paddingInlineBottom}px;`;
			if (instance.options.paddingInlineBottom === 0) {
				rootElemClass += " fmd-pb-0";
			}

			// Handle padding inline horizontal
			rootElemClass += " fmd-px-custom";
			rootElemStyle += ` --fmd-content-padding-x-custom: ${instance.options.paddingInlineHorizontal}px;`;
			if (instance.options.paddingInlineHorizontal === 0) {
				rootElemClass += " fmd-px-0";
			}

			// Handle padding inline top
			rootElemClass += " fmd-pt-custom";
			rootElemStyle += ` --fmd-content-padding-top-custom: ${instance.options.paddingInlineTop}px;`;
			if (instance.options.paddingInlineTop === 0) {
				rootElemClass += " fmd-pt-0";
			}

			instance.container.innerHTML = [
				"<div",
				'	spellcheck="false"',
				`	class="${rootElemClass}"`,
				`	style="${rootElemStyle}"`,
				`	data-fmd-color-scheme="${instance.state.settings["color-scheme"]}"`,
				`	data-fmd-id="${instance.state.settings.id}"`,
				">",
				'	<div class="fmd-body">',
				"		<noscript>Please turn on JavaScript to see this page.</noscript>",
				'		<div class="fmd-main">',
				'			<div class="fmd-loader-container">',
				'				<div class="fmd-loader-spinner" role="status" aria-label="Loading"></div>',
				"			</div>",
				"		</div>",
				"	</div>",
				"</div>\n",
			].join("\n");
		}

		// Get or create response id
		if (instance.state.settings.page === "form-slides") {
			instance.getOrCreateResponseId();
		}

		// The following is done only for full page (not inline)
		if (instance.options.isFullPage) {
			// Set title and favicon
			if (instance.state.settings.title !== undefined) {
				document.title = instance.state.settings.title;
			}
			if (instance.state.settings.favicon !== undefined) {
				let faviconLink = document.querySelector('link[rel~="icon"]');
				if (!faviconLink) {
					faviconLink = document.createElement("link");
					faviconLink.rel = "icon";
					document.head.appendChild(faviconLink);
				}
				faviconLink.href = instance.state.settings.favicon;
			}

			// Swap out the main CSS stylesheet in case of RTL
			const mainStylesheetLink = document.querySelector(
				'link[href$="formsmd.min.css"]',
			);
			if (instance.state.settings.dir === "rtl" && mainStylesheetLink) {
				mainStylesheetLink.setAttribute(
					"href",
					mainStylesheetLink
						.getAttribute("href")
						.replace("formsmd.min.css", "formsmd.rtl.min.css"),
				);
			}
		}

		// Create and add the stylesheet to the <head>
		if (isFirstInit) {
			const stylesheet = document.createElement("style");
			stylesheet.setAttribute("type", "text/css");
			stylesheet.innerText = createStyles(instance.state.settings);
			document.head.appendChild(stylesheet);
		}

		// Add setting if browser is Safari
		try {
			if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
				instance.state.settings.browser = "safari";
			}
		} catch (error) {
			console.error(error);
		}

		// Add the necessary attributes from the settings to the root
		const rootElem = instance.container.querySelector(".fmd-root");
		const rootSettingsAttributesMap = {
			"browser": "data-fmd-browser",
			"button-alignment": "data-fmd-button-alignment",
			"dir": "dir",
			"field-size": "data-fmd-field-size",
			"font-size": "data-fmd-font-size",
			"form-style": "data-fmd-form-style",
			"header": "data-fmd-header",
			"headings": "data-fmd-headings",
			"id": "data-fmd-id",
			"label-style": "data-fmd-label-style",
			"localization": "lang",
			"placeholders": "data-fmd-placeholders",
			"rounded": "data-fmd-rounded",
			"vertical-alignment": "data-fmd-vertical-alignment",
		};
		if (instance.options.setColorSchemeAttrsAgain) {
			rootSettingsAttributesMap["color-scheme"] = "data-fmd-color-scheme";
			rootSettingsAttributesMap["color-scheme-scope"] =
				"data-fmd-color-scheme-scope";
			rootSettingsAttributesMap["color-scheme-toggle"] =
				"data-fmd-color-scheme-toggle";
		}
		for (const [key, value] of Object.entries(instance.state.settings)) {
			if (rootSettingsAttributesMap[key] !== undefined) {
				const attribute = rootSettingsAttributesMap[key];
				rootElem.setAttribute(attribute, value);
			}
		}

		// Set the preferred color scheme
		// This is done here again in case we are re-setting the "color-scheme"
		// attribute to the root
		if (
			instance.options.setColorSchemeAttrsAgain &&
			instance.state.settings["color-scheme-toggle"] === "show"
		) {
			instance.setPreferredColorScheme();
		}

		// Add the made in loader to the DOM body
		const localization = instance.state.settings.localization;
		nunjucks.configure({ autoescape: false });
		instance.container.querySelector(".fmd-body").innerHTML =
			nunjucks.renderString(madeInLoaderTemplate, {
				settings: instance.state.settings,
				translations: {
					loading: getTranslation(localization, "loading"),
					madeInLoader: getTranslation(localization, "made-in-loader"),
				},
			});

		// Set data defined in the template
		const parsedTemplateAndData = parseDataBlocks(instance.template);
		instance.template = parsedTemplateAndData.template;
		instance.state.data = {
			...instance.state.data,
			...parsedTemplateAndData.data,
		};

		// Fetch data from remote source
		// Then set to state and create the templates
		instance.getRemoteData().then((promiseResult) => {
			// Set fetched data to state
			if (promiseResult !== "") {
				// Create variables for settings needed (for better readability)
				const getFormat = instance.state.settings["get-format"];
				const getObjectsName = instance.state.settings["get-objects-name"];

				// JSON (set response data depending on the format)
				if (getFormat === "json") {
					const promiseResultJSON = JSON.parse(promiseResult);
					if (Array.isArray(promiseResultJSON)) {
						instance.state.data[getObjectsName] = promiseResultJSON;
					} else {
						instance.state.data = {
							...instance.state.data,
							...promiseResultJSON,
						};
					}
				}
				// CSV or TSV
				else {
					// Delimeter is comma by default (as CSV is the default format)
					let delimeter = ",";
					if (getFormat === "tsv") {
						delimeter = "\t";
					}

					// Parse and set response data
					const parsedSpreadsheetData = parseSpreadsheetData(
						promiseResult,
						delimeter,
					);
					instance.state.data = {
						...instance.state.data,
						...parsedSpreadsheetData.dataSpreadsheet,
					};
					instance.state.data[getObjectsName] =
						parsedSpreadsheetData.dataNormalized;
				}
			}

			// Create the body template and add to the DOM
			// The "header-render" and "footer-render" settings are also set here
			// (in the function being called)
			const bodyTemplateAndSettings = createBodyTemplate(
				instance.state.settings,
			);
			const bodyTemplate = bodyTemplateAndSettings.template;
			instance.state.settings = bodyTemplateAndSettings.settings;
			instance.container.querySelector(".fmd-body").innerHTML = bodyTemplate;

			// Hide page progress, header and/or footer (if applicable)
			if (instance.state.settings["page-progress"] === "hide") {
				rootElem.setAttribute("data-fmd-page-progress", "hide");
			}
			if (!instance.state.settings["header-render"]) {
				rootElem.setAttribute("data-fmd-header", "hide");
			}
			if (!instance.state.settings["footer-render"]) {
				rootElem.setAttribute("data-fmd-footer", "hide");
			}

			// Create the content template and add to the DOM
			const contentTemplateAndBindDivs = createContentTemplate(
				instance.template,
				instance.state.settings,
				{
					...instance.state.data,
					...instance.state.formData,
				},
				instance.options.sanitize,
			);
			instance.template = contentTemplateAndBindDivs.template;
			instance.state.bindDivTemplates =
				contentTemplateAndBindDivs.bindDivTemplates;
			instance.container
				.querySelector(".fmd-main-container")
				.insertAdjacentHTML("beforeend", instance.template);

			// Highlight code blocks
			instance.container.querySelectorAll("pre code").forEach((codeBlock) => {
				hljs.highlightElement(codeBlock);
			});

			// Add all the event listeners
			instance.addEventListeners(instance.container, true);

			// Set form data to state
			instance.setFormDataToState();

			// Set form data from URL parameters BEFORE local storage
			if (!instance.options.prioritizeURLFormData) {
				try {
					instance.setFormDataFromURL(false);
				} catch (error) {
					console.error(error);
				}
			}

			// Set form data saved in local storage
			if (instance.options.saveState) {
				try {
					instance.setSavedFormData();
				} catch (error) {
					console.error(error);
				}
			}

			// Set form data from URL parameters AFTER local storage
			if (instance.options.prioritizeURLFormData) {
				try {
					instance.setFormDataFromURL(true);
				} catch (error) {
					console.error(error);
				}
			}

			// Hide loader and show content
			instance.container
				.querySelector(".fmd-loader-container")
				.classList.add("fmd-d-none");
			if (instance.state.settings.page !== "single") {
				const firstSlide =
					instance.container.querySelectorAll(".fmd-slide")[
						instance.options.startSlide
					];
				firstSlide.classList.add("fmd-slide-active");
				instance.hasNewActiveSlide(
					firstSlide,
					instance.options.startSlide,
					true,
				);
			} else {
				instance.container
					.querySelector(".fmd-single")
					.classList.add("fmd-single-active");

				// Set heights of <textarea> elements (in case of default values)
				instance.container
					.querySelectorAll("textarea.fmd-form-str-input")
					.forEach((textarea) => {
						instance.setTextareaHeight(textarea);
					});
			}
		});
	};

	/**
	 * Initialize for the first time.
	 */
	init = () => {
		const instance = this;

		instance._init(true);
	};

	/**
	 * Process question response and create the next slide
	 *
	 * @param {Object} questionData - The question data from API
	 */
	processQuestionResponse = (questionData) => {
		const instance = this;
		const rootElem = instance.container.querySelector(".fmd-root");

		// Check if we have a slide definition
		if (!questionData.slideDefinition) {
			console.error("❌ No slide definition in question data");
			return;
		}

		// Get the current active slide
		const activeSlide = instance.container.querySelector(".fmd-slide-active");
		if (!activeSlide) {
			console.error("❌ No active slide found");
			return;
		}

		// Detect slide type from API response
		const slideType = questionData.question.slideType || "question";
		instance.state.lifecycle.currentSlideType = slideType;

		// Add to question path if it's a new question (not welcome/end)
		if (
			slideType === "question" &&
			questionData.question &&
			questionData.question.questionId
		) {
			instance.state.lifecycle.questionPath.push(
				questionData.question.questionId,
			);
			instance.state.lifecycle.currentQuestionIndex =
				instance.state.lifecycle.questionPath.length - 1;
		}

		// Create the next slide with lifecycle management
		const nextSlide = instance.createQuestionLifecycle(
			questionData.question,
			questionData.slideDefinition,
			questionData.isEndSlide,
			slideType,
		);

		// Update the current question data in state
		instance.state.currentQuestion = questionData.question;
		instance.state.lifecycle.currentQuestion = questionData.question;

		// Use the same fade transition system that works for welcome screens
		// This ensures consistent fade out/in transitions across all slide types
		instance.fadeInNextSlide(activeSlide, nextSlide);

		// Handle the new active slide after transition completes
		setTimeout(() => {
			instance.hasNewActiveSlide(
				nextSlide,
				questionData.progress?.currentQuestion || 1,
				false,
			);
		}, instance.getSlideTransitionDuration() * 3);
	};
}

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string
 * @returns {Object|null} RGB object with r, g, b properties or null if invalid
 */
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

/**
 * Fetch survey data from API
 * @param {string} surveyId - The survey ID
 * @param {string} apiBaseUrl - The API base URL
 * @returns {Promise<Object>} Survey data
 */
async function fetchSurveyData(surveyId, apiBaseUrl) {
	try {
	const response = await fetch(
		`${apiBaseUrl}/public/surveys/${surveyId}`,
	);

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

/**
 * Fetch next question from API
 * @param {string} surveyId - The survey ID
 * @param {string} apiBaseUrl - The API base URL
 * @param {Object} currentResponse - Current question response
 * @returns {Promise<Object>} Next question data
 */
async function fetchNextQuestion(surveyId, apiBaseUrl, currentResponse = null) {
	try {
		// Use persistent session ID stored in localStorage or generate new one
		let sessionId = null;
		try {
			sessionId = localStorage.getItem(`formsmd_session_${surveyId}`);
		} catch (e) {
			// localStorage not available
		}
		
		if (!sessionId) {
			// Generate unique session ID
			sessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
				? crypto.randomUUID() 
				: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			
			// Store in localStorage if available
			try {
				localStorage.setItem(`formsmd_session_${surveyId}`, sessionId);
			} catch (e) {
				// localStorage not available, continue with generated ID
			}
		}
			
		const requestBody = {
			sessionId: sessionId,
		};

		// Add current question response if provided
		if (currentResponse) {
			requestBody.currentQuestionId = currentResponse.questionId;
			requestBody.response = {
				value: currentResponse.value,
				timeSpent: currentResponse.timeSpent || 0,
			};
		}

		const response = await fetch(
			`${apiBaseUrl}/public/surveys/${surveyId}/question`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();

		if (result.success && result.data) {
			const { status, question, progress } = result.data;

			if (status === "question" && question) {
				const slideDefinition = convertAPIQuestionToSlideDefinition(question);
				const isEndSlide = false; // Only true for actual end slides, not last questions

				return {
					question: question,
					slideDefinition: slideDefinition,
					isEndSlide: isEndSlide,
					progress: progress,
				};
			} else if (status === "completed") {
				return {
					question: null,
					slideDefinition: null,
					isEndSlide: progress?.isLastQuestion || false, // Use progress data to determine if end screen should be shown
					progress: progress,
				};
			}
		}

		throw new Error("Invalid API response format");
	} catch (error) {
		console.error("❌ Error fetching next question:", error);
		throw error;
	}
}

/**
 * Convert API question to slide definition format
 * @param {Object} question - The question object from API
 * @returns {string} slide definition in markdown format
 */
function convertAPIQuestionToSlideDefinition(question) {
	// Map API question types to FormsMD field types (FormsMD expects lowercase, no underscores)
	const fieldTypeMap = {
		text_input: "textinput",
		email_input: "emailinput",
		number_input: "numberinput",
		choice_input: "choiceinput",
		rating_input: "ratinginput",
		opinion_scale: "opinionscale",
		datetime_input: "datetimeinput",
		file_input: "fileinput",
		url_input: "urlinput",
		tel_input: "telinput",
	};

	const fieldType = fieldTypeMap[question.type] || "textinput";

	// Build the slide definition
	let slideDefinition = `\n`;

	// Add progress if available
	if (question.order) {
		slideDefinition += `|> ${Math.round((question.order / 5) * 100)}%\n\n`;
	}

	// Build the field definition
	slideDefinition += `${question.questionId}${question.required ? "\\*" : ""} = ${fieldType}(\n`;
	slideDefinition += `| question = ${question.question}\n`;

	// Add field-specific properties
	if (
		question.type === "choice_input" &&
		question.options &&
		question.options.choices
	) {
		const choices = question.options.choices.map((choice) => choice.text);
		slideDefinition += `| choices = ${choices.join(", ")}\n`;
	} else if (question.type === "choice_input" && question.choices) {
		// Fallback for old format
		slideDefinition += `| choices = ${question.choices.join(", ")}\n`;
	}

	if (question.description) {
		slideDefinition += `| description = ${question.description}\n`;
	}

	slideDefinition += `)\n`;

	return slideDefinition;
}

export { Formsmd };
