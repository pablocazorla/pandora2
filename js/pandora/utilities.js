Pandora.open([
	'jquery',
	'save'
], function($, Save) {

	'use strict';

	var U = {};

	U.parseData = function(data) {
		var obj = {};
		try{
			var obj = $.parseJSON($.trim(data.replace(/\'/g, '"')));
		}catch(e){};
		
		return obj;
	};
	U.cssfix = (function() {
		var style = document.createElement('dummy').style,
			prefixes = 'Webkit Moz O ms Khtml'.split(' '),
			memory = {};
		return function(prop) {
			if (typeof memory[prop] === "undefined") {

				var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
					props = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');

				memory[prop] = null;
				for (var i in props) {
					if (style[props[i]] !== undefined) {
						memory[prop] = props[i];
						break;
					}
				}
			}
			return memory[prop];
		};
	})();

	U.load = function(options) {
		var cfg = $.extend({
			url: null,
			parameters: 'async=true',
			onSuccess: function(data) {},
			onError: function(data) {}
		}, options);

		if (typeof cfg.url === 'string') {
			var nexus = (cfg.url.indexOf('?') !== -1) ? '&' : '?';
			$.ajax({
				url: cfg.url + nexus + cfg.parameters,
				success: cfg.onSuccess,
				error: cfg.onError
			});
		}
	};


	Save('utilities', U);
});