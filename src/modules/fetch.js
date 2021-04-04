const fetch              = require('node-fetch');
const jsonContentType    = 'application/json;charset=utf-8';
const accept             = 'application/json;charset=utf-8';
const defaultJsonOptions = {
	headers: {
		'Content-Type': jsonContentType,
		'Accept': accept // eslint-disable-line quote-props
	}
};

async function handleResponse(response) {
	let responseData = await response.text(),
		processedResponse = { success: true, data: null, error: null };

	if (!response.ok) {
		processedResponse.success = false;

		try {
			processedResponse.error = JSON.parse(responseData);
		} catch(err) {
			processedResponse.error = responseData;
		}

		return processedResponse;
	}

	if (typeof responseData == 'undefined' || responseData === null || responseData === '') {
		return processedResponse;
	}

	try {
		processedResponse.data = JSON.parse(responseData);
	} catch (err) {
		processedResponse.success = false;
		processedResponse.data = responseData;
		processedResponse.error = err;
	}

	return processedResponse;
}

function handleError(err) {
	console.error(err);

	return { success: false, data: null, error: err };
}

function fetchJson(method, url, data = null, options = {}) {
	let mergedOptions = Object.assign({}, defaultJsonOptions, options, { method: method });

	if (data !== null) {
		mergedOptions.body = JSON.stringify(data);
	}

	return fetch(url, mergedOptions)
		.then(handleResponse)
		.catch(handleError);
}

module.exports = { fetchJson };