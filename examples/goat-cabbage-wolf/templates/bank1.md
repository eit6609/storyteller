### Saving Goat and Cabbages
#### Arrival bank
---
`debug()`

    if (state.banks[1].size) {

On the bank there are:

        for (const item of state.banks[1].values()) {

* `state.describe(item)`

`-`

        }
    }
    if (state.isFinished()) {


## YOU WIN

But you can [restart the game](`goto('bank0', (state) => state.reset())`), if you want.

    } else {


You can:

        for (const item of state.boat.values()) {

* [unload `state.describe(item)`](`goto((state) => state.unloadItem(item, 1))`)

`-`

        }
        if (state.boat.size === 0) {
            for (const item of state.banks[1].values()) {

* [load `state.describe(item)`](`goto((state) => state.loadItem(item, 1))`)

`-`

            }
        }

* [leave the bank](`goto('river')`)

`-`

    }

---
