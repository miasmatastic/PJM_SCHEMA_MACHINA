# PJM_SCHEMA_MACHINA
Schema generator for SEO focused marketing blogs

## About
A JSON-LD schema generator dashboard built with HTML, CSS, and JavaScript. This tool helps you create SEO-optimized JSON-LD schema markup for blogs and websites.

## Features

### Schema Generator Tab
- ✅ Interactive dashboard with checkboxes for multiple schema types:
  - Article/BlogPosting
  - Organization
  - WebSite
  - BreadcrumbList
  - Person/Author
- ✅ Dynamic form fields that appear based on selected schema types
- ✅ Intelligent JSON-LD schema generation from form data
- ✅ Save and load configurations using localStorage for repeated use
- ✅ Copy schema to clipboard functionality
- ✅ Export schema as JSON file

### FAQ Generator Tab
- ✅ Generate FAQ sections from plain text input
- ✅ Outputs Gutenberg WordPress HTML ready for paste into HTML editor
- ✅ Generates JSON-LD FAQ Schema wrapped in script tags
- ✅ Parses Q&A format automatically
- ✅ Copy combined output (HTML + Schema) to clipboard
- ✅ Save output as HTML file
- ✅ Beautiful gradient UI with responsive design

## Usage

### Schema Generator
1. Open `index.html` in a web browser
2. Click on the "Schema Generator" tab
3. Select the schema types you need using checkboxes
4. Fill in the relevant data fields that appear
5. Click "Generate Schema" to create the JSON-LD markup
6. Copy to clipboard or export as a JSON file
7. Save your configuration for future use

### FAQ Generator
1. Open `index.html` in a web browser
2. Click on the "FAQ Generator" tab
3. Enter your FAQ questions and answers in plain text format:
   ```
   Q: Your question here?
   A: Your answer here.
   
   Q: Another question?
   A: Another answer.
   ```
4. Click "Generate FAQ HTML & Schema"
5. Copy the generated HTML and JSON-LD schema to your clipboard
6. Paste into your WordPress Gutenberg editor or save as HTML file

## Technologies
- Pure HTML5
- CSS3 with modern gradients and animations
- Vanilla JavaScript (ES6+)
- localStorage API for configuration management

## Getting Started
Simply open `index.html` in any modern web browser. No build process or dependencies required!
