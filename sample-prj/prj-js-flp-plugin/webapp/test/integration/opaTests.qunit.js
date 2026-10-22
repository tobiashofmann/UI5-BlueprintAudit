/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"de/itsfullofstars/gr/test/flp/plugin/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
