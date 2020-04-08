'use strict';

class Peg {
    constructor (nDiscs) {
        this.discs = [];
        if (nDiscs) {
            for (let i = 0; i < nDiscs; i++) {
                this.discs.push(nDiscs - i);
            }
        }
    }

    getTopDisc () {
        return this.discs[this.discs.length - 1];
    }

    toString () {
        return `(${this.discs.join(' ')})`;
    }

}

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

module.exports = Hanoi;
