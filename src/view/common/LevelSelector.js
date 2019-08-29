/*
 * This file is part of OsmInEdit, released under ISC license (see LICENSE.md)
 *
 * Copyright (c) Adrien Pavie 2019
 * Copyright (c) Daimler AG 2019
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */

import { Control, DomUtil } from 'leaflet';
import { withLeaflet, MapControl } from 'react-leaflet';
import deepEqual from 'fast-deep-equal';
import PubSub from 'pubsub-js';

const LevelControl = Control.extend({
	onAdd: function(map) {
		this.container = DomUtil.create("div", "leaflet-bar leaflet-control-levels");
		this.setAvailableLevels(this.options.levels);
		this.setLevel(this.options.level);
		return this.container;
	},

	setAvailableLevels(lvls) {
		this.container.innerHTML = "";
		const levels = lvls || [ 0 ];

		levels.sort((a,b) => parseInt(b) - parseInt(a));

		levels.forEach(lvl => {
			const cLvl = DomUtil.create("a", "leaflet-control-level lvl"+lvl);
			cLvl.innerHTML = lvl;
			cLvl.addEventListener("click", () => {
				this.lastLevel = lvl;
				PubSub.publish("body.level.set", { level: lvl });
			});

			this.container.appendChild(cLvl);
		});
	},

	setLevel(l) {
		if(this.lastLevel) {
			const last = this.container.getElementsByClassName("lvl"+this.lastLevel)[0];
			if(last) {
				last.classList.remove("leaflet-control-level-selected");
			}
		}

		const next = this.container.getElementsByClassName("lvl"+l)[0];
		if(next) {
			next.classList.add("leaflet-control-level-selected");
			this.lastLevel = l;
		}
	},

	onRemove: function(map) {
	}
});

/**
 * Level selector is a React-Leaflet control to allow user choosing the indoor level to display.
 */
class LevelSelector extends MapControl {
	createLeafletElement(props) {
		return new LevelControl(props);
	}

	updateLeafletElement(fromProps, toProps) {
		if(!deepEqual(fromProps.levels, toProps.levels)) {
			this.leafletElement.setAvailableLevels(toProps.levels);
			this.leafletElement.setLevel(toProps.level);
		}

		if(fromProps.level !== toProps.level) {
			this.leafletElement.setLevel(toProps.level);
		}
	}
}

export default withLeaflet(LevelSelector);