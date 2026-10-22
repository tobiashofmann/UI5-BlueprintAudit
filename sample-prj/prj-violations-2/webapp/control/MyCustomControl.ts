import Control from "sap/ui/core/Control";

/**
 * @namespace de.itsfullofstars.gr.test.viol2.prjviolations2.control
 */
export default class MyCustomControl extends Control {
    static readonly metadata = {};

    render(): void {
        // deliberate violation of "no-custom-controls"
    }
}
