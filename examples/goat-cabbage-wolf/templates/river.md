### Saving Goat and Cabbages
#### On the river
---
`debug()`

    if (state.boat.size) {

On the boat you carry:

        for (const item of state.boat.values()) {

* `state.describe(item)`

`-`

        }
    } else {

The boat is empty.

    }
    if (state.isSafe()) {


You can:

* [go to the start bank](`goto('bank0')`)
* [go to the arrival bank](`goto('bank1')`)

`-`

    } else {


        for (const reason of state.whyWasNotSafe()) {

`reason`!

        }
## YOU LOSE!

But you can [restart the game](`goto('bank0', (state) => state.reset())`), if you want.

    }
---
