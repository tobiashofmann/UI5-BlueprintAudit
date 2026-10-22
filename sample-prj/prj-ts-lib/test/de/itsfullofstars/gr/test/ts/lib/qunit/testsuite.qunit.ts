export default {
	name: "QUnit TestSuite for de.itsfullofstars.gr.test.ts.lib",
	defaults: {
		ui5: {
			libs: ["sap.ui.core", "de.itsfullofstars.gr.test.ts.lib"],
			theme: "sap_horizon"
		},
		qunit: {
			version: 2,
			reorder: false
		},
		sinon: {
			version: 4,
			qunitBridge: true,
			useFakeTimers: false
		}
	},
	tests: {
		// test file for the Example control
		Example: {
			title: "QUnit Test for Example",
			_alternativeTitle: "QUnit tests: de.itsfullofstars.gr.test.ts.lib.Example"
		}
	}
};
