Pandora.open([
	'jquery',
	'store',
	'getContext',
	'utilities',
	'save'
], function($, S, getContext, U, Save) {

	'use strict';

	var list = [],
		length = 0,

		test = function(data) {
			var winHeight = S.$window.height(),
				elemRect = data.node.getBoundingClientRect();
			var top = parseInt(winHeight - elemRect.top),
				visible = (top >= data.from) ? true : false,
				ready = (top >= winHeight) ? true : false;
			return {
				ready: ready,
				visible: visible
			};
		},

		addElement = function(node, dataSoftlight) {
			var data = $.extend({
				node: node,
				from: 50
			}, U.parseData(dataSoftlight));
			var isReady = test(data).ready;
			console.log(isReady);
		};



	var SoftLight = {
		select: function(context, classSelection) {
			var ctx = getContext(context),
				cl = classSelection || 'softlight';
			$(ctx + '.' + cl).each(function() {
				var data = $(this).attr('data-softlight');
				addElement(this, data);
			});
		}
	}


	Save('softlight', SoftLight);
});