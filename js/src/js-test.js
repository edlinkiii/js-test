export const JSTest = {
    testDebug: false,
    logColor: {
        passed: "background: black; color: #00db3a;",
        failed: "background: black; color: #ff0a0a;",
        info: "background: black; color: #fff;",
    },
    logSeparator: {
        begin: "\u25bc\u25bc\u25bc\u25bc\u25bc\u25bc\u25bc\u25bc\u25bc\u25bc",
        end: "\u25b2\u25b2\u25b2\u25b2\u25b2\u25b2\u25b2\u25b2\u25b2\u25b2",
    },

    suiteTest: async (suite) => {
        const { description, collection, condition } = suite;

        if (!condition || condition()) {
            let count = 0;
            let passed = 0;
            let skipped = 0;

            JSTest.infoLog(`${logSeparator.begin} Start test batch "${description}"`);

            await collection.reduce(async (promise, test) => {
                await promise;

                count++;

                if ((test.condition && test.condition()) || !test.condition) {
                    const { execute, expected, exactEqual } = test.shallBe;

                    const action = (await test.action) && test.action();

                    const wait = await JSTest.wait(parseFloat(test.waitSec || 0) || 0);

                    const result = await JSTest.run(test.description, JSTest.shouldBe(execute(), expected, exactEqual), test.message, count);

                    result && passed++;
                } else {
                    skipped++;

                    JSTest.infoLog(`${count}) SKIPPED: ${test.description} -- Condition not met`);
                }
            }, Promise.resolve());

            let failed = count - (passed + skipped);
            console.log(`%c ${logSeparator.end} End test batch "${description}" -- ${count} Tests | ${skipped > 0 ? skipped + " Skipped; " : ""}%c${passed > 0 ? passed + " Passed; " : ""} %c${failed > 0 ? failed + " Failed" : ""} `, JSTest.logColor.info, JSTest.logColor.passed, JSTest.logColor.failed);
        }
    },

    batch: async (description, testArray) => {
        const count = testArray.length;
        let passed = 0;

        JSTest.infoLog(`Start test batch "${description}"`);

        await testArray.reduce(async (promise, test) => {
            await promise;

            const result = await JSTest.run(test.description, test.testIt, test.message);

            result && passed++;
        }, Promise.resolve());

        console.log(`%c End test batch "${description}" | %cPassed ${passed} of ${count} `, JSTest.logColor.info, passed === count ? JSTest.logColor.passed : JSTest.logColor.failed);
    },

    test: async (description, testIt, message = "") => {
        const result = await JSTest.run(description, testIt, message);

        return result;
    },

    run: async (description, testIt, message = "", count = 0) => {
        return await testIt.then((result) => {
            if (result.passed) {
                console.log(`%c ${count > 0 ? count + ")" : ""} PASSED: ${description}${message.length > 0 ? " | " + message : ""} `, JSTest.logColor.passed, JSTest.testDebug ? result : "");
            } else {
                console.log(`%c ${count > 0 ? count + ")" : ""} FAILED: ${description}${message.length > 0 ? " | " + message : ""} `, JSTest.logColor.failed, JSTest.testDebug ? result : "");
            }

            return result.passed;
        });
    },

    shouldBe: (actual, expected = true, strict = true) => {
        return new Promise((res) => {
            let value1, value2, passed;

            if (!strict && (expected === true || expected === "true" || expected === "truthy" || !expected)) {
                value1 = !!actual;
                value2 = true;
            } else if (!strict && (expected === false || expected === "false" || expected === "falsy")) {
                value1 = !actual;
                value2 = false;
            } else {
                value1 = actual;
                value2 = expected;
            }

            passed = strict ? value1 === value2 : value1 == value2;

            const ret = {
                actual,
                expected,
                strict,
                passed,
            };

            res(ret);
        });
    },

    infoLog: (info) => console.log(`%c ${info} `, JSTest.logColor.info),
    passLog: () => console.log(`%c PASSED `, JSTest.logColor.passed),
    failLog: () => console.log(`%c FAILED `, JSTest.logColor.failed),

    wait: async (secs = 0) => await new Promise((resolve) => setTimeout(resolve, secs * 1000)),
};

// const {testDebug, logColor, logSeparator, suite, batch, test, shouldBe, infoLog, passLog, failLog, wait} = JSTest;
