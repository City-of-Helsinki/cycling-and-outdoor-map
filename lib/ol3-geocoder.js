/**
 * A geocoder extension for OpenLayers 3.
 * https://github.com/jonataswalker/ol3-geocoder
 * Version: v2.1.0
 * Built: 2016-06-16T11:50:12-0300
 * Modified for Helsinki City address searching needs by 
 * Teijo Salminen Real Estate Office, Helsinki City 2016
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global.Geocoder = factory());
}
	(this, function () {
		'use strict';
		var namespace = "ol3-geocoder";
		var container_class = "-container";
		var control_class = "-search";
		var btn_search_class = "-btn-search";
		var loading_class = "-loading";
		var result_class = "-result";
		var expanded_class = "-search-expanded";
		var country_class = "-country";
		var city_class = "-city";
		var road_class = "-road";
		var OL3_control_class = "ol-control";
		var form_id = "form-geocoder";
		var input_search_class = "-input-search";
		var input_query_id = "gcd-input";

		var eventType = {
			ADDRESSCHOSEN : 'addresschosen'
		};

		var featureStyle = [
			new ol.style.Style({
				image : new ol.style.Icon({
					anchor : [0.5, 1],
					src : [
						'data:image/png;base64,',
						'iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAABmJLR0QA/wD/AP+gvaeT',
						'AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQWCiErd9Z21AAABAJJREFUWMPVm',
						'U1oXFUUx3/3zatJx04SDOgiVUMSgrXJwpqIKy26SrKoLjQgCkIFW7otuCvdllbo1q6Epg',
						'vNQvtx710lEFdihwpSjdikJLGJWEhrM9MyX7nPxbypwzBv5n3cqXpgmOHOuff/mzPn3Pf',
						'ueWDBpqZnrPq1M5EUVitZ+9wPvA0cAgaALqAIbAI3gAWt5HbjvCcGXROdmp4RwDDwBfBW',
						'iKmLwKfAqlbSiwvvJAAeAeaBWyGB8f1uAfNT0zMj/jqdjXQd8Ds+sJsguyrAe1rJb6NGX',
						'MQAPgJ8k7QefPOAd7WSl6OAi4jAk8D3cdKqhRngda3k9bDgUSL9NLAO9GPftoEXtZIPrR',
						'WiXyzHwwAbA8WyoFAUFMsCY0JB9wPHwxalGyH3T4RxHByo8MZEgf4+w/ZfDt9lu9n4I5T',
						'MCeBzP8+tQL8KDAZuA7swOljh4yM5JsaKGAPGA0fABzN5sje7+PJyht/WXNxU8O/1dbK2',
						'9ulPWn05tL/CqWP3GR8tUSgKSmVBpVJ9LxQF46MlTh27z9D+SiKdqNCBFw/jwexUnr4eg',
						'xfwx3oe9PUYZqfyGC+eThzo4SCYTNpweLLQtuCMgcOTBTLp4B8XpBMXuqnfroGxkTIi5M',
						'YpRNV/1yTjCQv9oHmkBXu7vRD1/s/1b2+3h+eJSDpxoa83G0w5HisbLqRCrpKClQ2XlON',
						'F0okL/XXTyQ6sbe1h/Y7bNkWEgPU7Lmtbe3CcaDpxoS8CuaYbfcpj7mqmVXE9Ltq5qxnc',
						'VKBjztexBl0Azgd9uZTt4spimlJZkHKqUa29Ug6UyoIri2mWsl2tNM77OlZvmIaBn4B00',
						'6tiRfDSUIk3JwocerlIzz7DTt7hxi9dLGW7+fX2U7huYJQfAeNayduduDX9Cni/3X5sPI',
						'HnVSPtCK9VDj/OZa3krPVbUx++J+y2FNF6tZI71s+IfhR2gNOWgU9rJXeinBUjnxGBF4A',
						'fgWcsAN8DXgE2OnJGbIC/CHxoAXpOK/lRx1sIvn1mKTVirRO377EFnE0IfFYrudXxvkdD',
						'bvcCvwOZGEvkgOeBB0+kwwTU9tIccClmlC8Bubj9vKQNyAPAzxHX8YCDWsnluLpOAmB84',
						'fmIU+e1kstJ2r42OkVH/S5R2G7S0aSCsaFrHU+tZB44F3LaOa1k/l/pTzfZSQ4APwD7Wr',
						'jmgdeA5STAttKjltsLbdwWkhSf1UjXRfxZ4M8WLs9pJe/a0HIsAeMDnQlwOaOVvPufeFD',
						'UJLcH/H27t6EtcBDYTJrLViNdl9ubwLWG4Wv+uDUTWDb/LLlSNzSilVy1qeFYBsYHvOAP',
						'XdBKrtrK5Y5A19lJqo8kTnZi8U6kRy0YY8BNwNgqwP+1/Q09w5giQWRk7AAAAABJRU5Er',
						'kJggg=='
					].join('')
				})
			})
		];

		var defaultOptions = {
			placeholder : 'Search for an address',
			featureStyle : featureStyle,
			lang : 'en-US',
			limit : 5,
			keepOpen : false,
			preventDefault : false,
			debug : false
		};

		/**
		 * @module utils
		 * All the helper functions needed in this project
		 */
		var utils = {
			toQueryString : function toQueryString(obj) {
				var this$1 = this;

				return Object.keys(obj).reduce(function (a, k) {
					a.push(
						typeof obj[k] === 'object' ?
						this$1.toQueryString(obj[k]) :
						encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
					return a;
				}, []).join('&');
			},
			encodeUrlXhr : function encodeUrlXhr(url, data) {
				if (data && typeof(data) === 'object') {
					var str_data = this.toQueryString(data);
					url += (/\?/.test(url) ? '&' : '?') + str_data;
				}
				return url;
			},
			json : function json(url, data) {
				var xhr = new XMLHttpRequest(),
				when = {},
				onload = function () {
					if (xhr.status === 200) {
						when.ready.call(undefined, JSON.parse(xhr.response));
					}
				},
				onerror = function () {
					console.info('Cannot XHR ' + JSON.stringify(url));
				};
				url = this.encodeUrlXhr(url, data);
				xhr.open('GET', url, true);
				xhr.setRequestHeader('Accept', 'application/json');
				xhr.onload = onload;
				xhr.onerror = onerror;
				xhr.send(null);

				return {
					when : function (obj) {
						when.ready = obj.ready;
					}
				};
			},
			now : function now() {
				// Polyfill for window.performance.now()
				// @license http://opensource.org/licenses/MIT
				// copyright Paul Irish 2015
				// https://gist.github.com/paulirish/5438650
				if ('performance' in window == false) {
					window.performance = {};
				}

				Date.now = (Date.now || function () { // thanks IE8
					return new Date().getTime();
				});

				if ('now' in window.performance == false) {

					var nowOffset = Date.now();

					if (performance.timing && performance.timing.navigationStart) {
						nowOffset = performance.timing.navigationStart
					}

					window.performance.now = function now() {
						return Date.now() - nowOffset;
					}
				}

				return window.performance.now();
			},
			flyTo : function flyTo(map, coord, duration, resolution) {
				resolution = resolution || 2.388657133911758;
				duration = duration || 500;

				var view = map.getView();
				var pan = ol.animation.pan({
						duration : duration,
						source : view.getCenter()
					});
				var zoom = ol.animation.zoom({
						duration : duration,
						resolution : view.getResolution()
					});

				map.beforeRender(pan, zoom);
				view.setCenter(coord);
				view.setResolution(resolution);
			},
			randomId : function randomId(prefix) {
				var id = this.now().toString(36);
				return prefix ? prefix + id : id;
			},
			isNumeric : function isNumeric(str) {
				return /^\d+$/.test(str);
			},
			classRegex : function classRegex(classname) {
				return new RegExp(("(^|\\s+) " + classname + " (\\s+|$)"));
			},
			/**
			 * @param {Element|Array<Element>} element DOM node or array of nodes.
			 * @param {String|Array<String>} classname Class or array of classes.
			 * For example: 'class1 class2' or ['class1', 'class2']
			 * @param {Number|undefined} timeout Timeout to remove a class.
			 */
			addClass : function addClass(element, classname, timeout) {
				var this$1 = this;

				if (Array.isArray(element)) {
					element.forEach(function (each) {
						this$1.addClass(each, classname)
					});
					return;
				}

				var array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
				var i = array.length;
				while (i--) {
					if (!this$1.hasClass(element, array[i])) {
						this$1._addClass(element, array[i], timeout);
					}
				}
			},
			_addClass : function _addClass(el, c, timeout) {
				// use native if available
				var this$1 = this;

				if (el.classList) {
					el.classList.add(c);
				} else {
					el.className = (el.className + ' ' + c).trim();
				}

				if (timeout && this.isNumeric(timeout)) {
					window.setTimeout(function () {
						this$1._removeClass(el, c)
					}, timeout);
				}
			},
			/**
			 * @param {Element|Array<Element>} element DOM node or array of nodes.
			 * @param {String|Array<String>} classname Class or array of classes.
			 * For example: 'class1 class2' or ['class1', 'class2']
			 * @param {Number|undefined} timeout Timeout to add a class.
			 */
			removeClass : function removeClass(element, classname, timeout) {
				var this$1 = this;

				if (Array.isArray(element)) {
					element.forEach(function (each) {
						this$1.removeClass(each, classname, timeout)
					});
					return;
				}

				var array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
				var i = array.length;
				while (i--) {
					if (this$1.hasClass(element, array[i])) {
						this$1._removeClass(element, array[i], timeout);
					}
				}
			},
			_removeClass : function _removeClass(el, c, timeout) {
				var this$1 = this;

				if (el.classList) {
					el.classList.remove(c);
				} else {
					el.className = (el.className.replace(this.classRegex(c), ' ')).trim();
				}
				if (timeout && this.isNumeric(timeout)) {
					window.setTimeout(function () {
						this$1._addClass(el, c);
					}, timeout);
				}
			},
			/**
			 * @param {Element} element DOM node.
			 * @param {String} classname Classname.
			 * @return {Boolean}
			 */
			hasClass : function hasClass(element, c) {
				// use native if available
				return (element.classList) ?
				element.classList.contains(c) : this.classRegex(c).test(element.className);
			},
			/**
			 * @param {Element|Array<Element>} element DOM node or array of nodes.
			 * @param {String} classname Classe.
			 */
			toggleClass : function toggleClass(element, classname) {
				var this$1 = this;

				if (Array.isArray(element)) {
					element.forEach(function (each) {
						this$1.toggleClass(each, classname)
					});
					return;
				}

				// use native if available
				if (element.classList) {
					element.classList.toggle(classname);
				} else {
					if (this.hasClass(element, classname)) {
						this._removeClass(element, classname);
					} else {
						this._addClass(element, classname);
					}
				}
			},
			$ : function $(id) {
				id = (id[0] === '#') ? id.substr(1, id.length) : id;
				return document.getElementById(id);
			},
			isElement : function isElement(obj) {
				// DOM, Level2
				if ('HTMLElement' in window) {
					return (!!obj && obj instanceof HTMLElement);
				}
				// Older browsers
				return (!!obj && typeof obj === 'object' &&
					obj.nodeType === 1 && !!obj.nodeName);
			},
			getAllChildren : function getAllChildren(node, tag) {
				return [].slice.call(node.getElementsByTagName(tag));
			},
			isEmpty : function isEmpty(str) {
				return (!str || 0 === str.length);
			},
			emptyArray : function emptyArray(array) {
				while (array.length)
					array.pop();
			},
			anyMatchInArray : function anyMatchInArray(source, target) {
				return source.some(function (each) {
					return target.indexOf(each) >= 0;
				});
			},
			everyMatchInArray : function everyMatchInArray(arr1, arr2) {
				return arr2.every(function (each) {
					return arr1.indexOf(each) >= 0;
				});
			},
			anyItemHasValue : function anyItemHasValue(obj, has) {
				if (has === void 0)
					has = false;

				for (var key in obj) {
					if (!this.isEmpty(obj[key])) {
						has = true;
					}
				}
				return has;
			},
			removeAllChildren : function removeAllChildren(node) {
				while (node.firstChild) {
					node.removeChild(node.firstChild);
				}
			},
			removeAll : function removeAll(collection) {
				var node;
				while ((node = collection[0])) {
					node.parentNode.removeChild(node);
				}
			},
			getChildren : function getChildren(node, tag) {
				return [].filter.call(node.childNodes, function (el) {
					return tag ?
					el.nodeType == 1 && el.tagName.toLowerCase() == tag : el.nodeType == 1;
				});
			},
			template : function template(html, row) {
				var this$1 = this;

				return html.replace(/\{ *([\w_-]+) *\}/g, function (html, key) {
					var value = (row[key] === undefined) ? '' : row[key];
					return this$1.htmlEscape(value);
				});
			},
			htmlEscape : function htmlEscape(str) {
				return String(str)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#039;');
			},
			/**
			 * Overwrites obj1's values with obj2's and adds
			 * obj2's if non existent in obj1
			 * @returns obj3 a new object based on obj1 and obj2
			 */
			mergeOptions : function mergeOptions(obj1, obj2) {
				var obj3 = {};
				for (var attr1 in obj1) {
					obj3[attr1] = obj1[attr1];
				}
				for (var attr2 in obj2) {
					obj3[attr2] = obj2[attr2];
				}
				return obj3;
			},
			createElement : function createElement(node, html) {
				var elem;
				if (Array.isArray(node)) {
					elem = document.createElement(node[0]);

					if (node[1].id)
						elem.id = node[1].id;
					if (node[1].classname)
						elem.className = node[1].classname;

					if (node[1].attr) {
						var attr = node[1].attr;
						if (Array.isArray(attr)) {
							var i = -1;
							while (++i < attr.length) {
								elem.setAttribute(attr[i].name, attr[i].value);
							}
						} else {
							elem.setAttribute(attr.name, attr.value);
						}
					}
				} else {
					elem = document.createElement(node);
				}
				elem.innerHTML = html;
				var frag = document.createDocumentFragment();
				while (elem.childNodes[0]) {
					frag.appendChild(elem.childNodes[0]);
				}
				elem.appendChild(frag);
				return elem;
			},
			assert : function assert(condition, message) {
				if (message === void 0)
					message = 'Assertion failed';

				if (!condition) {
					if (typeof Error !== 'undefined') {
						throw new Error(message);
					}
					throw message; // Fallback
				}
			}
		};

		 /*
		 * @class Kmo
		 * KMO
		 */

		var Kmo = function Kmo() {
			this.settings = {
				url : 'search/wfs.php',
				params : {
					CQL_FILTER : "katunimi ilike ''",
					service : 'WFS',
					version : '1.1.0',
					request : 'getFeature',
					typename : 'hel:PKS_osoiteluettelo',
					srsname : 'EPSG:3879',
					outputFormat : 'json',
					sortBy: 'osoitenumero'
				}
			};
		};

		Kmo.prototype.getParameters = function getParameters(options) {
			return {
				url : this.settings.url,
				params : {
					CQL_FILTER : "katunimi ilike '" + options.query + "%'"
					,
					service : this.settings.params.service,
					version : this.settings.params.version,
					request : this.settings.params.request,
					typename : this.settings.params.typename,
					srsname : this.settings.params.srsname,
					outputFormat : this.settings.params.outputFormat,
					sortBy: this.settings.params.sortBy
				}
			};
		};
		
		Kmo.prototype.handleResponse = function handleResponse(results) {
			return results.map(function (result) {
				return ({
					lon : result.geometry.coordinates[0],
					lat : result.geometry.coordinates[1],
					address : {
						name : result.properties.katunimi || '',
						house_number : result.properties.osoitenumero_teksti || '',
						postcode : result.properties.postinumero || '',
						road : result.properties.katunimi || '',
						city : result.properties.kaupunki || '',
						state : result.properties.region || '',
						country : result.properties.country || ''
					},
					original : {
						formatted : result.properties.name,
						details : result.properties
					}
				});

			});
		};


		/**
		 * @class Nominatim
		 */
		var Nominatim = function Nominatim(base) {
			this.Base = base;

			this.layer_name = utils.randomId('geocoder-layer-');
			this.layer = new ol.layer.Vector({
					name : this.layer_name,
					source : new ol.source.Vector()
				});

			this.options = base.options;
			this.options.provider = this.options.provider.toLowerCase();

			this.els = this.createControl();
			this.container = this.els.container;
			this.registered_listeners = {
				map_click : false
			};
			this.setListeners();

			// providers
			this.Kmo = new Kmo();
			return this;
		};

		Nominatim.prototype.createControl = function createControl() {
			var container = utils.createElement([
						'div', {
							classname : namespace + container_class
						}
					], Nominatim.html);

			var elements = {
				container : container,
				control :
				container.querySelector(("." + (namespace + control_class))),
				btn_search :
				container.querySelector(("." + (namespace + btn_search_class))),
				input_search :
				container.querySelector(("." + (namespace + input_search_class))),
				result_container :
				container.querySelector(("." + (namespace + result_class)))
			};
			//set placeholder from options
			elements.input_search.placeholder = this.options.placeholder;
			return elements;
		};

		Nominatim.prototype.setListeners = function setListeners() {
			var this$1 = this;

			var openSearch = function () {
				if (utils.hasClass(this$1.els.control, namespace + expanded_class)) {
					this$1.collapse();
				} else {
					this$1.expand();
				}
			},
			query = function (evt) {
				if (evt.keyCode == 13) { //enter key
					evt.preventDefault();
					var q = utils.htmlEscape(this$1.els.input_search.value);
					this$1.query(q);
				}
			};
			this.els.input_search.addEventListener('keydown', query, false);
			this.els.btn_search.addEventListener('click', openSearch, false);
		};

		Nominatim.prototype.query = function query(q) {
			var this$1 = this;
			var this_ = this,
			options = this.options,
			input = this.els.input_search,
			provider = this.getProvider({
					query : q,
					provider : options.provider,
					key : options.key,
					lang : options.lang,
					countrycodes : options.countrycodes,
					limit : options.limit
				});

			this.clearResults();
			utils.addClass(input, namespace + loading_class);
			utils.json(provider.url, provider.params).when({
				ready : function (response) {
					if (options.debug) {
						console.info(response);
					}
					utils.removeClass(input, namespace + loading_class);

					//will be fullfiled according to provider
					var response__;
					response__ = response.contents.features.length > 0 ?
					this$1.Kmo.handleResponse(response.contents.features) : undefined;
					if (response__) {
						this$1.createList(response__);
						this$1.listenMapClick();
					}
				},
				error : function () {
					utils.removeClass(input, namespace + loading_class);
					var li = utils.createElement('li',
							'<h5>Error! No internet connection?</h5>');
					this$1.els.result_container.appendChild(li);
				}
			});
		};

		Nominatim.prototype.createList = function createList(response) {
			var this$1 = this;
			var ul = this.els.result_container;
			response.forEach(function (row) {
				var address_html = this$1.addressTemplate(row.address),
				html = '<a href="#">' + address_html + '</a>',
				li = utils.createElement('li', html);
				li.addEventListener('click', function (evt) {
					evt.preventDefault();
					this$1.chosen(row, address_html, row.address, row.original);
				}, false);
				ul.appendChild(li);
			});
		};

		Nominatim.prototype.chosen = function chosen(place, address_html, address_obj, address_original) {
			var map = this.Base.getMap();
			/*var coord = ol.proj.transform([parseFloat(place.lon), parseFloat(place.lat)],
					'EPSG:4326', map.getView().getProjection());*/
			var coord = [parseFloat(place.lon), parseFloat(place.lat)];
			var address = {
				formatted : address_html,
				details : address_obj,
				original : address_original
			};

			if (this.options.keepOpen === false) {
				this.clearResults(true);
			}

			if (this.options.preventDefault === true) {
				this.Base.dispatchEvent({
					type : eventType.ADDRESSCHOSEN,
					address : address,
					coordinate : coord
				});
			} else {
				utils.flyTo(map, coord);
				var feature = this.createFeature(coord, address);

				this.Base.dispatchEvent({
					type : eventType.ADDRESSCHOSEN,
					address : address,
					feature : feature,
					coordinate : coord
				});
			}
		};

		Nominatim.prototype.createFeature = function createFeature(coord) {
			var feature = new ol.Feature(new ol.geom.Point(coord));
			this.addLayer();
			feature.setStyle(this.options.featureStyle);
			feature.setId(utils.randomId('geocoder-ft-'));
			this.getSource().addFeature(feature);
		};

		Nominatim.prototype.addressTemplate = function addressTemplate(address) {
			var html = [];
			/*
			if (address.name) {
			html.push(
			'<span class="' + namespace + road_class + '">{name}</span>'
			);
			}
			 */
			if (address.road || address.building || address.house_number || address.katunimi) {
				html.push(
					'<span class="' + namespace + road_class +
					'">{building} {road} {house_number} {katunimi}</span>');
			}
			if (address.city || address.town || address.village || address.kaupunki) {
				html.push(
					'<span class="' + namespace + city_class +
					'">{postcode} {city} {town} {village} {kaupunki}</span>');
			}
			if (address.state || address.country) {
				html.push(
					'<span class="' + namespace + country_class +
					'">{state} {country}</span>');
			}
			return utils.template(html.join('<br>'), address);
		};


		Nominatim.prototype.getProvider = function getProvider(options) {
			var provider;
			provider = this.Kmo.getParameters(options);
			return provider;
		};

		Nominatim.prototype.expand = function expand() {
			var this$1 = this;

			utils.removeClass(this.els.input_search, namespace + loading_class);
			utils.addClass(this.els.control, namespace + expanded_class);
			window.setTimeout(function () {
				this$1.els.input_search.focus();
			}, 100);
			this.listenMapClick();
		};

		Nominatim.prototype.collapse = function collapse() {
			this.els.input_search.value = '';
			this.els.input_search.blur();
			utils.removeClass(this.els.control, namespace + expanded_class);
			this.clearResults();
		};

		Nominatim.prototype.listenMapClick = function listenMapClick() {
			if (this.registered_listeners.map_click) {
				// already registered
				return;
			}

			var this_ = this;
			var map_element = this.Base.getMap().getTargetElement();
			this.registered_listeners.map_click = true;

			//one-time fire click
			map_element.addEventListener('click', {
				handleEvent : function (evt) {
					this_.clearResults(true);
					map_element.removeEventListener(evt.type, this, false);
					this_.registered_listeners.map_click = false;
				}
			}, false);
		};

		Nominatim.prototype.clearResults = function clearResults(collapse) {
			if (collapse) {
				this.collapse();
			} else {
				utils.removeAllChildren(this.els.result_container);
			}
		};

		Nominatim.prototype.getSource = function getSource() {
			return this.layer.getSource();
		};

		Nominatim.prototype.addLayer = function addLayer() {
			var this$1 = this;

			var found = false;
			var map = this.Base.getMap();

			map.getLayers().forEach(function (layer) {
				if (layer === this$1.layer)
					found = true;
			});
			if (!found) {
				map.addLayer(this.layer);
			}
		};

		Nominatim.html = [
			'<div class="',
			namespace + control_class,
			' ',
			OL3_control_class,
			'">',
			'<button',
			' type="button"',
			' class="' + namespace + btn_search_class + '">',
			'</button>',
			'<form id="' + form_id + '" action="javascript:void(0);">',
			'<input',
			' type="text"',
			' id="' + input_query_id + '"',
			' class="' + namespace + input_search_class + '"',
			' placeholder="Search ...">',
			'</form>',
			'</div>',
			'<ul class="',
			namespace + result_class,
			'"></ul>'
		].join('');

		/**
		 * @class Base
		 * @extends {ol.control.Control}
		 */
		var Base = (function (superclass) {
			function Base(control_type, opt_options) {
				if (control_type === void 0)
					control_type = 'nominatim';
				if (opt_options === void 0)
					opt_options = {};

				utils.assert(typeof control_type == 'string',
					'@param `control_type` should be string type!');
				utils.assert(typeof opt_options == 'object',
					'@param `opt_options` should be object type!');

				this.options = utils.mergeOptions(defaultOptions, opt_options);

				Base.Nominatim = new Nominatim(this);

				superclass.call(this, {
					element : Base.Nominatim.container
				});
			}

			Base.prototype = Object.create(superclass && superclass.prototype);
			Base.prototype.constructor = Base;

			/**
			 * @return {ol.layer.Vector} Returns the layer created by this control
			 */
			Base.prototype.getLayer = function getLayer() {
				return Base.Nominatim.layer;
			};

			/**
			 * @return {ol.source.Vector} Returns the source created by this control
			 */
			Base.prototype.getSource = function getSource() {
				return this.getLayer().getSource();
			};

			return Base;
		}
			(ol.control.Control));
		return Base;
	}));
	