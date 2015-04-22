<?php if(extension_loaded("zlib")){ob_start("ob_gzhandler");} header("Content-type: text/javascript"); ?>(function() {

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
})();Pandora.open([
	'jquery',
	'save'
], function($, Save) {
	'use strict';
	var Store = {
		$window : $(window),
		$body : $('body')
	};

	Save('store',Store);
});Pandora.open([
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
});Pandora.open([
	'jquery',
	'store',
	'getContext',
	'utilities',
	'save'
], function($, S, getContext, Utils, Save) {

	'use strict';


	var UI = {
		inputNumber: {
			init: function(ctx) {
				$(ctx + 'input[type="number"]').not('.rendered').each(function() {
					var $this = $(this).addClass('rendered'),
						$cont = $('<div class="button-number-cont"></div>'),
						$min = $('<a href="" class="button button-number">-</a>'),
						$max = $('<a href="" class="button button-number">+</a>'),
						min = parseInt($this.attr('min')),
						max = parseInt($this.attr('max')),
						orig = 1,
						changeNumValue = function(dif) {
							var v = parseInt($this.val()) + dif;
							if (isNaN(v)) {
								v = orig;
							} else {
								v = (v < min) ? min : v;
								v = (v > max) ? max : v;
								orig = v;
							}

							$this.val(v);
						};
					$cont.append($max).append($min);
					$this.after($cont);

					$min.click(function(e) {
						e.preventDefault();
						changeNumValue(-1);
					});
					$max.click(function(e) {
						e.preventDefault();
						changeNumValue(1);
					});
				});
			}
		},
		prettyfy: (function() {
			var loadedPrettify = false;
			return {
				init: function(ctx) {
					var somePre = false;
					$(ctx + 'pre').not('.no-print').each(function() {
						var $this = $(this).addClass('prettyprint');
						$this.text($this.html());
						somePre = true;
					});
					if (somePre) {
						if (!loadedPrettify) {
							$.getScript('//google-code-prettify.googlecode.com/svn/loader/run_prettify.js?skin=desert', function() {
								loadedPrettify = true;
								//prettyPrint();
							});
							/*'//google-code-prettify.googlecode.com/svn/loader/run_prettify.js?skin=desert'*/
						} else {
							prettyPrint();
						}
					}
				}
			};
		})(),
		dropdown: {
			init: function(ctx) {
				$(ctx + 'select.dropdown').each(function() {
					var $select = $(this).removeClass('dropdown').hide(),
						$options = $select.find('option'),
						$drop = $('<span class="dropdown"></span>'),
						$a = $('<a href="" class="button"></a>').text($options.filter(':selected').text()).appendTo($drop),
						$ul = $('<ul></ul>').appendTo($drop),
						strLi = '';
					for (var i = 0; i < $options.length; i++) {
						strLi += '<li><a href="">' + $options.eq(i).text() + '</a></li>';
					}
					$ul.html(strLi);
					$select.after($drop);
					if ($select.hasClass('to-top')) {
						$drop.addClass('to-top');
					}
					if ($select.hasClass('to-right')) {
						$drop.addClass('to-right');
					}
					$drop[0].dataSelect = $select;
				});

				$(ctx + '.dropdown').not('.rendered').each(function() {
					var $this = $(this),
						$btn = $this.addClass('rendered').find('> .button'),
						$ul = $this.find('> ul'),
						duration = 150,
						opened = false,
						changing = false;

					$btn.click(function(e) {
						e.preventDefault();
						if (!opened && !changing) {
							changing = true;
							$ul.fadeIn(duration, function() {
								opened = true;
								changing = false;
							});
						}
					});
					S.$window.click(function() {
						if (opened && !changing) {
							changing = true;
							$ul.fadeOut(duration, function() {
								opened = false;
								changing = false;
							});
						}
					});
					// For selects
					if (typeof this.dataSelect !== 'undefined') {
						var $options = this.dataSelect.find('option');
						$ul.find('a').each(function(index) {
							$(this).click(function(e) {
								e.preventDefault();
								$btn.text($(this).text());
								$options.eq(index).prop('selected', true);
							});
						});
					}
				});
			}
		},
		modal: (function() {
			var rendered = false,
				cfg = {
					timeToShow: 300,
					closeOnClickDimmer: false,
					contentLoading: '<div class="loading loading-modal">Loading...</div>'
				},

				showing = false,
				showed = false,

				content = undefined,

				showCallback = null,
				hideCallback = null,

				$dimmer = null,
				$modal = null,
				$toShow = null,
				$modalScroller = null,
				$modalContent = null,
				$modalCloser = null,
				$ctrls = null,

				setPosition = function() {
					var wh = S.$window.height(),
						padding = parseInt($modal.css('padding-top')) + parseInt($modal.css('padding-bottom')),
						mh = $modalContent.height() + padding,
						dif = parseInt(.5 * (wh - mh)),
						top = dif,
						height = 'auto',
						heightScroll = 'auto';

					if (dif < 10) {
						top = 10;
						height = (wh - 20) + 'px';
						heightScroll = (wh - 20 - padding) + 'px';
					}

					$modal.css({
						'top': top + 'px',
						'height': height
							//'max-height': height
					});
					$modalScroller.css({
						'scrollTop': 0,
						'height': heightScroll
					});
				},
				setControls = function(ct) {
					var ctrls = ct || null;
					if (ctrls !== null) {
						$modal.addClass('with-controls');
						$ctrls.append(ctrls);
					} else {
						$modal.removeClass('with-controls');
						$ctrls.html('');
					}
					return this;
				},
				show = function(cont) {
					if (!showing && !showed) {
						showing = true;

						var cnt = cont || content;
						if (cnt !== undefined) {
							$modalContent.html(cnt);
						}
						setPosition();

						$toShow.fadeIn(cfg.timeToShow, function() {
							showing = false;
							showed = true;
							if (typeof showCallback === 'function') {
								showCallback();
							}
						});
					}
					return this;
				},
				hide = function() {
					if (!showing && showed) {
						showing = true;
						$toShow.fadeOut(cfg.timeToShow, function() {
							showing = false;
							showed = false;
							if (typeof hideCallback === 'function') {
								hideCallback();
							}
						});
					}
					return this;
				},
				load = function(url, callback) {
					var cbk = callback || function() {};
					show(cfg.contentLoading);

					Utils.load({
						url: url,
						onSuccess: function(data) {
							$modalContent.html(data);
							setTimeout(function() {
								setPosition();
								setPositionForImage($modalContent.find('img'));
							}, 20);
							if (typeof cbk === 'function') {
								cbk();
							}
						},
						onError: function() {
							$modalContent.find('.loading').addClass('error').html('Sorry, there has been an error loading the content.<br>Please, try again.');
							setPosition();
						}
					});
					return this;
				},
				setPositionForImage = function($img) {
					$img.load(function() {
						setPosition();
					});
				},
				setContent = function(cont) {
					content = cont;
					return this;
				};

			return {
				init: function() {
					if (!rendered) {
						rendered = true;
						$dimmer = $('<div id="dimmer" class="dimmer" style="display:none"></div>').appendTo('body');
						$modal = $('<div id="modal" class="modal" style="display:none"></div>').appendTo('body');
						$modalScroller = $('<div id="modal-scroller" class="modal-scroller"></div>').appendTo($modal);
						$modalContent = $('<div id="modal-content" class="modal-content"></div>').appendTo($modalScroller);
						$modalCloser = $('<div id="modal-closer" class="button secondary smallest modal-closer">X</div>').appendTo($modal);
						$ctrls = $('<div id="modal-ctrls" class="modal-ctrls"></div>').appendTo($modal);

						$toShow = $modal.add($dimmer);

						setTimeout(function() {
							setPosition();
						}, 100);

						S.$window.resize(function() {
							setPosition();
						});
						$modalCloser.click(function() {
							hide();
						});
						$dimmer.click(function() {
							if (cfg.closeOnClickDimmer) {
								hide();
							}
						});
					}
				},
				config: function(options) {
					cfg = $.extend(cfg, options);
					return this;
				},
				onShow: function(callback) {
					showCallback = callback;
					return this;
				},
				onHide: function(callback) {
					hideCallback = callback;
					return this;
				},
				setContent: setContent,
				setControls: setControls,
				show: show,
				hide: hide,
				load: load
			};
		})(),

		tabs: (function() {

			var ctx = '',
				cfg = {
					cssClassContainer: 'tabs-container',
					cssClassTabList: 'tabs',
					cssClassTabContent: 'tab-content',
					initial: 0
				},
				render = function() {
					$(ctx + '.' + cfg.cssClassContainer).not('.rendered').each(function() {
						var $this = $(this),
							$tabs = $this.find('.' + cfg.cssClassTabList + ' li'),
							$contents = $this.find('.' + cfg.cssClassTabContent),
							current = -1,
							show = function(num) {
								if (num !== current) {
									$tabs.removeClass('active').eq(num).addClass('active');
									$contents.hide().eq(num).show();
									current = num;
								}
							};

						$tabs.each(function(index) {
							$(this).click(function() {
								show(index);
							});
						}).find('a').click(function(e) {
							e.preventDefault();
						});
						show(cfg.initial);
						$this.addClass('rendered');
					});
				};

			return {
				init: function(context) {
					ctx = context;
					render();
				},
				config: function(options) {
					cfg = $.extend(cfg, options);
					render();
				}
			};
		})(),

		// Select
		select: function(ctx) {
			var context = getContext(ctx);
			for (var a in this) {
				if (typeof this[a].init === 'function') {
					this[a].init(context);
				}
			}
		},
	};
	/*

		var 

			;

	*/
	Save('ui', UI);
});<?php if(extension_loaded("zlib")){ob_end_flush();}?>