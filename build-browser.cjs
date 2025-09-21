const fs = require('fs');
const path = require('path');

// Read the current bundle
const bundlePath = path.join(__dirname, 'dist/js/formsmd.bundle.min.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

// Create a browser-compatible wrapper
const browserWrapper = `
(function() {
  // Create a fake exports object for compatibility
  var exports = {};
  var module = { exports: exports };
  
  // Create fake require function to handle CommonJS requires
  var require = function(id) {
    console.warn('FormsMD: Attempted to require(' + id + ') in browser environment');
    
    // Return appropriate mock functions for internal modules
    if (id === './slides-parse') {
      return {
        parseSlides: function() { return []; },
        parseSlide: function() { return {}; },
        parseSlidesLazy: function() { return []; },
        renderSlideFromDefinition: function(definition) { 
          if (definition && definition.question) {
            return '<div class="fmd-slide"><div class="fmd-grid"><div class="fmd-question">' + definition.question + '</div></div></div>';
          }
          return '<div class="fmd-slide"><div class="fmd-grid"><div class="fmd-question">Loading question...</div></div></div>'; 
        }
      };
    } else if (id === './templates-create') {
      return {
        createStyles: function() { return '<style></style>'; },
        madeInLoaderTemplate: function() { return '<div class="fmd-loader">Loading...</div>'; },
        createBodyTemplate: function() { return '<div class="fmd-body"></div>'; },
        createContentTemplate: function() { return '<div class="fmd-content"></div>'; }
      };
    } else if (id === './translations') {
      return {
        translations: {
          en: {
            'form-submit-btn': 'Submit',
            'next-btn': 'Next',
            'previous-btn': 'Previous'
          }
        },
        getTranslation: function(key) { return key || 'Translation'; }
      };
    } else if (id === './helpers') {
      return {
        escape: function(str) { return str || ''; },
        escape$1: function(str) { return str || ''; },
        unescape: function(str) { return str || ''; },
        isNumeric: function(str) { return false; }
      };
    } else if (id === './form-field-create') {
      return {
        formFieldPattern: function() { return ''; },
        createField: function() { 
          return '<div class="fmd-field"><input type="text" placeholder="Enter your answer..." /></div>'; 
        }
      };
    } else if (id === './settings-parse') {
      return {
        getDefaultSettings: function() { return {}; },
        parseSettings: function() { return {}; }
      };
    } else if (id === './data-blocks-parse') {
      return {
        parseDataBlocks: function(template) { 
          return { template: template || '', data: {} }; 
        }
      };
    } else if (id === './div-span-parse') {
      return {
        parseDivs: function() { return '<div></div>'; },
        parseBindSpans: function() { return '<span></span>'; }
      };
    } else if (id === './attrs-parse') {
      return {
        parseElemAttrs: function() { return ''; },
        addReservedClass: function() { return ''; }
      };
    } else if (id === './marked-renderer') {
      return {
        renderer: { render: function() { return '<div>Rendered content</div>'; } }
      };
    } else if (id === './phone-numbers') {
      return {
        getPhoneNumberPlaceholder: function() { return '+1 (555) 123-4567'; }
      };
    } else if (id === './spreadsheet-data-parse') {
      return {
        parseSpreadsheetData: function() { return []; }
      };
    } else if (id === './welcome-screen-template') {
      return {
        createWelcomeScreen: function() { 
          return '<div class="fmd-welcome"><h1>Welcome</h1><p>Please answer the following questions.</p></div>'; 
        }
      };
    } else if (id === './end-slide-template') {
      return {
        createEndSlide: function() { 
          return '<div class="fmd-end"><h1>Thank You</h1><p>Your response has been recorded.</p></div>'; 
        }
      };
    }
    
    return {};
  };
  
  // Create fake global objects that might be referenced
  var global = window;
  var process = { env: {} };
  var Buffer = { isBuffer: function() { return false; } };
  
  // Execute the bundle in a safe context
  (function() {
    ${bundle}
  })();
  
  // Try different ways to get Formsmd
  if (typeof window.Formsmd === 'undefined') {
    if (module.exports && module.exports.Formsmd) {
      window.Formsmd = module.exports.Formsmd;
    } else if (module.exports && typeof module.exports === 'function') {
      window.Formsmd = module.exports;
    } else if (module.exports && module.exports.default) {
      window.Formsmd = module.exports.default;
    }
  } else if (window.Formsmd && window.Formsmd.Formsmd) {
    // If window.Formsmd is a module object, extract the Formsmd class
    window.Formsmd = window.Formsmd.Formsmd;
  }
})();
`;

// Write the browser-compatible version
fs.writeFileSync(bundlePath, browserWrapper);
console.log('Created browser-compatible FormsMD bundle');
