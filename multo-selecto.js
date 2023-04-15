function MultoSelecto(destinationContainer) {
	this.container = destinationContainer;
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
	let container = document.createElement("div");
	container.classList.add("input-element");

	let label = document.createElement("label");
	label.innerText = first.name;
	label.for = first.id;

	let br = document.createElement("br");

	let distinctValues = getDistinctValues(values);
	let originalValue = distinctValues.length == 1 ? distinctValues[0] : null;

	let input = document.createElement("input");
	input.type = "range";
	input.id = first.id;
	input.onchange = e => {
		let newValue = e.target.value;
		selecto.onFieldChanged(first.id, newValue);

		container.classList.toggle("changed", originalValue !== newValue);
	};

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

	container.appendChild(label);
	container.appendChild(br);
	container.appendChild(input);
	container.appendChild(datalist);

	return container;
}

// create a combobox from multiple field definitions
function getEnumDom(selecto, first, fields, values) {
	let container = document.createElement("div");
	container.classList.add("input-element");

	let label = document.createElement("label");
	label.innerText = first.name;
	label.for = first.id;

	let br = document.createElement("br");

	let distinctValues = getDistinctValues(values);
	let originalValue = distinctValues.length == 1 ? distinctValues[0] : null;

	let input = document.createElement("select");
	input.id = first.id;
	input.onchange = e => {
		let newValue = e.target.value;
		selecto.onFieldChanged(first.id, newValue);

		container.classList.toggle("changed", originalValue !== newValue);
	};

	if (distinctValues.length > 1) {
		let option = document.createElement("option");
		option.innerText = "Multiple values";
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

	container.appendChild(label);
	container.appendChild(br);
	container.appendChild(input);

	return container;
}

// create a checkbox from multiple field definitions
function getBoolDom(selecto, first, fields, values) {
	let container = document.createElement("div");
	container.classList.add("input-element");

	let label = document.createElement("label");
	label.innerText = first.name;
	label.for = first.id;

	let br = document.createElement("br");

	let distinctValues = getDistinctValues(values);

	let originalValue = distinctValues.length == 1 ? distinctValues[0] : null;

	let input = document.createElement("input");
	input.type = "checkbox";
	input.id = first.id;
	input.onchange = e => {
		let newValue = e.target.checked;
		selecto.onFieldChanged(first.id, newValue);

		container.classList.toggle("changed", originalValue !== newValue);
	};

	if (distinctValues.length > 1) {
		input.indeterminate = true;
	} else {
		input.checked = distinctValues[0];
	}

	container.appendChild(label);
	container.appendChild(br);
	container.appendChild(input);

	return container;
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
