'use strict';

const
    pug = require('pug'),
    mt = require('@eit6609/markdown-templates');

class Template {

    constructor (name, builder, mockMT, mockPug) {
        this.name = name;
        this.templatesDir = builder.templatesDir;
        this.markdown = builder.markdown;
        this.load(mockMT, mockPug);
    }

    load (mockMT, mockPug) {
        if (this.markdown) {
            this.template = (mockMT || mt).compileFile(this.getFileName());
        } else {
            this.template = (mockPug || pug).compileFile(this.getFileName(), { pretty: true });
        }
    }

    getFileName () {
        return `${this.templatesDir}/${this.name}.${this.markdown ? 'md' : 'pug'}`;
    }

    build (page) {
        return this.template(page);
    }

}


module.exports = Template;
