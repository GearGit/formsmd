var path = require("path");

module.exports = {
	mode: "production",
	entry: {
		formsmd: "./src/main.js",
		composer: "./src/composer.js",
	},
	output: {
		filename: "[name].bundle.min.js",
		path: path.resolve(__dirname, "dist/js"),
		library: {
			name: "Formsmd",
			type: "window",
		},
		globalObject: "window",
	},
	optimization: { 
		minimize: true,
		usedExports: false,
		sideEffects: false,
	},
	resolve: {
		fallback: {
			"fs": false,
			"path": false,
			"os": false,
			"crypto": false,
			"stream": false,
			"util": false,
			"buffer": false,
			"process": false,
			"assert": false,
			"url": false,
			"querystring": false,
			"http": false,
			"https": false,
			"zlib": false,
			"events": false,
			"child_process": false,
			"cluster": false,
			"dgram": false,
			"dns": false,
			"domain": false,
			"module": false,
			"net": false,
			"readline": false,
			"repl": false,
			"tls": false,
			"tty": false,
			"vm": false,
			"worker_threads": false
		},
		alias: {
			"./slides-parse": path.resolve(__dirname, "src/slides-parse.js"),
			"./templates-create": path.resolve(__dirname, "src/templates-create.js"),
			"./translations": path.resolve(__dirname, "src/translations.js"),
			"./helpers": path.resolve(__dirname, "src/helpers.js"),
			"./form-field-create": path.resolve(__dirname, "src/form-field-create.js"),
			"./settings-parse": path.resolve(__dirname, "src/settings-parse.js"),
			"./data-blocks-parse": path.resolve(__dirname, "src/data-blocks-parse.js"),
			"./div-span-parse": path.resolve(__dirname, "src/div-span-parse.js"),
			"./attrs-parse": path.resolve(__dirname, "src/attrs-parse.js"),
			"./marked-renderer": path.resolve(__dirname, "src/marked-renderer.js"),
			"./phone-numbers": path.resolve(__dirname, "src/phone-numbers.js"),
			"./spreadsheet-data-parse": path.resolve(__dirname, "src/spreadsheet-data-parse.js"),
			"./welcome-screen-template": path.resolve(__dirname, "src/welcome-screen-template.js"),
			"./end-slide-template": path.resolve(__dirname, "src/end-slide-template.js")
		}
	},
	experiments: {
		outputModule: false
	},
};
