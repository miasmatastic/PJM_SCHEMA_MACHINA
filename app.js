// Schema Generator Application
class SchemaGenerator {
    constructor() {
        this.schemas = [];
        this.init();
    }

    init() {
        // Bind event listeners
        this.bindCheckboxListeners();
        this.bindGenerateButton();
        this.bindCopyButton();
        this.bindExportButton();
        this.bindConfigButtons();
        this.loadSavedConfigurations();
        this.bindTabNavigation();
        this.bindFAQGenerator();
    }

    // Tab Navigation
    bindTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button
                button.classList.add('active');

                // Show corresponding tab content
                const tabId = button.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }

    // FAQ Generator Functionality
    bindFAQGenerator() {
        const generateBtn = document.getElementById('generate-faq-btn');
        const copyBtn = document.getElementById('copy-faq-btn');
        const saveBtn = document.getElementById('save-faq-btn');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateFAQ();
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyFAQOutput();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveFAQOutput();
            });
        }
    }

    generateFAQ() {
        const input = document.getElementById('faq-input').value.trim();
        
        if (!input) {
            this.showErrorMessage('Please enter FAQ questions and answers');
            return;
        }

        // Parse FAQ input
        const faqs = this.parseFAQInput(input);
        
        if (faqs.length === 0) {
            this.showErrorMessage('No valid FAQ questions found. Please use the format:\nQ: Question?\nA: Answer.');
            return;
        }

        // Generate HTML for Gutenberg WordPress
        const html = this.generateGutenbergHTML(faqs);
        
        // Generate JSON-LD FAQ Schema
        const schema = this.generateFAQSchema(faqs);

        // Display outputs
        document.getElementById('faq-html-output').value = html;
        document.getElementById('faq-schema-output').value = schema;

        this.showSuccessMessage(`Generated ${faqs.length} FAQ item(s) successfully!`);
    }

    parseFAQInput(input) {
        const faqs = [];
        const lines = input.split('\n');
        let currentQuestion = '';
        let currentAnswer = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if line starts with Q: or Question:
            if (line.match(/^Q:|^Question:/i)) {
                // If we have a previous Q&A pair, save it
                if (currentQuestion && currentAnswer) {
                    faqs.push({
                        question: currentQuestion.trim(),
                        answer: currentAnswer.trim()
                    });
                }
                // Start new question
                currentQuestion = line.replace(/^Q:|^Question:/i, '').trim();
                currentAnswer = '';
            }
            // Check if line starts with A: or Answer:
            else if (line.match(/^A:|^Answer:/i)) {
                currentAnswer = line.replace(/^A:|^Answer:/i, '').trim();
            }
            // Continuation of answer (multi-line)
            else if (line && currentQuestion && currentAnswer) {
                currentAnswer += ' ' + line;
            }
        }

        // Add the last Q&A pair
        if (currentQuestion && currentAnswer) {
            faqs.push({
                question: currentQuestion.trim(),
                answer: currentAnswer.trim()
            });
        }

        return faqs;
    }

    generateGutenbergHTML(faqs) {
        let html = '<!-- wp:group {"className":"faq-section"} -->\n';
        html += '<div class="wp-block-group faq-section">\n\n';

        faqs.forEach((faq, index) => {
            html += `  <!-- wp:group {"className":"faq-item"} -->\n`;
            html += `  <div class="wp-block-group faq-item">\n`;
            html += `    <div class="faq-question">\n`;
            html += `      <strong>${this.escapeHTML(faq.question)}</strong>\n`;
            html += `    </div>\n`;
            html += `    <div class="faq-answer">\n`;
            html += `      <p>${this.escapeHTML(faq.answer)}</p>\n`;
            html += `    </div>\n`;
            html += `  </div>\n`;
            html += `  <!-- /wp:group -->\n`;
            if (index < faqs.length - 1) {
                html += '\n';
            }
        });

        html += '\n</div>\n';
        html += '<!-- /wp:group -->';

        return html;
    }

    generateFAQSchema(faqs) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };

        const schemaJSON = JSON.stringify(schema, null, 2);
        return `<script type="application/ld+json">\n${schemaJSON}\n</script>`;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyFAQOutput() {
        const htmlOutput = document.getElementById('faq-html-output').value;
        const schemaOutput = document.getElementById('faq-schema-output').value;
        
        if (!htmlOutput || !schemaOutput) {
            this.showErrorMessage('Please generate FAQ output first');
            return;
        }

        const combinedOutput = `${htmlOutput}\n\n${schemaOutput}`;
        
        navigator.clipboard.writeText(combinedOutput).then(() => {
            this.showSuccessMessage('FAQ HTML and Schema copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showErrorMessage('Unable to copy to clipboard. Please try selecting and copying the text manually.');
        });
    }

    saveFAQOutput() {
        const htmlOutput = document.getElementById('faq-html-output').value;
        const schemaOutput = document.getElementById('faq-schema-output').value;
        
        if (!htmlOutput || !schemaOutput) {
            this.showErrorMessage('Please generate FAQ output first');
            return;
        }

        const combinedOutput = `${htmlOutput}\n\n${schemaOutput}`;
        
        const blob = new Blob([combinedOutput], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'faq-output.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('FAQ output saved successfully!');
    }

    // Bind checkbox listeners to show/hide form fields
    bindCheckboxListeners() {
        const schemaTypeToFieldsMap = {
            'Article': 'article-fields',
            'Organization': 'organization-fields',
            'WebSite': 'website-fields',
            'BreadcrumbList': 'breadcrumb-fields',
            'Person': 'person-fields'
        };

        const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const schemaType = e.target.value;
                const fieldsId = schemaTypeToFieldsMap[schemaType];
                
                if (fieldsId) {
                    const fieldsDiv = document.getElementById(fieldsId);
                    fieldsDiv.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        });
    }

    // Generate schema based on selected types and input data
    bindGenerateButton() {
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateSchema();
        });
    }

    generateSchema() {
        const schemas = [];
        
        // Check which schemas are selected
        const articleChecked = document.getElementById('article-schema').checked;
        const organizationChecked = document.getElementById('organization-schema').checked;
        const websiteChecked = document.getElementById('website-schema').checked;
        const breadcrumbChecked = document.getElementById('breadcrumb-schema').checked;
        const personChecked = document.getElementById('person-schema').checked;

        // Generate Article schema
        if (articleChecked) {
            const headline = document.getElementById('article-headline').value;
            const description = document.getElementById('article-description').value;
            const author = document.getElementById('article-author').value;
            const date = document.getElementById('article-date').value;
            const image = document.getElementById('article-image').value;

            const articleSchema = {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": headline || "Your Article Headline",
                "description": description || "Your article description",
                "author": {
                    "@type": "Person",
                    "name": author || "Author Name"
                },
                "datePublished": date || new Date().toISOString().split('T')[0]
            };

            if (image) {
                articleSchema.image = image;
            }

            schemas.push(articleSchema);
        }

        // Generate Organization schema
        if (organizationChecked) {
            const name = document.getElementById('org-name').value;
            const url = document.getElementById('org-url').value;
            const logo = document.getElementById('org-logo').value;
            const description = document.getElementById('org-description').value;

            const orgSchema = {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": name || "Organization Name",
                "url": url || "https://example.com"
            };

            if (logo) {
                orgSchema.logo = logo;
            }
            if (description) {
                orgSchema.description = description;
            }

            schemas.push(orgSchema);
        }

        // Generate WebSite schema
        if (websiteChecked) {
            const name = document.getElementById('website-name').value;
            const url = document.getElementById('website-url').value;
            const search = document.getElementById('website-search').value;

            const websiteSchema = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": name || "Website Name",
                "url": url || "https://example.com"
            };

            if (search) {
                websiteSchema.potentialAction = {
                    "@type": "SearchAction",
                    "target": search,
                    "query-input": "required name=search_term_string"
                };
            }

            schemas.push(websiteSchema);
        }

        // Generate BreadcrumbList schema
        if (breadcrumbChecked) {
            const items = document.getElementById('breadcrumb-items').value;
            const itemList = [];

            if (items) {
                const lines = items.split('\n').filter(line => line.trim());
                lines.forEach((line, index) => {
                    const parts = line.split('|');
                    if (parts.length === 2) {
                        itemList.push({
                            "@type": "ListItem",
                            "position": index + 1,
                            "name": parts[0].trim(),
                            "item": parts[1].trim()
                        });
                    }
                });
            }

            const breadcrumbSchema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": itemList.length > 0 ? itemList : [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://example.com"
                    }
                ]
            };

            schemas.push(breadcrumbSchema);
        }

        // Generate Person schema
        if (personChecked) {
            const name = document.getElementById('person-name').value;
            const url = document.getElementById('person-url').value;
            const description = document.getElementById('person-description').value;

            const personSchema = {
                "@context": "https://schema.org",
                "@type": "Person",
                "name": name || "Person Name"
            };

            if (url) {
                personSchema.url = url;
            }
            if (description) {
                personSchema.description = description;
            }

            schemas.push(personSchema);
        }

        // Display the generated schema
        this.displaySchema(schemas);
    }

    displaySchema(schemas) {
        const output = document.getElementById('schema-output');
        
        if (schemas.length === 0) {
            output.innerHTML = `<code>{
  "@context": "https://schema.org",
  "@type": "...",
  "...": "Select schema types and fill in the data to generate"
}</code>`;
            return;
        }

        // If multiple schemas, wrap in @graph
        let schemaOutput;
        if (schemas.length === 1) {
            schemaOutput = schemas[0];
        } else {
            schemaOutput = {
                "@context": "https://schema.org",
                "@graph": schemas.map(s => {
                    const { "@context": ctx, ...rest } = s;
                    return rest;
                })
            };
        }

        this.schemas = schemas;
        output.innerHTML = `<code>${JSON.stringify(schemaOutput, null, 2)}</code>`;
    }

    // Copy schema to clipboard
    bindCopyButton() {
        document.getElementById('copy-btn').addEventListener('click', () => {
            const output = document.getElementById('schema-output');
            const text = output.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                this.showSuccessMessage('Schema copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.showErrorMessage('Unable to copy to clipboard. Please try selecting and copying the text manually.');
            });
        });
    }

    // Export schema as JSON file
    bindExportButton() {
        document.getElementById('export-btn').addEventListener('click', () => {
            const output = document.getElementById('schema-output');
            const text = output.textContent;
            
            const blob = new Blob([text], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'schema.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccessMessage('Schema exported successfully!');
        });
    }

    // Save/Load configuration functionality
    bindConfigButtons() {
        document.getElementById('save-config-btn').addEventListener('click', () => {
            this.saveConfiguration();
        });

        document.getElementById('load-config-btn').addEventListener('click', () => {
            this.loadConfiguration();
        });

        document.getElementById('delete-config-btn').addEventListener('click', () => {
            this.deleteConfiguration();
        });
    }

    saveConfiguration() {
        const configName = document.getElementById('config-name').value.trim();
        
        if (!configName) {
            this.showErrorMessage('Please enter a configuration name');
            return;
        }

        // Collect all form data
        const config = {
            name: configName,
            timestamp: new Date().toISOString(),
            selectedSchemas: {
                article: document.getElementById('article-schema').checked,
                organization: document.getElementById('organization-schema').checked,
                website: document.getElementById('website-schema').checked,
                breadcrumb: document.getElementById('breadcrumb-schema').checked,
                person: document.getElementById('person-schema').checked
            },
            data: {
                article: {
                    headline: document.getElementById('article-headline').value,
                    description: document.getElementById('article-description').value,
                    author: document.getElementById('article-author').value,
                    date: document.getElementById('article-date').value,
                    image: document.getElementById('article-image').value
                },
                organization: {
                    name: document.getElementById('org-name').value,
                    url: document.getElementById('org-url').value,
                    logo: document.getElementById('org-logo').value,
                    description: document.getElementById('org-description').value
                },
                website: {
                    name: document.getElementById('website-name').value,
                    url: document.getElementById('website-url').value,
                    search: document.getElementById('website-search').value
                },
                breadcrumb: {
                    items: document.getElementById('breadcrumb-items').value
                },
                person: {
                    name: document.getElementById('person-name').value,
                    url: document.getElementById('person-url').value,
                    description: document.getElementById('person-description').value
                }
            }
        };

        // Get existing configurations from localStorage
        const configs = JSON.parse(localStorage.getItem('schemaConfigs') || '{}');
        configs[configName] = config;
        localStorage.setItem('schemaConfigs', JSON.stringify(configs));

        this.loadSavedConfigurations();
        this.showSuccessMessage(`Configuration "${configName}" saved!`);
    }

    loadConfiguration() {
        const configList = document.getElementById('config-list');
        const selectedOption = configList.value;

        if (!selectedOption || selectedOption === '') {
            this.showErrorMessage('Please select a configuration to load');
            return;
        }

        const configs = JSON.parse(localStorage.getItem('schemaConfigs') || '{}');
        const config = configs[selectedOption];

        if (!config) {
            this.showErrorMessage('Configuration not found');
            return;
        }

        // Load selected schemas
        document.getElementById('article-schema').checked = config.selectedSchemas.article;
        document.getElementById('organization-schema').checked = config.selectedSchemas.organization;
        document.getElementById('website-schema').checked = config.selectedSchemas.website;
        document.getElementById('breadcrumb-schema').checked = config.selectedSchemas.breadcrumb;
        document.getElementById('person-schema').checked = config.selectedSchemas.person;

        // Trigger checkbox change events to show/hide fields
        document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
            cb.dispatchEvent(new Event('change'));
        });

        // Load article data
        document.getElementById('article-headline').value = config.data.article.headline;
        document.getElementById('article-description').value = config.data.article.description;
        document.getElementById('article-author').value = config.data.article.author;
        document.getElementById('article-date').value = config.data.article.date;
        document.getElementById('article-image').value = config.data.article.image;

        // Load organization data
        document.getElementById('org-name').value = config.data.organization.name;
        document.getElementById('org-url').value = config.data.organization.url;
        document.getElementById('org-logo').value = config.data.organization.logo;
        document.getElementById('org-description').value = config.data.organization.description;

        // Load website data
        document.getElementById('website-name').value = config.data.website.name;
        document.getElementById('website-url').value = config.data.website.url;
        document.getElementById('website-search').value = config.data.website.search;

        // Load breadcrumb data
        document.getElementById('breadcrumb-items').value = config.data.breadcrumb.items;

        // Load person data
        document.getElementById('person-name').value = config.data.person.name;
        document.getElementById('person-url').value = config.data.person.url;
        document.getElementById('person-description').value = config.data.person.description;

        this.showSuccessMessage(`Configuration "${selectedOption}" loaded!`);
    }

    deleteConfiguration() {
        const configList = document.getElementById('config-list');
        const selectedOption = configList.value;

        if (!selectedOption || selectedOption === '') {
            this.showErrorMessage('Please select a configuration to delete');
            return;
        }

        // Note: Using confirm() dialog is acceptable for destructive actions
        if (!confirm(`Are you sure you want to delete "${selectedOption}"?`)) {
            return;
        }

        const configs = JSON.parse(localStorage.getItem('schemaConfigs') || '{}');
        delete configs[selectedOption];
        localStorage.setItem('schemaConfigs', JSON.stringify(configs));

        this.loadSavedConfigurations();
        this.showSuccessMessage(`Configuration "${selectedOption}" deleted!`);
    }

    loadSavedConfigurations() {
        const configList = document.getElementById('config-list');
        const configs = JSON.parse(localStorage.getItem('schemaConfigs') || '{}');
        
        configList.innerHTML = '';
        
        const configNames = Object.keys(configs);
        if (configNames.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No saved configurations';
            configList.appendChild(option);
        } else {
            configNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                configList.appendChild(option);
            });
        }
    }

    showSuccessMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'success-message';
        msgDiv.textContent = message;
        document.body.appendChild(msgDiv);

        setTimeout(() => {
            msgDiv.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'error-message';
        msgDiv.textContent = message;
        document.body.appendChild(msgDiv);

        setTimeout(() => {
            msgDiv.remove();
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SchemaGenerator();
});
