import { getDistinctValues } from "../util.js";

// create a combobox from multiple field definitions
export function getEnumDom(selecto, first, fields, values) {
	let dom = selecto.options.enumTemplate.content.cloneNode(true).firstElementChild;
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
	let originalValue = distinctValues.length == 1 ? distinctValues[0] : "";

	let input = dom.querySelector("#input");
	input.id = first.id;
	input.onchange = e => {
		let newValue = e.target.value;
		selecto.onFieldChanged(first.id, newValue);

		changeReceiver.classList.toggle("changed", originalValue !== newValue);
		if (reset !== null) {
			reset.classList.toggle("changed", originalValue !== newValue);
		}
	};
	if (reset !== null) {
		reset.onclick = e => {
			input.value = originalValue;
			input.dispatchEvent(new Event("change"));
		};
	}

	if (distinctValues.length > 1) {
		let option = document.createElement("option");
		option.innerText = "Multiple values";
		option.value = "";
		option.selected = true;
		input.appendChild(option);
	}

	first.values.forEach(v => {
		let option = document.createElement("option");
		option.value = option.innerText = v;
		if (values.length == 1 && values[0] === v) {
			option.selected = true;
		}
		input.appendChild(option);
	});

	return dom;
}
