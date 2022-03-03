import {JSTest} from "./src/js-test.js"

$q().ready(() => {
    // bring in functions from test lib
    const {suiteTest, wait} = JSTest;

    // Basic HTML setup
    const forms = $qa("form")
    const form = forms[0]
    const inputs = form.findAll("input")
    const testInputs = inputs.filter(".test-input")
    const buttons = form.findAll("button")
    const btnButtons = buttons.filter(".btn");
    const testButton = $q("#testButton");
    const testDiv = $q("#testDiv");

    const testSuites = [
        {
            description: "Initial State",
            collection: [
                {
                    description: "One form exists",
                    shallBe: {
                        execute: () => forms.length,
                        expected: 1,
                    }
                },
                {
                    description: "Form has one or more inputs",
                    shallBe: {
                        execute: () => inputs.length >= 1,
                        expected: true,
                    }
                },
                {
                    description: "Input(s) value are ''",
                    shallBe: {
                        execute: () => inputs.filter("[value='']").length,
                        expected: inputs.length,
                    },
                },
                {
                    description: "All form inputs have class 'test-input'",
                    shallBe: {
                        execute: () => testInputs.length,
                        expected: inputs.length,
                    }
                },
                {
                    description: "Form has one button",
                    shallBe: {
                        execute: () => buttons.length,
                        expected: 1,
                    }
                },
                {
                    description: "Any buttons have class 'btn'",
                    shallBe: {
                        execute: () => btnButtons.length,
                        expected: buttons.length,
                    }
                },
                {
                    description: "Test button should be disabled via class 'btn-disabled'",
                    shallBe: {
                        execute: () => testButton.hasClass("btn-disabled"),
                        expected: true,
                    }
                },
                {
                    description: "Test div should not be displayed",
                    shallBe: {
                        execute: () => testDiv.style.display,
                        expected: 'none',
                    }
                },
            ]
        },
        {
            description: "Behavioral tests",
            collection: [
                {
                    description: "Click disabled test button",
                    action: () => testButton.click(),
                    waitSec: 1,
                    shallBe: {
                        execute: () => testDiv.style.display,
                        expected: 'none',
                        exactEqual: true,
                    },
                    message: "Test div is not displayed",
                },
                {
                    description: "Add value to each test input (!empty)",
                    action: () => testInputs.forEach((i) => { i.val("test").change() }),
                    waitSec: 1,
                    shallBe: {
                        execute: () => testButton.hasClass("btn-disabled"),
                        expected: false,
                        exactEqual: true,
                    },
                    message: "Test button is enabled",
                },
                {
                    description: "Click enabled test button",
                    action: () => testButton.click(),
                    waitSec: 1,
                    shallBe: {
                        execute: () => testDiv.style.display,
                        expected: 'block',
                        exactEqual: true,
                    },
                    message: "Test div is displayed",
                },
            ],
        },
    ]

    suiteTest(testSuites[0])
    .then(() => wait(5))
    .then(() => suiteTest(testSuites[1]))
})
