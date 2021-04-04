# ExportMouserOrders

- [ExportMouserOrders](#exportmouserorders)
	- [Description](#description)
	- [How to use](#how-to-use)
	- [API keys](#api-keys)
	- [Available options](#available-options)
	- [Options file](#options-file)
	- [Using as node module](#using-as-node-module)

## Description

This small script helps you to export your mouser orders into a csv file.

## How to use

You need an installed node version on your computer and a terminal to run the script. In your terminal (Windows: cmd, Linux/Mac OS: terminal) you need to enter the following commands:

Before your first run, you have to initialise your workspace by installing the depemdencies:

```terminal
npm i
```

Then with the following command, (the given options are optional) you can fetch and save your order details into a csv file:

```terminal
node export-orders [ --orderApiKey={YOUR_API_KEY} --output={OUTPUT_PATH} ... ]
```

You can always read the help for this command by typing the following:

```
node export-orders --help
```

## API keys

You need working API keys from mouser, which can be requested [on this page](https://www.mouser.de/MyAccount/ManageApis). It should be a 36 character long arbitrary string. You also have to enable both the Order and Order history API access for your key.

The search API key is only required when you want to request extended product informations from mouser

## Available options

- __orderApiKey__: Required, you need to provide your API key here as a string. [How to generate my own API key?](#api-key)
- __searchApiKey__: Only required when you enable the extended search option. You have to request it, just like the orderApiKey. [How to generate my own API key?](#api-key)
- __extendedSearch__: Requesting extended product informations, which can be saved in the export. This option is a boolean value, default is false
- __output__: Required, this string will determine the output file's path, without this, the script wouldn't be able to save the fetched details. The ./output/*.csv wildcard is added to the gitignore file, so your exports won't be visible in your local git history. __IMPORTANT__: You have to create the folder for the output, otherwise the export script will fail! (node won't create the path for you by default)
- __columns__: Optional, default will put all available columns in your export. This is a comma separated string, which contains the column names for the export process. If the column doesn't exists, then it will fill up with empty values. (might be usefull for post process tasks to have those already generated). Example string: "OrderNumber, Manufacturer, MfrPartNumber, Description, Quantity, ExtendedPrice"

## Options file

You can provide an external option file if you don't want to type them into the command line every time you are running this script. You should put your options in the ```options.json``` file in the project's root folder. (don't worry, it's added to the gitignore file, so it won't be visible in your git if you cloned this repo) The options file's content should look like this:

```
{
	"orderApiKey": "YOUR_ORDER_API_KEY",
	"searchApiKey": "YOUR_SEARCH_API_KEY",
	"extendedSearch": true,
	"output": "./output/exported-orders.csv",
	"columns: "OrderNumber, Manufacturer, MfrPartNumber, Description, Quantity, ExtendedPrice"
}
```

## Using as node module

You can also use this project as a module in your application. The following functions are available if you import the project:

- fetchOrders: It will fetch every orders and return the items as an array. The input parameter is your apiKey
- exportOrders: Same as the command line behaviour, the input parameter is an object, which expects the options parameters