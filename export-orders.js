const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const optionalRequire = require('optional-require')(require);
const exporter = require('./src/exporter');

const externalOptions = optionalRequire('./options.json') || {};

const argumentOptions = yargs(hideBin(process.argv))
	.command('> node export-orders --orderApiKey={API_KEY} [...options]',
			 'It fetch your orders and then exports the details into a csv file using the defaults')
	.option({
		orderApiKey: {
			type: 'string',
			description: 'Your order API key for your mouser account'
		},
		searchApiKey: {
			type: 'string',
			description: 'Your search API key for your mouser account'
		},
		extendedSearch: {
			type: 'boolean',
			description: 'If this flag is true, then the script will fetch extended informations for the ordered items'
		},
		output: {
			type: 'string',
			description: 'Destination path to your export file'
		},
		columns: {
			type: 'string',
			description: 'The output column names, comma separated list as string, By default every column will be exported'
		}
	});

const options = Object.assign(externalOptions, argumentOptions.argv);

console.log("The following options are provided:", options);

exporter.exportOrders(options);