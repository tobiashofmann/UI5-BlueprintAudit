// deliberate violation of "xml-views": non-XML view file
sap.ui.jsview("de.itsfullofstars.gr.test.viol2.prjviolations2.view.Legacy", {
    getControllerName: function () {
        return "de.itsfullofstars.gr.test.viol2.prjviolations2.controller.App";
    },
    createContent: function () {},
});
