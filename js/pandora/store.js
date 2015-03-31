Pandora.open([
	'jquery',
	'save'
], function($, Save) {
	'use strict';
	var Store = {
		$window : $(window),
		$body : $('body')
	};

	Save('store',Store);
});