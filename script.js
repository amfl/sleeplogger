var INFILE = 'sleep.log'

function assert(condition, message) {
	if (!condition) {
		throw message || "Assertion failed";
	}
}

// Various time units in ms
var ONE_SECOND = 1000;
var ONE_MINUTE = ONE_SECOND * 60;
var ONE_HOUR   = ONE_MINUTE * 60;
var ONE_DAY    = ONE_HOUR * 24;

function daysBetween(date1, date2) {
	// // adjust diff for for daylight savings
	// var hoursToAdjust = Math.abs(date1.getTimezoneOffset() /60) - Math.abs(date2.getTimezoneOffset() /60);
	// // apply the tz offset
	// date2.addHours(hoursToAdjust); 

	// Convert both dates to milliseconds
	var date1_ms = date1.getTime()
	var date2_ms = date2.getTime()

	// Calculate the difference in milliseconds
	var difference_ms = date2_ms - date1_ms

	return difference_ms/ONE_DAY
}

// // Yoink http://stackoverflow.com/questions/16252448/how-to-calculate-the-proportional-color-between-the-three-given-with-a-percentag
// function getColorForPercentage(pct) {
// 	pct /= 100;

// 	var percentColors = [
// 			{ pct: 0.01, color: { r: 0xdd, g: 0x51, b: 0x4c } },
// 			{ pct: 0.5, color: { r: 0xfa, g: 0xa7, b: 0x32 } },
// 			{ pct: 1.0, color: { r: 0x5e, g: 0xb9, b: 0x5e }} ];

// 	for (var i = 0; i < percentColors.length; i++) {
// 		if (pct <= percentColors[i].pct) {
// 			var lower = percentColors[i - 1] || { pct: 0.1, color: { r: 0x0, g: 0x00, b: 0 } };
// 			var upper = percentColors[i];
// 			var range = upper.pct - lower.pct;
// 			var rangePct = (pct - lower.pct) / range;
// 			var pctLower = 1 - rangePct;
// 			var pctUpper = rangePct;
// 			var color = {
// 				r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
// 				g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
// 				b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
// 			};
// 			return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
// 		}
// 	}
// }

function _createBar(dayIndex, boxLeft, boxWidth, fromDate, toDate) {
	// Check to see if we need to add a new day line.
	var dayLine = $('#day-'+dayIndex);
	if (dayLine.length == 0) {
		$('#graph').prepend(dayLine = $('<div>').addClass('line').attr('id', 'day-'+dayIndex));
	} 

	dayLine.append($('<div>')
		.addClass('datum')
		.prop('title', fromDate + '\n' + toDate)
		.css('width', boxWidth * 100 + '%')
		.css('left', boxLeft * 100 + '%'));
}

function createBar(fromDate, toDate) {

	// var fromProportion = proportionThroughDay(fromDate);
	// var toProportion   = proportionThroughDay(toDate);

	// Calculate the offset from the start of the day
	var dayStart = new Date(fromDate.getTime());
	dayStart.setHours(0,0,0,0);
	dayIndex = Math.floor(dayStart.getTime() / ONE_DAY);
	boxLeft = daysBetween(dayStart, fromDate)

	var boxWidth = daysBetween(fromDate, toDate);

	while (boxLeft + boxWidth > 1) {
		var tempWidth = 1-boxLeft
		_createBar(dayIndex, boxLeft, tempWidth, fromDate, toDate);
		boxLeft = 0;
		boxWidth -= tempWidth;
		dayIndex++;
	}
	_createBar(dayIndex, boxLeft, boxWidth, fromDate, toDate);

	
	// assert(false);
}

// function proportionThroughDay(date) {
// 	var result = date.getHours() * ONE_HOUR +
// 	             date.getMinutes() * ONE_MINUTE +
// 	             date.getSeconds() * ONE_SECOND +
// 	             date.getMilliseconds();

// 	return result / ONE_DAY;
// }

function buildLegend() {
	// Build the legend
	elem = $('<div>').addClass('legend');
	for (var i=0;i<24;i++) {
		elem.append($('<div>')
			.text(i.toString())
			.addClass('divider'));
	}
	return elem;
}

$(function() {
	graph = $('#graph')

	graph.prepend(buildLegend());

	// Get the input data
	$.get(INFILE, function(data) {
		lines = data.split('\n')

		var lastSleptDate = null;
		var lastAwakeDate = null;
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].length == 0 || lines[i][0] == '#') continue;
			datum = lines[i].split(' ');

			// Store whether we awoke or fell asleep at this date
			transition = datum[0];

			// Convert the date into JS's built-in datetime format.
			strDate = $.trim(datum[1].replace(/\./g, '-')+'T'+datum[2].replace(/\-/g, ':'))
			date = new Date(strDate)

			if (transition == 's') {
				if (lastSleptDate == null) {
					lastSleptDate = date;
				}
			}
			else if (transition == 'a') {
				if (lastSleptDate != null) {
					createBar(lastSleptDate, date);

					lastSleptDate = null
				}
				else {
					// Assume that last time we 'woke up', we drifted straight
					// back to sleep again shortly after, because we forgot to press the
					// sleep button.
					synthesizedSleepDate = new Date(lastAwakeDate.getTime() + 4 * ONE_MINUTE);
					createBar(synthesizedSleepDate, date);
				}
				lastAwakeDate = date;
			}
		}
		graph.prepend(buildLegend());

	}, 'text')
});
