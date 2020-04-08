'use strict';

class Desert {

    static configure (config) {
        Desert.config = config;
    }

    constructor () {
        this.reset();
    }

    reset () {
        this.locations = [Desert.config.cans];
        for (let i = 1; i < Desert.config.locations; i++) {
            this.locations.push(0);
        }
        this.payload = 0;
        this.location = 0;
        this.tank = 0;
        this.trips = 0;
    }

    getConfig () {
        return Desert.config;
    }

    isFinished () {
        return this.location === this.locations.length - 1;
    }

    isStranded () {
        return this.payload === 0 && this.tank === 0 && this.locations[this.location] === 0;
    }

    canFillTank () {
        if (this.tank > 0) {
            return false;
        }
        return this.payload >= Desert.config.tankCapacity ||
            this.locations[this.location] >= Desert.config.tankCapacity;
    }

    canLoad () {
        return this.locations[this.location] > 0 && this.payload < Desert.config.loadCapacity;
    }

    canUnload () {
        return this.payload > 0;
    }

    canGoToNextLocation () {
        return this.canMove(+1);
    }

    canGoToPreviousLocation () {
        return this.canMove(-1);
    }

    fillTank () {
        if (this.payload >= Desert.config.tankCapacity) {
            this.payload -= Desert.config.tankCapacity;
        } else if (this.locations[this.location] >= Desert.config.tankCapacity) {
            this.locations[this.location] -= Desert.config.tankCapacity;
        }
        this.tank += Desert.config.tankCapacity;
    }

    load () {
        this.locations[this.location]--;
        this.payload++;
    }

    unload () {
        this.locations[this.location]++;
        this.payload--;
    }

    goToNextLocation () {
        this.move(+1);
    }

    goToPreviousLocation () {
        this.move(-1);
    }

    canMove (direction) {
        return this.tank >= Desert.config.consumption &&
            0 <= this.location + direction &&
            this.location + direction <= this.locations.length;
    }

    move (direction) {
        this.location += direction;
        this.tank -= Desert.config.consumption;
        this.trips++;
    }

}

module.exports = Desert;
