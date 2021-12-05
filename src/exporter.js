const fs = require('fs');
const { fetchJson } = require('./modules/fetch');

const getOrderHistoryUrl = 'https://api.mouser.com/api/v1/orderhistory/ByDateFilter';
const getOrderDetailsUrl = 'https://api.mouser.com/api/v1/order';
const getSearchByPartNumberUrl = 'https://api.mouser.com/api/v1/search/partnumber';

async function getOrderHistory(orderApiKey) {
	const response = await fetchJson('GET', `${getOrderHistoryUrl}?apiKey=${orderApiKey}&dateFilter=All`);

	if (!response.success) {
		console.error(response.error);

		return [];
	}

	return response.data.OrderHistoryItems;
}

async function getOrderItems(orderApiKey, orderNumber) {
	const response = await fetchJson('GET', `${getOrderDetailsUrl}/${orderNumber}?apiKey=${orderApiKey}`);

	if (!response.success) {
		console.error(response.error);

		return [];
	}

	return response.data.OrderLines;
}

async function getItemDetails(searchApiKey, orderItems) {
	if (orderItems.length == 0) {
		console.warn('No order items are present, skipping extended data gathering');

		return;
	}

	const itemDetails = [];
	let mouserPartNumbers = orderItems.map((item) => item.MouserPartNumber);

	mouserPartNumbers = Array.from(new Set(mouserPartNumbers)); // Removing duplicates

	for (let i = 0; i < mouserPartNumbers.length; i += 10) {
		const partNumberQuery =  mouserPartNumbers.slice(i, i + 10).join('|');
		const response = await fetchJson('POST', `${getSearchByPartNumberUrl}?apiKey=${searchApiKey}`, {
			SearchByPartRequest: {
				mouserPartNumber: partNumberQuery,
				partSearchOptions: '3'
			}
		});

		if (!response.success) {
			console.error(response.error);

			return [];
		}

		itemDetails.push(...response.data.SearchResults.Parts);
	}

	return itemDetails;
}

async function exportToCsv(orderItems, { output, columns }) {
	if (orderItems.length == 0) {
		console.warn('No order items are present, ending export process');

		return;
	}

	let fileContent = '';
	let columnArray;

	if (typeof columns == 'undefined' || columns.length === 0) {
		columnArray = Object.keys(orderItems[0]);
	} else {
		columnArray = columns.split(',').map((column) => column.trim());
	}

	fileContent += columnArray.join(';');
	fileContent += '\n';

	for (item of orderItems) {
		let row = columnArray.map((column) => {
			itemDetail = item[column];

			if (Array.isArray(itemDetail) || typeof itemDetail === 'object') {
				return JSON.stringify(itemDetail);
			}

			return itemDetail;
		});

		fileContent += row.join(';');
		fileContent += '\n';
	}

	await new Promise((resolve, reject) => {
		fs.writeFile(output, fileContent, (err, data) => {
			if (err) {
				console.error(err);
				reject(err);

				return;
			}

			resolve(data);
		});
	});
}

async function fetchOrders({ orderApiKey, searchApiKey, orderNumbers = [], extendedSearch }) {
	if (typeof orderApiKey == 'undefined') {
		log.error('You have to provide an API key to be able to fetch your order data!');

		return;
	}

	console.log('Fetching your order history...');

	const everyOrderItems = [];
	const orderHistory = await getOrderHistory(orderApiKey);

	console.log(`Order history retrieved, ${orderHistory.length} orders in your account`);

	for (order of orderHistory) {
		const orderNumber = parseInt(order.PoNumber, 10);

		if (orderNumbers.length > 0 && orderNumbers.indexOf(orderNumber) === -1) {
			continue;
		}

		const orderItems = await getOrderItems(orderApiKey, orderNumber);

		console.log(`Order details retrieved, [${orderNumber}]: ${orderItems.length} items`);

		orderItems.forEach((item) => item.OrderNumber = orderNumber);

		everyOrderItems.push(...orderItems);
	}

	if (extendedSearch) {
		console.log('Gathering extended item details...');

		const itemDetails = await getItemDetails(searchApiKey, everyOrderItems);

		everyOrderItems.map(item => {
			const itemDetail = itemDetails.find((detail) => detail.MouserPartNumber === item.MouserPartNumber);

			return Object.assign(item, itemDetail);
		});
	}

	return everyOrderItems;
}

async function exportOrders(options) {
	const orderItems = await fetchOrders(options);

	console.log(`Order details are fetched, ${orderItems.length} item details are collected, saving to csv...`);

	await exportToCsv(orderItems, options);
}

module.exports = {
	exportOrders,
	fetchOrders
};