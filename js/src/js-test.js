const JSTest = {
    testDebug: false,
    logColors: {
        passed: "background: black; color: #00db3a;",
        failed: "background: black; color: #ff0a0a;",
        info: "background: black; color: #fff;",
    },
    batch: async (description, testArray) => {
        const count = testArray.length;
        let passed = 0;

        console.log(`%c Start test batch "${description}" `, logColors.info)

        await testArray.reduce(async (a, t) => {
            await a;

            const result = await JSTest.run(t.description, t.testIt, t.message)

            result && passed++;

        }, Promise.resolve());

        console.log(`%c End test batch "${description}" | %cPassed ${passed} of ${count} `, logColors.info, passed === count ? logColors.passed : logColors.failed);
    },

    test: async (description, testIt, message="") => {
        const result = await JSTest.run(description, testIt, message)

        return result;
    },

    run: async (description, testIt, message="") => {
        return await testIt.then((result) => {
            if(result.passed) {
                console.log(`%c PASSED: ${description}${(message.length > 0) ? " | " + message : "" } `, logColors.passed, testDebug ? result : "");
            } else {
                console.log(`%c FAILED: ${description}${(message.length > 0) ? " | " + message : "" } `, logColors.failed, testDebug ? result : "");
            }
    
            return result.passed;
        });
    },

    shouldBe: (actual, expected=true, strict=true) => {
        return new Promise((res) => {
            let value1, value2, passed;

            if(!strict && (expected === true || expected === "true" || expected === "truthy" || !expected)) {
                value1 = !!actual;
                value2 = true;
            } else if(!strict && (expected === false || expected === "false" || expected === "falsy")) {
                value1 = !actual;
                value2 = false;
            } else {
                value1 = actual;
                value2 = expected;
            }
    
            passed = (strict) ? value1 === value2 : value1 == value2;

            const ret = {
                actual,
                expected,
                strict,
                passed
            }
    
            res(ret);
        });
    },

    infoLog: (info) => console.log(`%c ${info} `, logColors.info),

    wait: async (secs=0) => await new Promise(resolve => setTimeout(resolve, (secs * 1000))),
};

const {testDebug, logColors, batch, test, shouldBe, infoLog, wait} = JSTest;

$q().ready(() => {
    // Basic HTML setup
    const forms = $qa("form")
    test("One form exists", shouldBe(forms.length, 1))
    
    const form = forms[0]
    const inputs = form.findAll("input")
    test("Form has one or more inputs", shouldBe(inputs.length >= 1, true))
    
    const testInputs = inputs.filter(".test-input")
    test("All form inputs have class 'test-input'", shouldBe(testInputs.length, inputs.length))

    testInputs.forEach((input) => {
        test("Input value is ''", shouldBe(input.val(), ""))
    })

    const buttons = form.findAll("button")
    test("Form has one button", shouldBe(buttons.length, 1))
    
    const btnButtons = buttons.filter(".btn");
    test("Any buttons have class 'btn'", shouldBe(btnButtons.length, buttons.length))

    const testButton = $q("#testButton");
    test("Test button should be visible", shouldBe(testButton.isVisible(), true));
    test("Test button should be disabled via class 'btn-disabled'", shouldBe(testButton.hasClass("btn-disabled")))

    const testDiv = $q("#testDiv");
    test("Test div should not be displayed", shouldBe(testDiv.style.display, 'none'))

    // set up listeners
    const buttonListener = (button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();

            if(e.currentTarget.hasClass("btn-disabled")) {
                return;
            }

            $q("#testDiv").toggle();
        })
    }
    buttonListener(testButton);

    const inputListener = (input) => {
        input.addEventListener("change", (e) => {
            testButton.toggleClass("btn-disabled", form.findAll("input.test-input[value='']").length !== 0);
        })
    }
    testInputs.forEach((input) => {
        inputListener(input);
    });

    // Basic setup testing using batch()
    setTimeout(() => {
        batch("test batch testing", [
            {
                description: "One form exists", 
                testIt: shouldBe(forms.length, 1)
            },
            {
                description: "Form has one or more inputs", 
                testIt: shouldBe(inputs.length >= 1, true)
            },
            {
                description: "All form inputs have class 'test-input'", 
                testIt: shouldBe(testInputs.length, inputs.length)
            },
            {
                description: "Form has one button", 
                testIt: shouldBe(buttons.length, 1)
            },
            {
                description: "Any buttons have class 'btn'", 
                testIt: shouldBe(btnButtons.length, buttons.length)
            },
            {
                description: "Test button should be disabled via class 'btn-disabled'", 
                testIt: shouldBe(testButton.hasClass("btn-disabled"))
            },
            {
                description: "Test div should not be displayed", 
                testIt: shouldBe(testDiv.style.display, 'none')
            },
        ])
        .then(() => {
            infoLog("<----- Behavioral tests ----->")
        })
        .then(() => {
            testButton.click()
            test("Behavioral --> Test div should not be displayed", shouldBe(testDiv.style.display, 'none'), "after disabled button click")
        })
        .then(async () => {
            testInputs[0].val("test").attr("value","test").change()
            return wait() // wait for UI to update
            .then(async () => await test("Behavioral --> Test button should be disabled via class 'btn-disabled'", shouldBe(testButton.hasClass("btn-disabled"))))
            .then(async () => await test("Behavioral --> Test div should not be displayed", shouldBe(testDiv.style.display, 'none')))
        })
        .then(async () => {
            testInputs[1].val("test").attr("value","test").change()
            return wait() // wait for UI to update
            .then(async () => await test("Behavioral --> Test button should not be disabled via class 'btn-disabled'", shouldBe(testButton.hasClass("btn-disabled"), false)))
            .then(async () => await test("Behavioral --> Test div should not be displayed", shouldBe(testDiv.style.display, 'none')))
        })
        .then(async () => {
            testButton.click()
            return wait() // wait for UI to update
            .then(async () => test("Behavioral --> Test div should be displayed", shouldBe(testDiv.style.display, 'block'), "after button click"))
        })
        .then(async () => {
            testButton.click()
            test("Behavioral --> Test div should not be displayed", shouldBe(testDiv.style.display, 'none'), "after button click")
        })
    },0)
});
