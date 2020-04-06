'use strict';

const
    { inspect } = require('util'),
    { filter, forEach, isUndefined, pick, sortBy } = require('lodash'),
    Joi = require('@hapi/joi'),
    { EPUBCreator } = require('@eit6609/epub-creator'),
    Page = require('./page.js'),
    Template = require('./template.js');

const optionsSchema = Joi.object({
    templatesDir: Joi.string().required(),
    outputDir: Joi.string().required(),
    metadata: Joi.object({
        title: Joi.string(),
        author: Joi.string(),
        language: Joi.string(),
        cover: Joi.string(),
        filename: Joi.string().required()
    }).required(),
    markdown: Joi.boolean(),
    debug: Joi.boolean()
});

class Builder {

    constructor (options = {}, mockSchema) {
        if (!mockSchema) {
            this.checkOptions(options, mockSchema);
        }
        this.templatesDir = options.templatesDir;
        this.outputDir = options.outputDir;
        this.metadata = options.metadata;
        this.markdown = options.markdown === true;
        this.debug = options.debug === true;
    }

    checkOptions (options, mockSchema) {
        const { error } = (mockSchema || optionsSchema).validate(options);
        if (error) {
            error.message = `Invalid options ${inspect(options)}: ${error.message}`;
            throw error;
        }
    }

    build (initialTemplateName, initialState) {
        this.numberOfPages = 0;
        this.queue = [];
        this.pages = new Map();
        this.templates = new Map();
        this.getPage(initialTemplateName, initialState);
        let page;
        while (page = this.queue.shift()) {
            page.build();
        }
        this.pages.forEach((page) => page.savePage());
        this.printReport();
        return this.buildEpub();
    }

    getPage (templateName, state) {
        const key = `${templateName}/${Page.hash(state)}`;
        let page = this.pages.get(key);
        if (isUndefined(page)) {
            page = new Page(this.numberOfPages++, this.getTemplate(templateName), state, this);
            this.pages.set(key, page);
            this.queue.push(page);
        }
        return page;
    }

    getTemplate (templateName) {
        let template = this.templates.get(templateName);
        if (isUndefined(template)) {
            template = new Template(templateName, this);
            this.templates.set(templateName, template);
        }
        return template;
    }

    printReport () {
        function makeFilterByTemplateName (templateName) {
            return (pageKey) => pageKey.substring(0, pageKey.indexOf('/')) === templateName;
        }

        const templateNames = sortBy(Array.from(this.templates.keys()));
        const pageKeys = sortBy(Array.from(this.pages.keys()));
        console.log(`${templateNames.length} templates read:`);
        forEach(templateNames, (key) => console.log(`  ${key}`));
        console.log(`${pageKeys.length} pages generated:`);
        forEach(templateNames, (templateName) => {
            const keysOfTemplate = filter(pageKeys, makeFilterByTemplateName(templateName));
            console.log(`  ${keysOfTemplate.length}\tfrom ${templateName}`);
        });
        console.log('Pages by template:');
        forEach(templateNames, (templateName) => {
            console.log(`  ${templateName}`);
            const keysOfTemplate = filter(pageKeys, makeFilterByTemplateName(templateName));
            forEach(keysOfTemplate, (pageKey) => {
                const state = pageKey.substring(templateName.length + 1);
                console.log(`    ${this.pages.get(pageKey).id}\t${state}`);
            });
        });
    }

    buildEpub () {
        const spine = [];
        for (let i = 0; i < this.numberOfPages; i++) {
            spine.push(`${Page.numberFormat.format(i)}.html`);
        }
        const toc = [[{ label: 'Start', href: `${Page.numberFormat.format(0)}.html` }]];
        const { cover } = this.metadata;
        const epubCreator = new EPUBCreator({
            contentDir: this.outputDir,
            spine,
            toc,
            cover,
            simpleMetadata: pick(this.metadata, ['author', 'title', 'language'])
        });
        return epubCreator.create(this.metadata.filename);
    }

}

module.exports = Builder;
