### Saving Goat and Cabbages
#### Start bank
---
`debug()`

    if (state.banks[0].size) {

On the bank there are:

        for (const item of state.banks[0].values()) {

* `state.describe(item)`

`-`

        }
    }


You can:

    for (const item of state.boat.values()) {

* [unload `state.describe(item)`](`goto((state) => state.unloadItem(item, 0))`)

`-`

    }
    if (state.boat.size === 0) {
        for (const item of state.banks[0].values()) {

* [load `state.describe(item)`](`goto((state) => state.loadItem(item, 0))`)

`-`

        }
    }

`-`

* [leave the bank](`goto('river')`)

---
