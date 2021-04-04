const fs = require('fs');
const { fetchJson } = require('./modules/fetch');

const getOrderHistoryUrl = 'https://api.mouser.com/api/v1/orderhistory/ByDateFilter';
const getOrderDetailsUrl = 'https://api.mouser.com/api/v1/order';

async function getOrderHistory(apiKey) {
	const response = await fetchJson('GET', `${getOrderHistoryUrl}?apiKey=${apiKey}&dateFilter=All`);

	if (!response.success) {
		console.error(response.error);

		return [];
	}

	return response.data.OrderHistoryItems;
}

async function getOrderItems(apiKey, orderNumber) {
	const response = await fetchJson('GET', `${getOrderDetailsUrl}/${orderNumber}?apiKey=${apiKey}`);

	if (!response.success) {
		console.error(response.error);

		return [];
	}

	return response.data.OrderLines;
}

async function exportToCsv(orderItems, { output, columns }) {
	if (orderItems.length == 0) {
		console.warn('No order items are present, ending export process');

		return;
	}

	let columnArray = columns.split(',').map((column) => column.trim());

	let fileContent = '';

	if (columnArray.length === 0) {
		columnArray = Object.keys(orderItems[0]);
	}

	fileContent += columnArray.join(';');
	fileContent += '\n';

	for (item of orderItems) {
		let row = columnArray.map((column) => item[column]);

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

async function fetchOrders(apiKey) {
	if (typeof apiKey == 'undefined') {
		log.error('You have to provide an API key to be able to fetch your order data!');

		return;
	}

	console.log('Fetching your order history...');

	const everyOrderItems = [];
	const orderHistory = await getOrderHistory(apiKey);

	console.log(`Order history retrieved, ${orderHistory.length} orders in your account`);

	for (order of orderHistory) {
		const orderNumber = order.PoNumber;
		const orderItems = await getOrderItems(apiKey, orderNumber);

		console.log(`Order details retrieved, [${orderNumber}]: ${orderItems.length} items`);

		orderItems.forEach((item) => item.OrderNumber = orderNumber);

		everyOrderItems.push(...orderItems);
	}

	return everyOrderItems;
}

async function exportOrders({ apiKey, output, columns }) {
	const orderItems = await fetchOrders(apiKey);

	console.log(`Order details are fetched, ${orderItems.length} item details are collected, saving to csv...`);

	await exportToCsv(orderItems, { output, columns });
}

module.exports = {
	exportOrders,
	fetchOrders
};