/*!
 * jQuery Migrate - v3.0.0 - 2016-06-09
 * Copyright jQuery Foundation and other contributors
 */
(function( jQuery, window ) {
    "use strict";


    jQuery.migrateVersion = "3.0.0";


    ( function() {

        // Support: IE9 only
        // IE9 only creates console object when dev tools are first opened
        // Also, avoid Function#bind here to simplify PhantomJS usage
        var log = window.console && window.console.log &&
            function() { window.console.log.apply( window.console, arguments ); },
            rbadVersions = /^[12]\./;

        if ( !log ) {
            return;
        }

        // Need jQuery 3.0.0+ and no older Migrate loaded
        if ( !jQuery || rbadVersions.test( jQuery.fn.jquery ) ) {
            log( "JQMIGRATE: jQuery 3.0.0+ REQUIRED" );
        }
        if ( jQuery.migrateWarnings ) {
            log( "JQMIGRATE: Migrate plugin loaded multiple times" );
        }

        // Show a message on the console so devs know we're active
        log( "JQMIGRATE: Migrate is installed" +
            ( jQuery.migrateMute ? "" : " with logging active" ) +
            ", version " + jQuery.migrateVersion );

    } )();

    var warnedAbout = {};

// List of warnings already given; public read only
    jQuery.migrateWarnings = [];

// Set to false to disable traces that appear with warnings
    if ( jQuery.migrateTrace === undefined ) {
        jQuery.migrateTrace = true;
    }

// Forget any warnings we've already given; public
    jQuery.migrateReset = function() {
        warnedAbout = {};
        jQuery.migrateWarnings.length = 0;
    };

    function migrateWarn( msg ) {
        var console = window.console;
        if ( !warnedAbout[ msg ] ) {
            warnedAbout[ msg ] = true;
            jQuery.migrateWarnings.push( msg );
            if ( console && console.warn && !jQuery.migrateMute ) {
                console.warn( "JQMIGRATE: " + msg );
                if ( jQuery.migrateTrace && console.trace ) {
                    console.trace();
                }
            }
        }
    }

    function migrateWarnProp( obj, prop, value, msg ) {
        Object.defineProperty( obj, prop, {
            configurable: true,
            enumerable: true,
            get: function() {
                migrateWarn( msg );
                return value;
            }
        } );
    }

    if ( document.compatMode === "BackCompat" ) {

        // JQuery has never supported or tested Quirks Mode
        migrateWarn( "jQuery is not compatible with Quirks Mode" );
    }


    var oldInit = jQuery.fn.init,
        oldIsNumeric = jQuery.isNumeric,
        oldFind = jQuery.find,
        rattrHashTest = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/,
        rattrHashGlob = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/g;

    jQuery.fn.init = function( arg1 ) {
        var args = Array.prototype.slice.call( arguments );

        if ( typeof arg1 === "string" && arg1 === "#" ) {

            // JQuery( "#" ) is a bogus ID selector, but it returned an empty set before jQuery 3.0
            migrateWarn( "jQuery( '#' ) is not a valid selector" );
            args[ 0 ] = [];
        }

        return oldInit.apply( this, args );
    };
    jQuery.fn.init.prototype = jQuery.fn;

    jQuery.find = function( selector ) {
        var args = Array.prototype.slice.call( arguments );

        // Support: PhantomJS 1.x
        // String#match fails to match when used with a //g RegExp, only on some strings
        if ( typeof selector === "string" && rattrHashTest.test( selector ) ) {

            // The nonstandard and undocumented unquoted-hash was removed in jQuery 1.12.0
            // First see if qS thinks it's a valid selector, if so avoid a false positive
            try {
                document.querySelector( selector );
            } catch ( err1 ) {

                // Didn't *look* valid to qSA, warn and try quoting what we think is the value
                selector = selector.replace( rattrHashGlob, function( _, attr, op, value ) {
                    return "[" + attr + op + "\"" + value + "\"]";
                } );

                // If the regexp *may* have created an invalid selector, don't update it
                // Note that there may be false alarms if selector uses jQuery extensions
                try {
                    document.querySelector( selector );
                    migrateWarn( "Attribute selector with '#' must be quoted: " + args[ 0 ] );
                    args[ 0 ] = selector;
                } catch ( err2 ) {
                    migrateWarn( "Attribute selector with '#' was not fixed: " + args[ 0 ] );
                }
            }
        }

        return oldFind.apply( this, args );
    };

// Copy properties attached to original jQuery.find method (e.g. .attr, .isXML)
    var findProp;
    for ( findProp in oldFind ) {
        if ( Object.prototype.hasOwnProperty.call( oldFind, findProp ) ) {
            jQuery.find[ findProp ] = oldFind[ findProp ];
        }
    }

// The number of elements contained in the matched element set
    jQuery.fn.size = function() {
        migrateWarn( "jQuery.fn.size() is deprecated; use the .length property" );
        return this.length;
    };

    jQuery.parseJSON = function() {
        migrateWarn( "jQuery.parseJSON is deprecated; use JSON.parse" );
        return JSON.parse.apply( null, arguments );
    };

    jQuery.isNumeric = function( val ) {

        // The jQuery 2.2.3 implementation of isNumeric
        function isNumeric2( obj ) {
            var realStringObj = obj && obj.toString();
            return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
        }

        var newValue = oldIsNumeric( val ),
            oldValue = isNumeric2( val );

        if ( newValue !== oldValue ) {
            migrateWarn( "jQuery.isNumeric() should not be called on constructed objects" );
        }

        return oldValue;
    };

    migrateWarnProp( jQuery, "unique", jQuery.uniqueSort,
        "jQuery.unique is deprecated, use jQuery.uniqueSort" );

// Now jQuery.expr.pseudos is the standard incantation
    migrateWarnProp( jQuery.expr, "filters", jQuery.expr.pseudos,
        "jQuery.expr.filters is now jQuery.expr.pseudos" );
    migrateWarnProp( jQuery.expr, ":", jQuery.expr.pseudos,
        "jQuery.expr[\":\"] is now jQuery.expr.pseudos" );


    var oldAjax = jQuery.ajax;

    jQuery.ajax = function( ) {
        var jQXHR = oldAjax.apply( this, arguments );

        // Be sure we got a jQXHR (e.g., not sync)
        if ( jQXHR.promise ) {
            migrateWarnProp( jQXHR, "success", jQXHR.done,
                "jQXHR.success is deprecated and removed" );
            migrateWarnProp( jQXHR, "error", jQXHR.fail,
                "jQXHR.error is deprecated and removed" );
            migrateWarnProp( jQXHR, "complete", jQXHR.always,
                "jQXHR.complete is deprecated and removed" );
        }

        return jQXHR;
    };


    var oldRemoveAttr = jQuery.fn.removeAttr,
        oldToggleClass = jQuery.fn.toggleClass,
        rmatchNonSpace = /\S+/g;

    jQuery.fn.removeAttr = function( name ) {
        var self = this;

        jQuery.each( name.match( rmatchNonSpace ), function( i, attr ) {
            if ( jQuery.expr.match.bool.test( attr ) ) {
                migrateWarn( "jQuery.fn.removeAttr no longer sets boolean properties: " + attr );
                self.prop( attr, false );
            }
        } );

        return oldRemoveAttr.apply( this, arguments );
    };

    jQuery.fn.toggleClass = function( state ) {

        // Only deprecating no-args or single boolean arg
        if ( state !== undefined && typeof state !== "boolean" ) {
            return oldToggleClass.apply( this, arguments );
        }

        migrateWarn( "jQuery.fn.toggleClass( boolean ) is deprecated" );

        // Toggle entire class name of each element
        return this.each( function() {
            var className = this.getAttribute && this.getAttribute( "class" ) || "";

            if ( className ) {
                jQuery.data( this, "__className__", className );
            }

            // If the element has a class name or if we're passed `false`,
            // then remove the whole classname (if there was one, the above saved it).
            // Otherwise bring back whatever was previously saved (if anything),
            // falling back to the empty string if nothing was stored.
            if ( this.setAttribute ) {
                this.setAttribute( "class",
                    className || state === false ?
                        "" :
                        jQuery.data( this, "__className__" ) || ""
                );
            }
        } );
    };


    var internalSwapCall = false;

// If this version of jQuery has .swap(), don't false-alarm on internal uses
    if ( jQuery.swap ) {
        jQuery.each( [ "height", "width", "reliableMarginRight" ], function( _, name ) {
            var oldHook = jQuery.cssHooks[ name ] && jQuery.cssHooks[ name ].get;

            if ( oldHook ) {
                jQuery.cssHooks[ name ].get = function() {
                    var ret;

                    internalSwapCall = true;
                    ret = oldHook.apply( this, arguments );
                    internalSwapCall = false;
                    return ret;
                };
            }
        } );
    }

    jQuery.swap = function( elem, options, callback, args ) {
        var ret, name,
            old = {};

        if ( !internalSwapCall ) {
            migrateWarn( "jQuery.swap() is undocumented and deprecated" );
        }

        // Remember the old values, and insert the new ones
        for ( name in options ) {
            old[ name ] = elem.style[ name ];
            elem.style[ name ] = options[ name ];
        }

        ret = callback.apply( elem, args || [] );

        // Revert the old values
        for ( name in options ) {
            elem.style[ name ] = old[ name ];
        }

        return ret;
    };

    var oldData = jQuery.data;

    jQuery.data = function( elem, name, value ) {
        var curData;

        // If the name is transformed, look for the un-transformed name in the data object
        if ( name && name !== jQuery.camelCase( name ) ) {
            curData = jQuery.hasData( elem ) && oldData.call( this, elem );
            if ( curData && name in curData ) {
                migrateWarn( "jQuery.data() always sets/gets camelCased names: " + name );
                if ( arguments.length > 2 ) {
                    curData[ name ] = value;
                }
                return curData[ name ];
            }
        }

        return oldData.apply( this, arguments );
    };

    var oldTweenRun = jQuery.Tween.prototype.run;

    jQuery.Tween.prototype.run = function( percent ) {
        if ( jQuery.easing[ this.easing ].length > 1 ) {
            migrateWarn(
                "easing function " +
                "\"jQuery.easing." + this.easing.toString() +
                "\" should use only first argument"
            );

            jQuery.easing[ this.easing ] = jQuery.easing[ this.easing ].bind(
                jQuery.easing,
                percent, this.options.duration * percent, 0, 1, this.options.duration
            );
        }

        oldTweenRun.apply( this, arguments );
    };

    var oldLoad = jQuery.fn.load,
        originalFix = jQuery.event.fix;

    jQuery.event.props = [];
    jQuery.event.fixHooks = {};

    jQuery.event.fix = function( originalEvent ) {
        var event,
            type = originalEvent.type,
            fixHook = this.fixHooks[ type ],
            props = jQuery.event.props;

        if ( props.length ) {
            migrateWarn( "jQuery.event.props are deprecated and removed: " + props.join() );
            while ( props.length ) {
                jQuery.event.addProp( props.pop() );
            }
        }

        if ( fixHook && !fixHook._migrated_ ) {
            fixHook._migrated_ = true;
            migrateWarn( "jQuery.event.fixHooks are deprecated and removed: " + type );
            if ( ( props = fixHook.props ) && props.length ) {
                while ( props.length ) {
                    jQuery.event.addProp( props.pop() );
                }
            }
        }

        event = originalFix.call( this, originalEvent );

        return fixHook && fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
    };

    jQuery.each( [ "load", "unload", "error" ], function( _, name ) {

        jQuery.fn[ name ] = function() {
            var args = Array.prototype.slice.call( arguments, 0 );

            // If this is an ajax load() the first arg should be the string URL;
            // technically this could also be the "Anything" arg of the event .load()
            // which just goes to show why this dumb signature has been deprecated!
            // jQuery custom builds that exclude the Ajax module justifiably die here.
            if ( name === "load" && typeof args[ 0 ] === "string" ) {
                return oldLoad.apply( this, args );
            }

            migrateWarn( "jQuery.fn." + name + "() is deprecated" );

            args.splice( 0, 0, name );
            if ( arguments.length ) {
                return this.on.apply( this, args );
            }

            // Use .triggerHandler here because:
            // - load and unload events don't need to bubble, only applied to window or image
            // - error event should not bubble to window, although it does pre-1.7
            // See http://bugs.jquery.com/ticket/11820
            this.triggerHandler.apply( this, args );
            return this;
        };

    } );

// Trigger "ready" event only once, on document ready
    jQuery( function() {
        jQuery( document ).triggerHandler( "ready" );
    } );

    jQuery.event.special.ready = {
        setup: function() {
            if ( this === document ) {
                migrateWarn( "'ready' event is deprecated" );
            }
        }
    };

    jQuery.fn.extend( {

        bind: function( types, data, fn ) {
            migrateWarn( "jQuery.fn.bind() is deprecated" );
            return this.on( types, null, data, fn );
        },
        unbind: function( types, fn ) {
            migrateWarn( "jQuery.fn.unbind() is deprecated" );
            return this.off( types, null, fn );
        },
        delegate: function( selector, types, data, fn ) {
            migrateWarn( "jQuery.fn.delegate() is deprecated" );
            return this.on( types, selector, data, fn );
        },
        undelegate: function( selector, types, fn ) {
            migrateWarn( "jQuery.fn.undelegate() is deprecated" );
            return arguments.length === 1 ?
                this.off( selector, "**" ) :
                this.off( types, selector || "**", fn );
        }
    } );


    var oldOffset = jQuery.fn.offset;

    jQuery.fn.offset = function() {
        var docElem,
            elem = this[ 0 ],
            origin = { top: 0, left: 0 };

        if ( !elem || !elem.nodeType ) {
            migrateWarn( "jQuery.fn.offset() requires a valid DOM element" );
            return origin;
        }

        docElem = ( elem.ownerDocument || document ).documentElement;
        if ( !jQuery.contains( docElem, elem ) ) {
            migrateWarn( "jQuery.fn.offset() requires an element connected to a document" );
            return origin;
        }

        return oldOffset.apply( this, arguments );
    };


    var oldParam = jQuery.param;

    jQuery.param = function( data, traditional ) {
        var ajaxTraditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;

        if ( traditional === undefined && ajaxTraditional ) {

            migrateWarn( "jQuery.param() no longer uses jQuery.ajaxSettings.traditional" );
            traditional = ajaxTraditional;
        }

        return oldParam.call( this, data, traditional );
    };

    var oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack;

    jQuery.fn.andSelf = function() {
        migrateWarn( "jQuery.fn.andSelf() replaced by jQuery.fn.addBack()" );
        return oldSelf.apply( this, arguments );
    };


    var oldDeferred = jQuery.Deferred,
        tuples = [

            // Action, add listener, callbacks, .then handlers, final state
            [ "resolve", "done", jQuery.Callbacks( "once memory" ),
                jQuery.Callbacks( "once memory" ), "resolved" ],
            [ "reject", "fail", jQuery.Callbacks( "once memory" ),
                jQuery.Callbacks( "once memory" ), "rejected" ],
            [ "notify", "progress", jQuery.Callbacks( "memory" ),
                jQuery.Callbacks( "memory" ) ]
        ];

    jQuery.Deferred = function( func ) {
        var deferred = oldDeferred(),
            promise = deferred.promise();

        deferred.pipe = promise.pipe = function( /* fnDone, fnFail, fnProgress */ ) {
            var fns = arguments;

            migrateWarn( "deferred.pipe() is deprecated" );

            return jQuery.Deferred( function( newDefer ) {
                jQuery.each( tuples, function( i, tuple ) {
                    var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

                    // Deferred.done(function() { bind to newDefer or newDefer.resolve })
                    // deferred.fail(function() { bind to newDefer or newDefer.reject })
                    // deferred.progress(function() { bind to newDefer or newDefer.notify })
                    deferred[ tuple[ 1 ] ]( function() {
                        var returned = fn && fn.apply( this, arguments );
                        if ( returned && jQuery.isFunction( returned.promise ) ) {
                            returned.promise()
                                .done( newDefer.resolve )
                                .fail( newDefer.reject )
                                .progress( newDefer.notify );
                        } else {
                            newDefer[ tuple[ 0 ] + "With" ](
                                this === promise ? newDefer.promise() : this,
                                fn ? [ returned ] : arguments
                            );
                        }
                    } );
                } );
                fns = null;
            } ).promise();

        };

        if ( func ) {
            func.call( deferred, deferred );
        }

        return deferred;
    };
})( jQuery, window );
/*!
 * Stellar.js v0.6.2
 * http://markdalgleish.com/projects/stellar.js
 * 
 * Copyright 2013, Mark Dalgleish
 * This content is released under the MIT license
 * http://markdalgleish.mit-license.org
 */

