'use strict';

const {
        cloneDeep,
        isArray,
        isDate,
        isFunction,
        isMap,
        isObject,
        isSet,
        isString,
        map,
        sortBy,
        toPairsIn
    } = require('lodash'),
    fs = require('fs'),
    marked = require('marked');

function wrapBody (body) {
    return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="it">
<head>
<link href="style-epub.css" rel="stylesheet" type="text/css" />
</head>
<body>
${body}
</body>
</html>`;
}

class Page {

    static hash (value) {
        if (isDate(value)) {
            return `${value.getTime()}`;
        } else if (isArray(value)) {
            return `[${map(value, Page.hash)}]`;
        } else if (isSet(value)) {
            const entries = map([...value], Page.hash);
            return `{${sortBy(entries)}}`;
        } else if (isObject(value) || isMap(value)) {
            let entries = map(toPairsIn(value), ([key, value]) => [Page.hash(key), Page.hash(value)]);
            entries = sortBy(entries, 0);
            entries = map(entries, ([key, value]) => `${key}=${value}`);
            return `{${entries}}`;
        } else {
            return String(value);
        }
    }

    constructor (id, template, state, builder) {
        this.id = id;
        this.template = template;
        this.state = state;
        this.builder = builder;
    }

    followLink (templateName, action) {
        templateName = templateName || this.template.name;
        let { state } = this;
        if (action) {
            state = cloneDeep(state);
            const newState = action.call(null, state);
            // this way the action can create a new state and initialize a new stage of the game:
            if (newState) {
                state = newState;
            }
        }
        return this.builder.getPage(templateName, state);
    }

    build () {
        if (this.builder.markdown) {
            const text = this.template.build(this);
            const markedOptions = {
                smartypants: true,
                xhtml: true
            };
            this.text = wrapBody(marked(text, markedOptions));
        } else {
            const locals = {
                state: this.state,
                goto: this.goto.bind(this),
                debug: this.debug.bind(this)
            };
            this.text = this.template.build(locals);
        }
    }

    savePage () {
        fs.writeFileSync(this.getPageFileName(), this.text, 'utf8');
    }

    getPageFileName () {
        return `${this.builder.outputDir}/${this.getPageURL()}`;
    }

    getPageURL () {
        return `${Page.numberFormat.format(this.id)}.html`;
    }

    // Methods used in templates:

    goto (arg1, arg2) {
        let templateName, action;
        if (isString(arg1)) {
            templateName = arg1;
        } else {
            action = arg1;
        }
        if (isFunction(arg2)) {
            action = arg2;
        }
        return this.followLink(templateName, action).getPageURL();
    }

    debug () {
        if (this.builder.debug) {
            return `<code>${this.template.name}/${Page.hash(this.state)}</code>`;
        } else {
            return '';
        }
    }

}

Page.numberFormat = new Intl.NumberFormat('en', { minimumIntegerDigits: 4, useGrouping: false });


module.exports = Page;
