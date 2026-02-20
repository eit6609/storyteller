'use strict';

const
    fs = require('fs'),
    pug = require('pug'),
    mt = require('@eit6609/markdown-templates'),
    ejs = require('ejs');

class Pug {
    getFileExtension () {
        return 'pug';
    }

    loadTemplate (fileName, { mockPug }) {
        return (mockPug || pug).compileFile(fileName, { pretty: true });
    }
}

class EJS {
    getFileExtension () {
        return 'ejs';
    }

    loadTemplate (fileName, { mockEJS }) {
        if (mockEJS) {
            return mockEJS.compile(mockEJS.getFileContent());
        }
        const src = fs.readFileSync(fileName, 'utf-8');
        return ejs.compile(src);
    }
}

class MarkdownTemplates {
    getFileExtension () {
        return 'md';
    }

    loadTemplate (fileName, { mockMT }) {
        return (mockMT || mt).compileFile(fileName);
    }
}

class Template {

    static createTemplateEngineAdapter (name) {
        switch (name) {
            case 'pug':
                return new Pug();
            case 'ejs':
                return new EJS();
            case 'mt':
                return new MarkdownTemplates();
            default:
                throw new Error(`Unknown template engine: "${name}"`);
        }
    }

    constructor (name, builder, { mockMT, mockPug, mockEJS } = {}) {
        this.name = name;
        this.templatesDir = builder.templatesDir;
        this.adapter = Template.createTemplateEngineAdapter(builder.templateEngine || 'ejs');
        this.load({ mockMT, mockPug, mockEJS });
    }

    load ({ mockMT, mockPug, mockEJS }) {
        this.template = this.adapter.loadTemplate(this.getFileName(), { mockMT, mockPug, mockEJS });
    }

    getFileName () {
        return `${this.templatesDir}/${this.name}.${this.adapter.getFileExtension()}`;
    }

    build (page) {
        return this.template(page);
    }

}

module.exports = Template;
