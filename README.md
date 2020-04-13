## nomi

* storyteller
* adventures-in-epub
* IEG (Interactive EPUB Generator)
* epubgame
* game-ebook, gamepub (da gamebook, il librogame)

# XYZ, a generator of interactive ebooks

XYZ is a tool for the generation of game ebooks that, given

* a set of XHTML templates representing the locations of the game
* a class containing the data and implementing the actions of the game

generates an ePUB containing all the possible situations of the game. The player plays the game by following the links.

It was inspired by [the Medusa compiler of Enrico Colombini](http://www.erix.it/medusa.html), which was used it to create his [Locusta Temporis](https://www.amazon.it/Locusta-Temporis-Enrico-Colombini-ebook/dp/B07DZ23VQP) interactive e-book.

Install it by running:

	npm i @eit6609/xyz

## Why interactive ebooks?

You can find the details behind the idea in Colombini's [Interactive Fiction & ebooks: Designing puzzles for digital books](https://www.amazon.it/Interactive-Fiction-ebooks-Designing-italiano-ebook/dp/B07DZ3F71K), and an introduction in [the slides about Medusa from Lua workshop 2014](http://www.lua.org/wshop14/Colombini.pdf).

With an interactive ebook you don't need an engine to play the game, because the game has been pre-played by XYZ. All you need is an ebook reader.

Since there are ebook readers for every device you get the maximum portability.

Of course there are some limitations in the design of the game:

* the actions can be performed only by following links
* you cannot use random generators or unlimited counters
* you must avoid a combinatorial explosion

[Interactive Fiction & ebooks](https://www.amazon.it/Interactive-Fiction-ebooks-Designing-italiano-ebook/dp/B07DZ3F71K) deals thoroughly with these issues, however I give you some tips & tricks at the end of this document.

There are also some limits for the player:

* the player must only follow the links and cannot navigate the book by freely turning the pages

This limitations notwithstanding, you can create amazing games.

If you try *Locusta Temporis* you won't believe your eyes. And it was created with Medusa, which is functionally equivalent to XYZ.

You can find some example ePUBs in the [examples](#examples).

## How does it work?

### The state

The logic of the game is implemented with a class that contains the state of the game.

You'll need two types of methods:

* accessors (including properties accessors), that are called in the templates to show dynamic data and make decisions
* modifiers, that are called when the user follows a link

Let's see an example, that is included in the complete [examples](#examples):

```js
class Hanoi {

    static configure (config) {
        Hanoi.config = config;
    }

    constructor () {
        this.reset();
    }

    reset () {
        this.pegs = [
            new Peg(Hanoi.config.nDiscs),
            new Peg(),
            new Peg()
        ];
    }

    getConfig () {
        return Hanoi.config;
    }

    isFinished () {
        return this.pegs[2].discs.length === Hanoi.config.nDiscs;
    }

    canMove (from, to) {
        from = this.pegs[from];
        to = this.pegs[to];
        return from.discs.length > 0 && (to.discs.length === 0 || to.getTopDisc() > from.getTopDisc());
    }

    move (from, to) {
        this.pegs[to].discs.push(this.pegs[from].discs.pop());
    }

}
```

In this state class, the property `pegs` and the methods `getConfig()`, `canMove()` and `isFinished()` are the accessors.

The methods `reset()` and `move()` are the modifiers.

### The templates

The pages of the ebook are generated by a set of XHTML templates, one for every location of the game.

After many experiments with the most popular templating engines for Nodejs, I have chosen [Pug](https://pugjs.org/api/getting-started.html) because it gives you enough freedom to call JavaScript code inside the template. This is vital, but many engines (the very popular [Handlebars](https://handlebarsjs.com) among others) make the call of methods on a class instance a nightmare.

Of course [EJS](https://ejs.co) gives you *complete* freedom, but I prefer higher level engines like Pug.

I have added **experimental** support for markdown templating by means of my [Markdown Templates](https://github.com/eit6609/markdown-templates) engine.

Let's see an example of template:

```
doctype strict
html(xmlns='http://www.w3.org/1999/xhtml', xml:lang='it')
    head
        link(href="style-epub.css", rel="stylesheet", type="text/css")
        title The Tower of Hanoi
    body
        h3 The Tower of Hanoi
        hr
        p.first The situation is:
        ul
            li Peg 1: #{state.pegs[0]}
            li Peg 2: #{state.pegs[1]}
            li Peg 3: #{state.pegs[2]}
        if state.isFinished()
            h1 YOU’VE WON!
            br
            p.first Want to #[a(href=goto((state) => state.reset())) play again]?
        else
            p.first Possible moves are:
            ul
                if state.canMove(0, 1)
                    li #[a(href=goto((state) => state.move(0, 1))) 1 ==> 2]
                if state.canMove(0, 2)
                    li #[a(href=goto((state) => state.move(0, 2))) 1 ==> 3]
                if state.canMove(1, 2)
                    li #[a(href=goto((state) => state.move(1, 2))) 2 ==> 3]
                if state.canMove(2, 1)
                    li #[a(href=goto((state) => state.move(2, 1))) 3 ==> 2]
                if state.canMove(2, 0)
                    li #[a(href=goto((state) => state.move(2, 0))) 3 ==> 1]
                if state.canMove(1, 0)
                    li #[a(href=goto((state) => state.move(1, 0))) 2 ==> 1]
            p Of course you can also #[a(href=goto((state) => state.reset())) restart the game].
            p Or you may want to review the #[a(href=goto('start', (state) => state.reset())) instructions].
        hr
```

The accessors are used to display data:

	li Peg 1: #{state.pegs[0]}

and to make decisions:

	if state.canMove(0, 2)

The modifiers are used in the links to perform actions:

	li #[a(href=goto((state) => state.move(2, 0))) 3 ==> 1]
	...
	p Of course you can also #[a(href=goto((state) => state.reset())) restart the game].

We are about to see what is that `goto()` right now in the next section.

### The generator

#### Following the links

Starting from a template and a state, the generator recursively follows all the links, generating all the possible pages.

This is done with the `goto()` function, provided, besides the `state` instance, by the context of the template.

You can pass `goto()` a template name and/or a function (called *action*) that modifies the state. This function usually just calls a modifier method on the state.

As the action is optional, it is possible to change only the template (that is, the location) and keep the state as is.

As the template name is optional, it is possible to change only the state without changing the location.

#### Generating the pages

The combination of a template and a state generates a page:

	template + state = page

To keep track of the generated pages, every state instance is reduced to a *hash*, which is a human readable string that uniquely identifies the state.
It's a kind of compact JSON, that can deal also with the new features of ES6, like Maps and Sets, which are not handled by the standard JSON support.

A template name and a state hash uniquely identify a page:

	template name + hash(state) = page key

For debug and learning purposes, you can use the `debug()` function inside a template to show the page key. Because the hash is human readable, it is a meaningful representation of the state. It can be very useful to understand why the template engine has generated the page as it is.

## API reference

### The generator class

#### `constructor(options?: object)`

These are the supported options:

* `templatesDir`, string, required: the path of the directory containing the templates
* `outputDir`, string, required: the path of the directory to use for the generated XHTML files. This directory is used as input for the [ePUB creator](https://github.com/eit6609/epub-creator), so you can put in this directory any extra file (images, stylesheets) that you need in the ePUB.
* `metadata`, object, required, the options for the ePUB creator, with these properties:
    * `title`, string, optional, default `untitled`: the title of the ePUB
    * `author`, string, optional, default no author: the author of the ePUB
    * `language`, string, optional, default `en`: the language of the ePUB
    * `cover`, string, optional, default no cover: a path relative to `outputDir` of an image that will become the cover of the ePUB
    * `filename`, string, required: the path of the generated ePUB
* `markdown`, boolean, optional, default `false`: if `false` the template engine is Pug, otherwise it is Markdown Templates
* `debug`, boolean, optional, default `false`: if `true` the `debug()` function called in the templates will return the page key, otherwise the empty string.

#### `generate(initialTemplateName: string, initialState: object): promise`

It generates the ePUB given:

* `initialTemplateName`:  the path of the initial template file, without the extension, relative to the `templatesDir`
* `initialState`: the initial state instance

It returns a promise with no value.

### The template context

These are the properties of the "locals" of the template engine.

#### `state`

It is the state instance, that can be used to call its accessors.

#### `debug()`

If the `debug` option is `true`, this function returns the key of the current page, that is the template name and the state hash.

#### `goto(templateName?: string, action?: function)`

* `templateName` is the path of a template file, without the extension, relative to the `templatesDir`. It defaults to the current template's name.
* `action` is a function that receives the current state as its only parameter and modifies it. It should return a falsy value unless it wants to replace the current state with a new one: in this case it should return the new state. This is handy for complex games because it enables you to move through independent stages of the game. More about this later, in the *Tips & Tricks* section.

## Examples

You can generate the example ebooks by moving to the `code` folder and running the `main.js` script:

	node main.js

You can change the debug options to `true` to see who (template + state) generated the pages.

You can inspect the generated XHTML files, they are in the `out` subdirectories.

But if you are lazy you can just download the generated ePUBs.

### Goat, Cabbage & Wolf

A classic puzzle!

There are two scripts:

* `main-xhtml.js`, that uses the Pug (.pug) templates
* `main-markdown.js`, that uses the experimental Markdown Templates (.md) templates

The generated ePUBs should be the same.

You can download the generated ePUB [here](examples/goat-cabbage-wolf/code/goat-cabbage-wolf-xhtml.epub).

### Desert Traversal

A puzzle about managing scarce resources.

You can download the generated ePUB [here](examples/desert/code/desert.epub).

### The Tower of Hanoi

Not much of an adventure game, but I have loved this game when I learned about recursion and I think that it is a very neat example.

You can download the generated ePUB [here](examples/hanoi/code/hanoi.epub).

## Tips & Tricks

### Keep the state "small"

The golden rule to avoid combinatorial explosion is:

> You must keep the state as empty as possible

Let's see some examples.

#### Be smart

You can implement a combination lock by using a simple boolean:

* `true`: "all digits right so far"
* `false`: "at least one wrong digit"

This way you won't need to handle the exponential number of cases.

For example, you can use this state:

```js
class Safe {
    constructor (combination) {
        this.combination = combination;
        this.ok = true;
        this.index = 0;
    }

    choose (digit) {
        this.ok = String(digit) === this.combination.charAt(this.index);
        this.index++;
    }

    isRight () {
        return this.index === this.combination.length && this.ok;
    }

    isWrong () {
        return this.index === this.combination.length && !this.ok;
    }
}
```

with this template:

```
doctype strict
html(xmlns='http://www.w3.org/1999/xhtml', xml:lang='it')
    head
        link(href="style-epub.css", rel="stylesheet", type="text/css")
        title Open the Safe
    body
        h3 Open the Safe
        hr
        if state.isRight()
            h1 YOU’VE WON!
        else
            if state.isWrong()
                h1 YOU’VE LOST!
            else
                p.first Choose digit ##{state.index + 1}:
                ul
                    - for (let i = 0; i < state.combination.length; i++)
                        li #[a(href=goto((s) => s.choose(i))) #{i}]
        hr
```

The generated pages will be only *n* (the correct combination) + *n* (all the possible wrong combinations), where *n* is the length of the combination.

Why? Because what determines the number of pages are the possible values of the properties of the state, and they are 2 * *n*:

* 2 for `ok`
* *n* for `index`

For the sake of precision, there are only 2 * *n* - 1 pages, because the state `{index=0,ok=false}` is not used.

#### Consume objects

Almost every adventure game has a basket where the player can collect objects.

However, keeping objects in the basket is very expensive, because you'll have 2 ^ *n* possible states if you need to keep track of *n* objects.

You should prefer objects that get consumed, and drop them as soon as you can.

#### Partition the game

You should partition the game in several independent stages, in order to reset the state when you finish one stage and enter another.

You should implement the different stages with different state classes, and then exploit the feature of the generator that uses a new state when an action returns one to make the transition from one stage to the other.
