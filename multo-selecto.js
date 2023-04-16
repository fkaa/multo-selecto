/**
 * Creates a new `MultoSelecto` object which handles populating the given
 * destination container with the available form options.
 */
function MultoSelecto(destinationContainer, options) {
	this.container = destinationContainer;
	this.options = options;
	this.setItems = function(items) {
		this.items = items;
		this.container.innerHTML = "";
		this.container.appendChild(createDom(this, items));
	};
	this.onFieldChanged = function(fieldId, value) {
		console.log(fieldId + ": " + value);
	};
}

function createDom(selecto, objects) {
	let container = document.createElement("div");
	container.classList.add("input-group");

	let fieldDescriptions = [];
	let fieldValues = [];
	objects.forEach(o => {
		o.fields.forEach((f, i) => {
			if (i >= fieldDescriptions.length) {
				fieldDescriptions.push([]);
				fieldValues.push([]);
			}
			fieldDescriptions[i].push(f);
			fieldValues[i].push(o.values[f.id]);
		});
	});

	console.log(fieldDescriptions);

	fieldDescriptions.forEach((descriptions, i) => {
		let dom = createDomForFields(selecto, descriptions, fieldValues[i]);
		container.appendChild(dom);
	});

	return container;
}

function createDomForFields(selecto, fields, values) {
	let first = fields[0];

	switch (first.type) {
		case "enum":
			return getEnumDom(selecto, first, fields, values);
		case "slider":
			return getSliderDom(selecto, first, fields, values);
		case "bool":
			return getBoolDom(selecto, first, fields, values);

		default:
			return document.createElement("p");
	}
}

// create a slider from multiple field definitions
function getSliderDom(selecto, first, fields, values) {
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

// create a combobox from multiple field definitions
function getEnumDom(selecto, first, fields, values) {
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

// create a checkbox from multiple field definitions
function getBoolDom(selecto, first, fields, values) {
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
	let isIndeterminate = distinctValues.length > 1;

	let input = dom.querySelector("#input");
	input.type = "checkbox";
	input.id = first.id;
	input.onchange = e => {
		let newValue = e.target.checked;
		selecto.onFieldChanged(first.id, newValue);

		let valueIsDifferent = originalValue !== newValue && !e.target.indeterminate;

		changeReceiver.classList.toggle("changed", valueIsDifferent);
		if (reset !== null) {
			reset.classList.toggle("changed", valueIsDifferent);
		}
	};
	if (reset !== null) {
		reset.onclick = e => {
			input.checked = originalValue;
			input.indeterminate = isIndeterminate;
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

function getDistinctValues(values, selector) {
	return values.reduce((found, next) => {
		let value = selector != null ? selector(next) : next;
		if (!found.includes(value)) {
			found.push(value);
		}
		return found
	}, []);
}
