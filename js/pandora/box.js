(function() {

	'use strict';

	var Pandora = {

		open: function(requiredArray, callback) {
			if (typeof jQuery === 'function') {
				Pandora.box.jquery = jQuery;
				jQuery('document').ready(function() {
					var req = requiredArray || [],
						cbk = callback || {},
						incomplete = [],
						len = req.length,
						args = [];

					for (var i = 0; i < len; i++) {
						if (typeof Pandora.box[req[i]] !== 'undefined') {
							if (typeof Pandora.box[req[i]].init === 'function') {
								Pandora.box[req[i]].init();
							}
							args.push(Pandora.box[req[i]]);

						} else {
							incomplete.push(req[i]);
							Pandora.box.log('Error loading "' + req[i] + '".');
						}
					}
					if (incomplete.length === 0) {
						cbk.apply(null, args);
					} else {
						Pandora.box.log('Errors. Some components are not loaded.');
					}
				});
			}
			return this;
		},
		box: {
			log: function(str) {
				try {
					console.log(str);
				} catch (e) {};
			},
			save: function(name, obj) {
				Pandora.box[name] = obj;
			},
			getContext: function(context) {
				var ctx = context || '',
					nexus = (ctx === '') ? '' : ' ';
				return ctx + nexus;
			}
		}
	};

	window.Pandora = Pandora;
})();