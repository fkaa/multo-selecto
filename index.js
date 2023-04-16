import { getSliderDom } from "./fields/slider.js";
import { getBoolDom } from "./fields/bool.js";
import { getEnumDom } from "./fields/enum.js";

/**
 * Creates a new `MultoSelecto` object which handles populating the given
 * destination container with the available form options.
 */
export class MultoSelecto {
	constructor(destinationContainer, options) {
		this.container = destinationContainer;
		this.options = options;
	}

	setItems(items) {
		this.items = items;
		this.container.innerHTML = "";
		this.container.appendChild(createDom(this, items));
	};

	onFieldChanged(fieldId, value) {
		console.log(fieldId + ": " + value);
	};
}

function createDom(selecto, objects) {
	const container = document.createElement("div");
	container.classList.add("input-group");

	const fieldDescriptions = [];
	const fieldValues = [];

	// Refactor #1
	// Using for...of instead of forEach improves performance
	for (const fieldObj of objects) {
		for (let index = 0; index < fieldObj.fields.length; index++) {
			const field = fieldObj[index]
			if (index >= fieldDescriptions.length) {
				fieldDescriptions.push([]);
				fieldValues.push([]);
			}
			fieldDescriptions[index].push(field);
			fieldValues[index].push(fieldObj.values[field.id]);
		}
	}

	console.log(fieldDescriptions);

	// Refactor #2
	// Using for loop for improved speed
	for (let index = 0; index < fieldDescriptions.length; index++) {
		const dom = createDomForFields(selecto, fieldDescriptions[index], fieldValues[index]);
		container.appendChild(dom);
	}

	return container;
}

export function createDomForFields(selecto, fields, values) {
	const first = fields[0];

	switch (first.type) {
		// NOTE
		// If method might end up using a lot of parameters
		// It is better to pass them within an object
		// So in this case we could use
		// `getEnumDom.call(selecto, { first, fields, values })`

		// What it does, we bind the instance of selecto into the methods 'this'
		// And the rest of the parameters are input as an object
		// So within the method we can do the following
		// const { first, fields, values } = params

		// Reason for this is that without typescript (and even without) a
		// method with multitude of parameters can be hard to maintain
		// (think at work we had 11 at some point and it was hell)

		// I could make the refactor here but I'd wait for your approval first

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

