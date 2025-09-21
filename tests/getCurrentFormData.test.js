const { Formsmd } = require("../src/main");

describe("getCurrentFormData", () => {
	let formsmd;
	let container;

	beforeEach(() => {
		// Create a container element
		container = document.createElement("div");
		document.body.appendChild(container);

		// Create minimal template
		const template = `
			#! title = Test form
			#! color-scheme = light
			
			# Test Form
			
			This is a test form.
		`;

		// Initialize Formsmd
		formsmd = new Formsmd(template, container, {
			colorScheme: "light",
			isFullPage: false,
			sanitize: true,
		});

		// Set up the DOM structure for testing
		container.innerHTML = `
			<div class="fmd-root">
				<div class="fmd-main">
					<div class="fmd-main-container">
						<div class="fmd-slide fmd-slide-active">
							<!-- Test content will be added here -->
						</div>
					</div>
				</div>
			</div>
		`;
	});

	afterEach(() => {
		// Clean up
		container.remove();
	});

	describe("Choice Input (Radio) - Single Selection", () => {
		it("should extract single selected radio button value", () => {
			// Create a slide with radio buttons
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<fieldset data-fmd-name="test-question" data-fmd-type="radio">
					<legend>What is your age group?</legend>
					<div class="fmd-form-check">
						<input type="radio" name="test-question" value="18-25" class="fmd-form-str-check-input">
						<label>18-25</label>
					</div>
					<div class="fmd-form-check">
						<input type="radio" name="test-question" value="26-35" class="fmd-form-str-check-input" checked>
						<label>26-35</label>
					</div>
					<div class="fmd-form-check">
						<input type="radio" name="test-question" value="36-45" class="fmd-form-str-check-input">
						<label>36-45</label>
					</div>
				</fieldset>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "choice_input",
				options: {
					multiple: false,
					choices: [
						{ id: "1", text: "18-25", value: "18-25" },
						{ id: "2", text: "26-35", value: "26-35" },
						{ id: "3", text: "36-45", value: "36-45" },
					],
				},
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBe("26-35");
			expect(result.timeSpent).toBeGreaterThan(0);
		});

		it("should return empty string when no radio button is selected", () => {
			// Create a slide with radio buttons (none selected)
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<fieldset data-fmd-name="test-question" data-fmd-type="radio">
					<legend>What is your age group?</legend>
					<div class="fmd-form-check">
						<input type="radio" name="test-question" value="18-25" class="fmd-form-str-check-input">
						<label>18-25</label>
					</div>
					<div class="fmd-form-check">
						<input type="radio" name="test-question" value="26-35" class="fmd-form-str-check-input">
						<label>26-35</label>
					</div>
				</fieldset>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "choice_input",
				options: {
					multiple: false,
					choices: [
						{ id: "1", text: "18-25", value: "18-25" },
						{ id: "2", text: "26-35", value: "26-35" },
					],
				},
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBe("");
		});
	});

	describe("Choice Input (Checkbox) - Multiple Selection", () => {
		it("should extract multiple selected checkbox values as array", () => {
			// Create a slide with checkboxes
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<fieldset data-fmd-name="test-question" data-fmd-type="checkbox">
					<legend>What are your interests?</legend>
					<div class="fmd-form-check">
						<input type="checkbox" name="test-question" value="sports" class="fmd-form-str-check-input" checked>
						<label>Sports</label>
					</div>
					<div class="fmd-form-check">
						<input type="checkbox" name="test-question" value="music" class="fmd-form-str-check-input">
						<label>Music</label>
					</div>
					<div class="fmd-form-check">
						<input type="checkbox" name="test-question" value="reading" class="fmd-form-str-check-input" checked>
						<label>Reading</label>
					</div>
				</fieldset>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "choice_input",
				options: {
					multiple: true,
					choices: [
						{ id: "1", text: "Sports", value: "sports" },
						{ id: "2", text: "Music", value: "music" },
						{ id: "3", text: "Reading", value: "reading" },
					],
				},
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(Array.isArray(result.value)).toBe(true);
			expect(result.value).toContain("sports");
			expect(result.value).toContain("reading");
			expect(result.value).not.toContain("music");
			expect(result.value.length).toBe(2);
		});

		it("should return empty array when no checkbox is selected", () => {
			// Create a slide with checkboxes (none selected)
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<fieldset data-fmd-name="test-question" data-fmd-type="checkbox">
					<legend>What are your interests?</legend>
					<div class="fmd-form-check">
						<input type="checkbox" name="test-question" value="sports" class="fmd-form-str-check-input">
						<label>Sports</label>
					</div>
					<div class="fmd-form-check">
						<input type="checkbox" name="test-question" value="music" class="fmd-form-str-check-input">
						<label>Music</label>
					</div>
				</fieldset>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "choice_input",
				options: {
					multiple: true,
					choices: [
						{ id: "1", text: "Sports", value: "sports" },
						{ id: "2", text: "Music", value: "music" },
					],
				},
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(Array.isArray(result.value)).toBe(true);
			expect(result.value.length).toBe(0);
		});
	});

	describe("Text Input", () => {
		it("should extract text input value", () => {
			// Create a slide with text input
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<div data-fmd-name="test-question">
					<label>What is your name?</label>
					<input type="text" name="test-question" value="John Doe" class="fmd-form-str-input">
				</div>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "text_input",
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBe("John Doe");
		});

		it("should extract textarea value", () => {
			// Create a slide with textarea
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<div data-fmd-name="test-question">
					<label>Tell us about yourself:</label>
					<textarea name="test-question" class="fmd-form-str-input">I am a developer</textarea>
				</div>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "text_input",
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBe("I am a developer");
		});
	});

	describe("Number Input", () => {
		it("should extract number input value as number", () => {
			// Create a slide with number input
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<div data-fmd-name="test-question">
					<label>What is your age?</label>
					<input type="number" name="test-question" value="25" class="fmd-form-num-input">
				</div>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "number_input",
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBe(25);
		});

		it("should return null for empty number input", () => {
			// Create a slide with empty number input
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<div data-fmd-name="test-question">
					<label>What is your age?</label>
					<input type="number" name="test-question" value="" class="fmd-form-num-input">
				</div>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "number_input",
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBeNull();
		});
	});

	describe("Rating Input", () => {
		it("should extract rating input value as number", () => {
			// Create a slide with rating input
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<fieldset data-fmd-name="test-question" data-fmd-type="num-radio">
					<legend>Rate your experience:</legend>
					<input type="radio" name="test-question" value="1" class="fmd-form-num-check-input">
					<input type="radio" name="test-question" value="2" class="fmd-form-num-check-input">
					<input type="radio" name="test-question" value="3" class="fmd-form-num-check-input" checked>
					<input type="radio" name="test-question" value="4" class="fmd-form-num-check-input">
					<input type="radio" name="test-question" value="5" class="fmd-form-num-check-input">
				</fieldset>
			`;

			const originalQuestion = {
				questionId: "test-question",
				type: "rating_input",
			};

			const result = formsmd.getCurrentFormData(activeSlide, originalQuestion);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBe(3);
		});
	});

	describe("Fallback to DOM-based type detection", () => {
		it("should detect choice input type from DOM when original question is not provided", () => {
			// Create a slide with radio buttons
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<fieldset data-fmd-name="test-question" data-fmd-type="radio">
					<legend>What is your age group?</legend>
					<div class="fmd-form-check">
						<input type="radio" name="test-question" value="18-25" class="fmd-form-str-check-input" checked>
						<label>18-25</label>
					</div>
				</fieldset>
			`;

			// Don't provide originalQuestion to test DOM-based detection
			const result = formsmd.getCurrentFormData(activeSlide, null);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBe("18-25");
		});

		it("should detect text input type from DOM when original question is not provided", () => {
			// Create a slide with text input
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<div data-fmd-name="test-question">
					<label>What is your name?</label>
					<input type="text" name="test-question" value="John Doe" class="fmd-form-str-input">
				</div>
			`;

			// Don't provide originalQuestion to test DOM-based detection
			const result = formsmd.getCurrentFormData(activeSlide, null);

			expect(result).toBeDefined();
			expect(result.questionId).toBe("test-question");
			expect(result.value).toBe("John Doe");
		});
	});

	describe("Error handling", () => {
		it("should return null when no form field is found", () => {
			// Create a slide without any form fields
			const activeSlide = container.querySelector(".fmd-slide");
			activeSlide.innerHTML = `
				<div>
					<h1>Welcome to the survey</h1>
					<p>No form fields here</p>
				</div>
			`;

			const result = formsmd.getCurrentFormData(activeSlide, null);

			expect(result).toBeNull();
		});
	});
});
