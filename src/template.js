'use strict';

const
    pug = require('pug'),
    mt = require('@eit6609/markdown-templates');

class Template {

    constructor (name, builder) {
        this.name = name;
        this.templatesDir = builder.templatesDir;
        this.markdown = builder.markdown;
        this.load();
    }

    load () {
        if (this.markdown) {
            this.template = mt.compileFile(this.getFileName());
        } else {
            this.template = pug.compileFile(this.getFileName(), { pretty: true });
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
