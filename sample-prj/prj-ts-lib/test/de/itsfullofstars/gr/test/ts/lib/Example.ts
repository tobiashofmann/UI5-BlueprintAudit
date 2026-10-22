import { ExampleColor } from "de/itsfullofstars/gr/test/ts/lib/library";
import Example from "de/itsfullofstars/gr/test/ts/lib/Example";

// create a new instance of the Example control and
// place it into the DOM element with the id "content"
new Example({
	text: "Example",
	color: ExampleColor.Highlight,
	press: (event) => {
		alert(event.getSource());
	}
}).placeAt("content");
