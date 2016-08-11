import fs from 'fs';

module.exports = {
	getRandomInteger: function(low, high) {
		// (inclusive)
		return Math.floor(Math.random() * (high - low + 1)) + low;
	},

	getRandomNumber: function(low, high) {
		// (inclusive)
		return (Math.random() * (high - low + 1)) + low;
	},

	generateIPv4Address: function() {
		let hostPart1 = this.getRandomInteger(0, 9);
		let hostPart2 = this.getRandomInteger(0,255);
		return `10.0.${hostPart1}.${hostPart2}`;
	},

	getChar: function() {
		const characterRange = 'abcdefghijklmnopqrstuvwxyz0123456789';
		return characterRange.charAt(
			this.getRandomInteger(0, characterRange.length)
		);
	},

	getTag: function() {
		return  new Array(8).fill('').map(() => this.getChar()).join('') + '-' +
				new Array(4).fill('').map(() => this.getChar()).join('') + '-' +
				new Array(4).fill('').map(() => this.getChar()).join('') + '-' +
				new Array(4).fill('').map(() => this.getChar()).join('') + '-' +
				new Array(12).fill('').map(() => this.getChar()).join('') + '-';
	},

	write: function(filename, object) {
		let dir = `${__dirname}/out/`;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);

		let filepath = `${__dirname}/out/${filename}`;
		fs.writeFile(filepath, JSON.stringify(object, null, 2), function(err) {
			if (err) {
				return console.log(err);
			}

			console.log(`Wrote: ${filename}`);
		})
	},

	trim: function(object, props) {
		let copy = Object.assign({}, object);

		for (let prop of props) {
			delete copy[prop];
		}

		return copy;
	},

	roundTenth: function(num) {
		return Math.round(num * 10) / 10;
	}
};
