
export function getDistinctValues(values, selector) {
	return values.reduce((found, next) => {
		let value = selector != null ? selector(next) : next;
		if (!found.includes(value)) {
			found.push(value);
		}
		return found
	}, []);
}