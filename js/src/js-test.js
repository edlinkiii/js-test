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
