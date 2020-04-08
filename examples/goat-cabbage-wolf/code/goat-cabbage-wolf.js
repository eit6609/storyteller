'use strict';

class GoatCabbageWolf {

    constructor () {
        this.reset();
    }

    reset () {
        this.boat = new Set();
        this.banks = [
            new Set(['goat', 'cabbage', 'wolf']),
            new Set()
        ];
    }

    isFinished () {
        return this.banks[1].size === 3;
    }

    loadItem (object, position) {
        this.banks[position].delete(object);
        this.boat.add(object);
    }

    unloadItem (object, position) {
        this.boat.delete(object);
        this.banks[position].add(object);
    }

    isSafe () {
        const unsafe = this.banks.some((bank) => bank.has('goat') && (bank.has('wolf') || bank.has('cabbage')));
        return !unsafe;
    }

    whyWasNotSafe () {
        const bank = this.banks[0].has('goat') ? this.banks[0] : this.banks[1];
        const messages = [];
        if (bank.has('cabbage')) {
            messages.push('The goat ate the cabbage!');
        }
        if (bank.has('wolf')) {
            messages.push('The wolf ate the goat!');
        }
        return messages;
    }

    describe (item) {
        return `the ${item}`;
    }

}

module.exports = GoatCabbageWolf;
