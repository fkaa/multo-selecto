import { getDistinctValues } from "../util.js";

// create a slider from multiple field definitions
export function getSliderDom(selecto, first, fields, values) {
	let dom = selecto.options.sliderTemplate.content.cloneNode(true).firstElementChild;
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
	let originalValue = distinctValues.length == 1 ? distinctValues[0] : 0;

	let input = dom.querySelector("#input");

	if (distinctValues.length > 1) {
		input.indeterminate = true;
	}

	input.type = "range";
	input.id = first.id;
	input.onchange = e => {
		let newValue = e.target.value;
		selecto.onFieldChanged(first.id, newValue);

		let valueIsDifferent = originalValue != newValue;

		if (newValue == 0 && input.indeterminate == true) {
			valueIsDifferent = false;
		}

		changeReceiver.classList.toggle("changed", valueIsDifferent);
		if (reset !== null) {
			reset.classList.toggle("changed", valueIsDifferent);
		}
	};
	if (reset !== null) {
		reset.onclick = e => {
			input.value = originalValue;
			input.dispatchEvent(new Event("change"));
		};
	}

	let minOption = document.createElement("option");
	let maxOption = document.createElement("option");

	if (distinctValues.length > 1) {
		input.value = 0;
	} else {
		input.value = distinctValues[0];
	}
	let min = getDistinctValues(fields, f => f.range.from);
	let max = getDistinctValues(fields, f => f.range.to);

	if (min.length == 1 && max.length == 1) {
		input.min = min[0];
		input.max = max[0];
		minOption.label = min[0];
		maxOption.label = max[0];

		if (typeof min[0] === "string") {
			minOption.value = 0.0;
			maxOption.value = 100.0;
		} else {
			minOption.value = min[0];
			maxOption.value = max[0];
		}
	} else {

	}

	let datalistId = `${first.id}-values`;

	input.setAttribute("list", datalistId);

	let datalist = document.createElement("datalist");
	datalist.id = datalistId;
	datalist.appendChild(minOption);
	datalist.appendChild(maxOption);

	dom.appendChild(datalist);

	return dom;
}