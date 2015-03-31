Pandora.open([
	'jquery',
	'store',
	'getContext',
	'utilities',
	'save'
], function($, S, getContext, Utils, Save) {
	'use strict';

	var loadedPrettify = false,
		initFunctions = {
			inputNumber: function(ctx) {
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
			},
			pre: function(ctx) {
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
			},
			dropdown: function(ctx) {
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
		select = function(ctx) {
			var context = getContext(ctx);
			for (var a in this.initFunctions) {
				if (typeof this.initFunctions[a] === 'function') {
					this.initFunctions[a].apply(null, [context]);
				}
			}
		},
		modal = (function() {
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

			initFunctions.modal = function() {
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
			};
			return {
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

		tabs = (function() {

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

			initFunctions.tabs = function(context) {
				ctx = context;
				render();
			};
			return {
				config: function(options) {
					cfg = $.extend(cfg, options);
					render();
				}
			};
		})();


	Save('ui', {
		initFunctions: initFunctions,
		select: select,
		modal: modal,
		tabs: tabs
	});
});