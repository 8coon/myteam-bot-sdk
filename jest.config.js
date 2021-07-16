module.exports = {
	preset: 'ts-jest',
	testMatch: ["**/?(*.)+(spec|tests).[jt]s?(x)"],
	testEnvironment: "node",
	verbose: false,
	"coverageReporters": [
		"json-summary",
		"text",
		"html",
		"lcov"
	]
}
