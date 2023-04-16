
import { getDistinctValues } from "../util.js";

// create a checkbox from multiple field definitions
export function getBoolDom(selecto, first, fields, values) {
	let dom = selecto.options.boolTemplate.content.cloneNode(true).firstElementChild;
	let reset = dom.querySelector(".reset");
	let changeReceiver = dom.querySelector(".change-receiver");
	if (changeReceiver === null) {
		changeReceiver = dom;
	}

	let label = dom.querySelector("#label");
	label.id = "";
	label.innerText = first.name;
	label.for = first.id;

	let distinctValues = getDistinctValues(values);

	let originalValue = distinctValues.length == 1 ? distinctValues[0] : null;

	let input = dom.querySelector("#input");
	input.type = "checkbox";
	input.id = first.id;
	input.onchange = e => {
		let newValue = e.target.checked;
		selecto.onFieldChanged(first.id, newValue);

		changeReceiver.classList.toggle("changed", originalValue !== newValue);
		if (reset !== null) {
			reset.classList.toggle("changed", originalValue !== newValue);
		}
	};
	if (reset !== null) {
		reset.onclick = e => {
			input.checked = originalValue;
			input.dispatchEvent(new Event("change"));
		};
	}


	if (distinctValues.length > 1) {
		input.indeterminate = true;
	} else {
		input.checked = distinctValues[0];
	}

	return dom;
}
