const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const optionalRequire = require('optional-require')(require);
const exporter = require('./src/exporter');

const externalOptions = optionalRequire('./options.json') || {};

const argumentOptions = yargs(hideBin(process.argv))
	.command('> node export-orders --apiKey={API_KEY} [...options]',
			 'It fetch your orders and then exports the details into a csv file using the defaults')
	.option({
		apiKey: {
			type: 'string',
			description: 'Your API key for your mouser account'
		},
		output: {
			type: 'string',
			description: 'Destination path to your export file'
	}
	});

const options = Object.assign(externalOptions, argumentOptions.argv);

console.log("The following options are provided:", options);

exporter.exportOrders(options);