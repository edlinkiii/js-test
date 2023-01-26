export default class JSTest {
    constructor(options) {
        this.testDebug = options?.testDebug || false;
        this.logColor = options?.logColor || {
            passed: "background: black; color: #00db3a;",
            failed: "background: black; color: #ff0a0a;",
            info: "background: black; color: #fff;",
        };
        this.logSeparator = options?.logSeparator || {
            begin: "\u25bc",
            end: "\u25b2",
            repeat: 10,
        };
    }

    async suiteTest(suite) {
        const { description, collection, condition } = suite;

        if (!condition || condition()) {
            let count = 0;
            let passed = 0;
            let skipped = 0;

            this.infoLog(`${this.suiteSeparator(this.logSeparator.begin, this.logSeparator.repeat)} Start test batch "${description}"`);

            await collection.reduce(async (promise, test) => {
                await promise;

                count++;

                if ((test.condition && test.condition()) || !test.condition) {
                    const { execute, expected, exactEqual } = test.shallBe;

                    const action = (await test.action) && test.action();

                    const wait = await this.wait(parseFloat(test.waitSec || 0) || 0);

                    const result = await this.run(test.description, this.shouldBe(execute(), expected, exactEqual), test.message, count);

                    result && passed++;
                } else {
                    skipped++;

                    this.infoLog(`  ${count}) SKIPPED: ${test.description} -- Condition not met`);
                }
            }, Promise.resolve());

            let failed = count - (passed + skipped);
            console.log(`%c ${this.suiteSeparator(this.logSeparator.end, this.logSeparator.repeat)} End test batch "${description}" -- ${count} Tests | ${skipped > 0 ? skipped + " Skipped; " : ""}%c${passed > 0 ? passed + " Passed; " : ""} %c${failed > 0 ? failed + " Failed" : ""} `, this.logColor.info, this.logColor.passed, this.logColor.failed);
        }
    }

    async batch(description, testArray) {
        const count = testArray.length;
        let passed = 0;

        this.infoLog(`Start test batch "${description}"`);

        await testArray.reduce(async (promise, test) => {
            await promise;

            const result = await this.run(test.description, test.testIt, test.message);

            result && passed++;
        }, Promise.resolve());

        console.log(`%c End test batch "${description}" | %cPassed ${passed} of ${count} `, this.logColor.info, passed === count ? this.logColor.passed : this.logColor.failed);
    }

    async test(description, testIt, message = "") {
        const result = await this.run(description, testIt, message);

        return result;
    }

    async run(description, testIt, message = "", count = 0) {
        return await testIt.then((result) => {
            if (result.passed) {
                console.log(`%c   ${count > 0 ? count + ")" : ""} PASSED: ${description}${message.length > 0 ? " | " + message : ""} `, this.logColor.passed, this.testDebug ? result : "");
            } else {
                console.log(`%c   ${count > 0 ? count + ")" : ""} FAILED: ${description}${message.length > 0 ? " | " + message : ""} `, this.logColor.failed, this.testDebug ? result : "");
            }

            return result.passed;
        });
    }

    shouldBe(actual, expected = true, strict = true) {
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
    }

    infoLog(info) {
        console.log(`%c ${info} `, this.logColor.info);
    }

    passLog() {
        console.log(`%c PASSED `, this.logColor.passed);
    }

    failLog() {
        console.log(`%c FAILED `, this.logColor.failed);
    }

    suiteSeparator(char, times) {
        return Array.from(char.repeat(times)).join("");
    }

    async wait(secs = 0) {
        await new Promise((resolve) => setTimeout(resolve, secs * 1000));
    }
}
