$q().ready(() => {
    const testInputs = $qa("form")[0].findAll("input.test-input")
    const testButton = $q("#testButton")

    // set up listeners
    testButton.addEventListener("click", (e) => {
        e.preventDefault()

        if(e.currentTarget.hasClass("btn-disabled")) return

        $q("#testDiv").toggle()
    })

    testInputs.forEach((input) => {
        input.addEventListener("change", (e) => {
            e.currentTarget.attr("value", e.currentTarget.val())
            testButton.toggleClass("btn-disabled", $qa("form")[0].findAll("input.test-input[value='']").length !== 0)
        })
    })
})