;(function($, window, document, undefined) {

	var pluginName = 'stellar',
		defaults = {
			scrollProperty: 'scroll',
			positionProperty: 'position',
			horizontalScrolling: true,
			verticalScrolling: true,
			horizontalOffset: 0,
			verticalOffset: 0,
			responsive: false,
			parallaxBackgrounds: true,
			parallaxElements: true,
			hideDistantElements: true,
			hideElement: function($elem) { $elem.hide(); },
			showElement: function($elem) { $elem.show(); }
		},

		scrollProperty = {
			scroll: {
				getLeft: function($elem) { return $elem.scrollLeft(); },
				setLeft: function($elem, val) { $elem.scrollLeft(val); },

				getTop: function($elem) { return $elem.scrollTop();	},
				setTop: function($elem, val) { $elem.scrollTop(val); }
			},
			position: {
				getLeft: function($elem) { return parseInt($elem.css('left'), 10) * -1; },
				getTop: function($elem) { return parseInt($elem.css('top'), 10) * -1; }
			},
			margin: {
				getLeft: function($elem) { return parseInt($elem.css('margin-left'), 10) * -1; },
				getTop: function($elem) { return parseInt($elem.css('margin-top'), 10) * -1; }
			},
			transform: {
				getLeft: function($elem) {
					var computedTransform = getComputedStyle($elem[0])[prefixedTransform];
					return (computedTransform !== 'none' ? parseInt(computedTransform.match(/(-?[0-9]+)/g)[4], 10) * -1 : 0);
				},
				getTop: function($elem) {
					var computedTransform = getComputedStyle($elem[0])[prefixedTransform];
					return (computedTransform !== 'none' ? parseInt(computedTransform.match(/(-?[0-9]+)/g)[5], 10) * -1 : 0);
				}
			}
		},

		positionProperty = {
			position: {
				setLeft: function($elem, left) { $elem.css('left', left); },
				setTop: function($elem, top) { $elem.css('top', top); }
			},
			transform: {
				setPosition: function($elem, left, startingLeft, top, startingTop) {
					$elem[0].style[prefixedTransform] = 'translate3d(' + (left - startingLeft) + 'px, ' + (top - startingTop) + 'px, 0)';
				}
			}
		},

		// Returns a function which adds a vendor prefix to any CSS property name
		vendorPrefix = (function() {
			var prefixes = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
				style = $('script')[0].style,
				prefix = '',
				prop;

			for (prop in style) {
				if (prefixes.test(prop)) {
					prefix = prop.match(prefixes)[0];
					break;
				}
			}

			if ('WebkitOpacity' in style) { prefix = 'Webkit'; }
			if ('KhtmlOpacity' in style) { prefix = 'Khtml'; }

			return function(property) {
				return prefix + (prefix.length > 0 ? property.charAt(0).toUpperCase() + property.slice(1) : property);
			};
		}()),

		prefixedTransform = vendorPrefix('transform'),

		supportsBackgroundPositionXY = $('<div />', { style: 'background:#fff' }).css('background-position-x') !== undefined,

		setBackgroundPosition = (supportsBackgroundPositionXY ?
			function($elem, x, y) {
				$elem.css({
					'background-position-x': x,
					'background-position-y': y
				});
			} :
			function($elem, x, y) {
				$elem.css('background-position', x + ' ' + y);
			}
		),

		getBackgroundPosition = (supportsBackgroundPositionXY ?
			function($elem) {
				return [
					$elem.css('background-position-x'),
					$elem.css('background-position-y')
				];
			} :
			function($elem) {
				return $elem.css('background-position').split(' ');
			}
		),

		requestAnimFrame = (
			window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback) {
				setTimeout(callback, 1000 / 60);
			}
		);

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype = {
		init: function() {
			this.options.name = pluginName + '_' + Math.floor(Math.random() * 1e9);

			this._defineElements();
			this._defineGetters();
			this._defineSetters();
			this._handleWindowLoadAndResize();
			this._detectViewport();

			this.refresh({ firstLoad: true });

			if (this.options.scrollProperty === 'scroll') {
				this._handleScrollEvent();
			} else {
				this._startAnimationLoop();
			}
		},
		_defineElements: function() {
			if (this.element === document.body) this.element = window;
			this.$scrollElement = $(this.element);
			this.$element = (this.element === window ? $('body') : this.$scrollElement);
			this.$viewportElement = (this.options.viewportElement !== undefined ? $(this.options.viewportElement) : (this.$scrollElement[0] === window || this.options.scrollProperty === 'scroll' ? this.$scrollElement : this.$scrollElement.parent()) );
		},
		_defineGetters: function() {
			var self = this,
				scrollPropertyAdapter = scrollProperty[self.options.scrollProperty];

			this._getScrollLeft = function() {
				return scrollPropertyAdapter.getLeft(self.$scrollElement);
			};

			this._getScrollTop = function() {
				return scrollPropertyAdapter.getTop(self.$scrollElement);
			};
		},
		_defineSetters: function() {
			var self = this,
				scrollPropertyAdapter = scrollProperty[self.options.scrollProperty],
				positionPropertyAdapter = positionProperty[self.options.positionProperty],
				setScrollLeft = scrollPropertyAdapter.setLeft,
				setScrollTop = scrollPropertyAdapter.setTop;

			this._setScrollLeft = (typeof setScrollLeft === 'function' ? function(val) {
				setScrollLeft(self.$scrollElement, val);
			} : $.noop);

			this._setScrollTop = (typeof setScrollTop === 'function' ? function(val) {
				setScrollTop(self.$scrollElement, val);
			} : $.noop);

			this._setPosition = positionPropertyAdapter.setPosition ||
				function($elem, left, startingLeft, top, startingTop) {
					if (self.options.horizontalScrolling) {
						positionPropertyAdapter.setLeft($elem, left, startingLeft);
					}

					if (self.options.verticalScrolling) {
						positionPropertyAdapter.setTop($elem, top, startingTop);
					}
				};
		},
		_handleWindowLoadAndResize: function() {
			var self = this,
				$window = $(window);

			if (self.options.responsive) {
				$window.bind('load.' + this.name, function() {
					self.refresh();
				});
			}

			$window.bind('resize.' + this.name, function() {
				self._detectViewport();

				if (self.options.responsive) {
					self.refresh();
				}
			});
		},
		refresh: function(options) {
			var self = this,
				oldLeft = self._getScrollLeft(),
				oldTop = self._getScrollTop();

			if (!options || !options.firstLoad) {
				this._reset();
			}

			this._setScrollLeft(0);
			this._setScrollTop(0);

			this._setOffsets();
			this._findParticles();
			this._findBackgrounds();

			// Fix for WebKit background rendering bug
			if (options && options.firstLoad && /WebKit/.test(navigator.userAgent)) {
				$(window).load(function() {
					var oldLeft = self._getScrollLeft(),
						oldTop = self._getScrollTop();

					self._setScrollLeft(oldLeft + 1);
					self._setScrollTop(oldTop + 1);

					self._setScrollLeft(oldLeft);
					self._setScrollTop(oldTop);
				});
			}

			this._setScrollLeft(oldLeft);
			this._setScrollTop(oldTop);
		},
		_detectViewport: function() {
			var viewportOffsets = this.$viewportElement.offset(),
				hasOffsets = viewportOffsets !== null && viewportOffsets !== undefined;

			this.viewportWidth = this.$viewportElement.width();
			this.viewportHeight = this.$viewportElement.height();

			this.viewportOffsetTop = (hasOffsets ? viewportOffsets.top : 0);
			this.viewportOffsetLeft = (hasOffsets ? viewportOffsets.left : 0);
		},
		_findParticles: function() {
			var self = this,
				scrollLeft = this._getScrollLeft(),
				scrollTop = this._getScrollTop();

			if (this.particles !== undefined) {
				for (var i = this.particles.length - 1; i >= 0; i--) {
					this.particles[i].$element.data('stellar-elementIsActive', undefined);
				}
			}

			this.particles = [];

			if (!this.options.parallaxElements) return;

			this.$element.find('[data-stellar-ratio]').each(function(i) {
				var $this = $(this),
					horizontalOffset,
					verticalOffset,
					positionLeft,
					positionTop,
					marginLeft,
					marginTop,
					$offsetParent,
					offsetLeft,
					offsetTop,
					parentOffsetLeft = 0,
					parentOffsetTop = 0,
					tempParentOffsetLeft = 0,
					tempParentOffsetTop = 0;

				// Ensure this element isn't already part of another scrolling element
				if (!$this.data('stellar-elementIsActive')) {
					$this.data('stellar-elementIsActive', this);
				} else if ($this.data('stellar-elementIsActive') !== this) {
					return;
				}

				self.options.showElement($this);

				// Save/restore the original top and left CSS values in case we refresh the particles or destroy the instance
				if (!$this.data('stellar-startingLeft')) {
					$this.data('stellar-startingLeft', $this.css('left'));
					$this.data('stellar-startingTop', $this.css('top'));
				} else {
					$this.css('left', $this.data('stellar-startingLeft'));
					$this.css('top', $this.data('stellar-startingTop'));
				}

				positionLeft = $this.position().left;
				positionTop = $this.position().top;

				// Catch-all for margin top/left properties (these evaluate to 'auto' in IE7 and IE8)
				marginLeft = ($this.css('margin-left') === 'auto') ? 0 : parseInt($this.css('margin-left'), 10);
				marginTop = ($this.css('margin-top') === 'auto') ? 0 : parseInt($this.css('margin-top'), 10);

				offsetLeft = $this.offset().left - marginLeft;
				offsetTop = $this.offset().top - marginTop;

				// Calculate the offset parent
				$this.parents().each(function() {
					var $this = $(this);

					if ($this.data('stellar-offset-parent') === true) {
						parentOffsetLeft = tempParentOffsetLeft;
						parentOffsetTop = tempParentOffsetTop;
						$offsetParent = $this;

						return false;
					} else {
						tempParentOffsetLeft += $this.position().left;
						tempParentOffsetTop += $this.position().top;
					}
				});

				// Detect the offsets
				horizontalOffset = ($this.data('stellar-horizontal-offset') !== undefined ? $this.data('stellar-horizontal-offset') : ($offsetParent !== undefined && $offsetParent.data('stellar-horizontal-offset') !== undefined ? $offsetParent.data('stellar-horizontal-offset') : self.horizontalOffset));
				verticalOffset = ($this.data('stellar-vertical-offset') !== undefined ? $this.data('stellar-vertical-offset') : ($offsetParent !== undefined && $offsetParent.data('stellar-vertical-offset') !== undefined ? $offsetParent.data('stellar-vertical-offset') : self.verticalOffset));

				// Add our object to the particles collection
				self.particles.push({
					$element: $this,
					$offsetParent: $offsetParent,
					isFixed: $this.css('position') === 'fixed',
					horizontalOffset: horizontalOffset,
					verticalOffset: verticalOffset,
					startingPositionLeft: positionLeft,
					startingPositionTop: positionTop,
					startingOffsetLeft: offsetLeft,
					startingOffsetTop: offsetTop,
					parentOffsetLeft: parentOffsetLeft,
					parentOffsetTop: parentOffsetTop,
					stellarRatio: ($this.data('stellar-ratio') !== undefined ? $this.data('stellar-ratio') : 1),
					width: $this.outerWidth(true),
					height: $this.outerHeight(true),
					isHidden: false
				});
			});
		},
		_findBackgrounds: function() {
			var self = this,
				scrollLeft = this._getScrollLeft(),
				scrollTop = this._getScrollTop(),
				$backgroundElements;

			this.backgrounds = [];

			if (!this.options.parallaxBackgrounds) return;

			$backgroundElements = this.$element.find('[data-stellar-background-ratio]');

			if (this.$element.data('stellar-background-ratio')) {
                $backgroundElements = $backgroundElements.add(this.$element);
			}

			$backgroundElements.each(function() {
				var $this = $(this),
					backgroundPosition = getBackgroundPosition($this),
					horizontalOffset,
					verticalOffset,
					positionLeft,
					positionTop,
					marginLeft,
					marginTop,
					offsetLeft,
					offsetTop,
					$offsetParent,
					parentOffsetLeft = 0,
					parentOffsetTop = 0,
					tempParentOffsetLeft = 0,
					tempParentOffsetTop = 0;

				// Ensure this element isn't already part of another scrolling element
				if (!$this.data('stellar-backgroundIsActive')) {
					$this.data('stellar-backgroundIsActive', this);
				} else if ($this.data('stellar-backgroundIsActive') !== this) {
					return;
				}

				// Save/restore the original top and left CSS values in case we destroy the instance
				if (!$this.data('stellar-backgroundStartingLeft')) {
					$this.data('stellar-backgroundStartingLeft', backgroundPosition[0]);
					$this.data('stellar-backgroundStartingTop', backgroundPosition[1]);
				} else {
					setBackgroundPosition($this, $this.data('stellar-backgroundStartingLeft'), $this.data('stellar-backgroundStartingTop'));
				}

				// Catch-all for margin top/left properties (these evaluate to 'auto' in IE7 and IE8)
				marginLeft = ($this.css('margin-left') === 'auto') ? 0 : parseInt($this.css('margin-left'), 10);
				marginTop = ($this.css('margin-top') === 'auto') ? 0 : parseInt($this.css('margin-top'), 10);

				offsetLeft = $this.offset().left - marginLeft - scrollLeft;
				offsetTop = $this.offset().top - marginTop - scrollTop;
				
				// Calculate the offset parent
				$this.parents().each(function() {
					var $this = $(this);

					if ($this.data('stellar-offset-parent') === true) {
						parentOffsetLeft = tempParentOffsetLeft;
						parentOffsetTop = tempParentOffsetTop;
						$offsetParent = $this;

						return false;
					} else {
						tempParentOffsetLeft += $this.position().left;
						tempParentOffsetTop += $this.position().top;
					}
				});

				// Detect the offsets
				horizontalOffset = ($this.data('stellar-horizontal-offset') !== undefined ? $this.data('stellar-horizontal-offset') : ($offsetParent !== undefined && $offsetParent.data('stellar-horizontal-offset') !== undefined ? $offsetParent.data('stellar-horizontal-offset') : self.horizontalOffset));
				verticalOffset = ($this.data('stellar-vertical-offset') !== undefined ? $this.data('stellar-vertical-offset') : ($offsetParent !== undefined && $offsetParent.data('stellar-vertical-offset') !== undefined ? $offsetParent.data('stellar-vertical-offset') : self.verticalOffset));

				self.backgrounds.push({
					$element: $this,
					$offsetParent: $offsetParent,
					isFixed: $this.css('background-attachment') === 'fixed',
					horizontalOffset: horizontalOffset,
					verticalOffset: verticalOffset,
					startingValueLeft: backgroundPosition[0],
					startingValueTop: backgroundPosition[1],
					startingBackgroundPositionLeft: (isNaN(parseInt(backgroundPosition[0], 10)) ? 0 : parseInt(backgroundPosition[0], 10)),
					startingBackgroundPositionTop: (isNaN(parseInt(backgroundPosition[1], 10)) ? 0 : parseInt(backgroundPosition[1], 10)),
					startingPositionLeft: $this.position().left,
					startingPositionTop: $this.position().top,
					startingOffsetLeft: offsetLeft,
					startingOffsetTop: offsetTop,
					parentOffsetLeft: parentOffsetLeft,
					parentOffsetTop: parentOffsetTop,
					stellarRatio: ($this.data('stellar-background-ratio') === undefined ? 1 : $this.data('stellar-background-ratio'))
				});
			});
		},
		_reset: function() {
			var particle,
				startingPositionLeft,
				startingPositionTop,
				background,
				i;

			for (i = this.particles.length - 1; i >= 0; i--) {
				particle = this.particles[i];
				startingPositionLeft = particle.$element.data('stellar-startingLeft');
				startingPositionTop = particle.$element.data('stellar-startingTop');

				this._setPosition(particle.$element, startingPositionLeft, startingPositionLeft, startingPositionTop, startingPositionTop);

				this.options.showElement(particle.$element);

				particle.$element.data('stellar-startingLeft', null).data('stellar-elementIsActive', null).data('stellar-backgroundIsActive', null);
			}

			for (i = this.backgrounds.length - 1; i >= 0; i--) {
				background = this.backgrounds[i];

				background.$element.data('stellar-backgroundStartingLeft', null).data('stellar-backgroundStartingTop', null);

				setBackgroundPosition(background.$element, background.startingValueLeft, background.startingValueTop);
			}
		},
		destroy: function() {
			this._reset();

			this.$scrollElement.unbind('resize.' + this.name).unbind('scroll.' + this.name);
			this._animationLoop = $.noop;

			$(window).unbind('load.' + this.name).unbind('resize.' + this.name);
		},
		_setOffsets: function() {
			var self = this,
				$window = $(window);

			$window.unbind('resize.horizontal-' + this.name).unbind('resize.vertical-' + this.name);

			if (typeof this.options.horizontalOffset === 'function') {
				this.horizontalOffset = this.options.horizontalOffset();
				$window.bind('resize.horizontal-' + this.name, function() {
					self.horizontalOffset = self.options.horizontalOffset();
				});
			} else {
				this.horizontalOffset = this.options.horizontalOffset;
			}

			if (typeof this.options.verticalOffset === 'function') {
				this.verticalOffset = this.options.verticalOffset();
				$window.bind('resize.vertical-' + this.name, function() {
					self.verticalOffset = self.options.verticalOffset();
				});
			} else {
				this.verticalOffset = this.options.verticalOffset;
			}
		},
		_repositionElements: function() {
			var scrollLeft = this._getScrollLeft(),
				scrollTop = this._getScrollTop(),
				horizontalOffset,
				verticalOffset,
				particle,
				fixedRatioOffset,
				background,
				bgLeft,
				bgTop,
				isVisibleVertical = true,
				isVisibleHorizontal = true,
				newPositionLeft,
				newPositionTop,
				newOffsetLeft,
				newOffsetTop,
				i;

			// First check that the scroll position or container size has changed
			if (this.currentScrollLeft === scrollLeft && this.currentScrollTop === scrollTop && this.currentWidth === this.viewportWidth && this.currentHeight === this.viewportHeight) {
				return;
			} else {
				this.currentScrollLeft = scrollLeft;
				this.currentScrollTop = scrollTop;
				this.currentWidth = this.viewportWidth;
				this.currentHeight = this.viewportHeight;
			}

			// Reposition elements
			for (i = this.particles.length - 1; i >= 0; i--) {
				particle = this.particles[i];

				fixedRatioOffset = (particle.isFixed ? 1 : 0);

				// Calculate position, then calculate what the particle's new offset will be (for visibility check)
				if (this.options.horizontalScrolling) {
					newPositionLeft = (scrollLeft + particle.horizontalOffset + this.viewportOffsetLeft + particle.startingPositionLeft - particle.startingOffsetLeft + particle.parentOffsetLeft) * -(particle.stellarRatio + fixedRatioOffset - 1) + particle.startingPositionLeft;
					newOffsetLeft = newPositionLeft - particle.startingPositionLeft + particle.startingOffsetLeft;
				} else {
					newPositionLeft = particle.startingPositionLeft;
					newOffsetLeft = particle.startingOffsetLeft;
				}

				if (this.options.verticalScrolling) {
					newPositionTop = (scrollTop + particle.verticalOffset + this.viewportOffsetTop + particle.startingPositionTop - particle.startingOffsetTop + particle.parentOffsetTop) * -(particle.stellarRatio + fixedRatioOffset - 1) + particle.startingPositionTop;
					newOffsetTop = newPositionTop - particle.startingPositionTop + particle.startingOffsetTop;
				} else {
					newPositionTop = particle.startingPositionTop;
					newOffsetTop = particle.startingOffsetTop;
				}

				// Check visibility
				if (this.options.hideDistantElements) {
					isVisibleHorizontal = !this.options.horizontalScrolling || newOffsetLeft + particle.width > (particle.isFixed ? 0 : scrollLeft) && newOffsetLeft < (particle.isFixed ? 0 : scrollLeft) + this.viewportWidth + this.viewportOffsetLeft;
					isVisibleVertical = !this.options.verticalScrolling || newOffsetTop + particle.height > (particle.isFixed ? 0 : scrollTop) && newOffsetTop < (particle.isFixed ? 0 : scrollTop) + this.viewportHeight + this.viewportOffsetTop;
				}

				if (isVisibleHorizontal && isVisibleVertical) {
					if (particle.isHidden) {
						this.options.showElement(particle.$element);
						particle.isHidden = false;
					}

					this._setPosition(particle.$element, newPositionLeft, particle.startingPositionLeft, newPositionTop, particle.startingPositionTop);
				} else {
					if (!particle.isHidden) {
						this.options.hideElement(particle.$element);
						particle.isHidden = true;
					}
				}
			}

			// Reposition backgrounds
			for (i = this.backgrounds.length - 1; i >= 0; i--) {
				background = this.backgrounds[i];

				fixedRatioOffset = (background.isFixed ? 0 : 1);
				bgLeft = (this.options.horizontalScrolling ? (scrollLeft + background.horizontalOffset - this.viewportOffsetLeft - background.startingOffsetLeft + background.parentOffsetLeft - background.startingBackgroundPositionLeft) * (fixedRatioOffset - background.stellarRatio) + 'px' : background.startingValueLeft);
				bgTop = (this.options.verticalScrolling ? (scrollTop + background.verticalOffset - this.viewportOffsetTop - background.startingOffsetTop + background.parentOffsetTop - background.startingBackgroundPositionTop) * (fixedRatioOffset - background.stellarRatio) + 'px' : background.startingValueTop);

				setBackgroundPosition(background.$element, bgLeft, bgTop);
			}
		},
		_handleScrollEvent: function() {
			var self = this,
				ticking = false;

			var update = function() {
				self._repositionElements();
				ticking = false;
			};

			var requestTick = function() {
				if (!ticking) {
					requestAnimFrame(update);
					ticking = true;
				}
			};
			
			this.$scrollElement.bind('scroll.' + this.name, requestTick);
			requestTick();
		},
		_startAnimationLoop: function() {
			var self = this;

			this._animationLoop = function() {
				requestAnimFrame(self._animationLoop);
				self._repositionElements();
			};
			this._animationLoop();
		}
	};

	$.fn[pluginName] = function (options) {
		var args = arguments;
		if (options === undefined || typeof options === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			return this.each(function () {
				var instance = $.data(this, 'plugin_' + pluginName);
				if (instance instanceof Plugin && typeof instance[options] === 'function') {
					instance[options].apply(instance, Array.prototype.slice.call(args, 1));
				}
				if (options === 'destroy') {
					$.data(this, 'plugin_' + pluginName, null);
				}
			});
		}
	};

	$[pluginName] = function(options) {
		var $window = $(window);
		return $window.stellar.apply($window, Array.prototype.slice.call(arguments, 0));
	};

	// Expose the scroll and position property function hashes so they can be extended
	$[pluginName].scrollProperty = scrollProperty;
	$[pluginName].positionProperty = positionProperty;

	// Expose the plugin class so it can be modified
	window.Stellar = Plugin;
}(jQuery, this, document));