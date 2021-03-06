
nlo = {
	load: {
		load_image: function(url, callback) {
			var image = new Image();
			image.addEventListener('load', () => callback(image));
			image.addEventListener('error', function (e) {
				console.log("error loading image:", image, e);
			});
			// image.setAttribute('crossorigin', 'anonymous');
			image.src = url;
			image.dataset.url = url;
		},
		load_image_onpage: function(url, callback) {
			var img = document.querySelector("img[data-url='" + url + "']");
			if (img)
				callback(img);
			else
				nlo.load.load_image(url, callback);
		},
		load_audio: function(url, callback) {
			var audio = new Audio();
			// audio.addEventListener('canplaythrough', callback.bind(undefined, audio));
			var loaded = false;
			audio.addEventListener('canplaythrough', function () {
				if (!loaded) {
					loaded = true;
					callback(audio);
				}
			});
			audio.addEventListener('error', function (e) {
				console.log("error loading audio:", audio, e);
			});
			audio.preload = "auto";
			audio.src = url;
			audio.load();
			// audio.play();
		},
		load_audio_onpage: function(url, callback) {
			var audio = document.querySelector("audio[data-url='" + url + "']");
			if (audio)
				callback(audio);
			else
				nlo.load.load_audio(url, callback);
		},

		load_all_assets: function(assets, callback) {
			var images = assets.images;
			var audio = assets.audio;

			var loaded_assets = {
				images: {},
				audio: {},
			};
			var count_loaded = 0;
			var count_expected = 0;
			if (images) {
				count_expected += Object.keys(images).length;
			}
			if (audio) {
				count_expected += Object.keys(audio).length;
			}

			if (images) {
				var keys = Object.keys(images);
				for (var i = 0; i < keys.length; i++) {
					nlo.load.load_image_onpage(images[keys[i]], (function (key, image) {
						// console.log("loaded image:", image);
						loaded_assets.images[key] = image;

						count_loaded++;
						if (count_loaded >= count_expected)
							callback(loaded_assets);
					}).bind(undefined, keys[i]));
				}
			}
			if (audio) {
				var keys = Object.keys(audio);
				for (var i = 0; i < keys.length; i++) {
					nlo.load.load_audio_onpage(audio[keys[i]], (function (key, audio_data) {
						// console.log("loaded audio:", audio_data);
						loaded_assets.audio[key] = audio_data;

						count_loaded++;
						if (count_loaded >= count_expected)
							callback(loaded_assets);
					}).bind(undefined, keys[i]));
				}
			}
		},
	},
	image: {
		slice_tilesheet: function (img, sx, sy) {
			for (var y = 0; y < img.height; y+=sy) {
				for (var x = 0; x < img.width; x+=sx) {
					var c = document.createElement('canvas');
					c.width = sx;
					c.height = sy;
					var ctx = c.getContext('2d');
					ctx.imageSmoothingEnabled = false;
					ctx.drawImage(img, -x,-y);

					img['i_' + (x / sx) + '_' + (y / sy)] = c;
				}
			}

			img.subimg = (x,y) => {
				return img['i_' + x + '_' + y];
			};
		},
		create_color_layer_buffers: function (img, colors) {
			return colors.map(color => {
				var c = document.createElement('canvas');
				c.width = img.width;
				c.height = img.height;
				var ctx = c.getContext('2d');
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(img, 0,0);
				ctx.globalCompositeOperation = 'source-in';
				ctx.fillStyle = color;
				ctx.fillRect(0,0,c.width,c.height);
				return c;
			});
		},
		render_img_color: function (img, color) {
			var ctx = img.getContext('2d');
			ctx.globalCompositeOperation = 'source-in';
			ctx.fillStyle = color;
			ctx.fillRect(0,0,img.width,img.height);
			return img;
		},
	},
};

function GameSystem(canvas, assets) {
	this.canvas = canvas;
	canvas.game_system = this;
	this.images = assets.images;
	this.audio = assets.audio;

	this.entities = [];

	this.services = {};
	this.particle_systems = {};

	this.background_color = '#000';

	this.previous_keystate = {};
	this.keystate = {
		W: false,
		A: false,
		S: false,
		D: false,
		shift: false,
		ctrl: false,
		alt: false,
		
		space: false,
		left: false,
		up: false,
		right: false,
		down: false,
	};
	this.previous_mouse1_state = false;
	this.mouse1_state = false;
	this.mouse_position = { px: 0, py: 0 };

	document.addEventListener('keydown', (function (e) {
		e = e || window.event;
		if (!this.keystate.ctrl)
			e.preventDefault();
		var charcode = String.fromCharCode(e.keyCode);
		this.keystate[e.key] = true;
		this.keystate.shift = !!e.shiftKey;
		this.keystate.ctrl = !!e.ctrlKey;
		this.keystate.alt = !!e.altKey;
		// console.log('keydown: ', e.key);
	}).bind(this));

	document.addEventListener('keyup', (function (e) {
		e = e || window.event;
		if (!this.keystate.ctrl)
			e.preventDefault();
		var charcode = String.fromCharCode(e.keyCode);
		this.keystate[e.key] = false;
		this.keystate.shift = !!e.shiftKey;
		this.keystate.ctrl = !!e.ctrlKey;
		this.keystate.alt = !!e.altKey;
		// console.log('keyup: ', e.key);
	}).bind(this));

	document.addEventListener('mousedown', e => {
		var x = e.x - this.canvas.getBoundingClientRect().left;
		var y = e.y - this.canvas.getBoundingClientRect().top;
		this.mouse_position = { px: x, py: y };
		this.mouse_game_position = this.camera ? this.camera.translate_coordinates_to_world(this.mouse_position) : this.mouse_position;
		this.mouse1_state = true;
	});
	document.addEventListener('mouseup', e => {
		var x = e.x - this.canvas.getBoundingClientRect().left;
		var y = e.y - this.canvas.getBoundingClientRect().top;
		this.mouse_position = { px: x, py: y };
		this.mouse_game_position = this.camera ? this.camera.translate_coordinates_to_world(this.mouse_position) : this.mouse_position;
		this.mouse1_state = false;
	});
	document.addEventListener('mousemove', e => {
		var x = e.x - this.canvas.getBoundingClientRect().left;
		var y = e.y - this.canvas.getBoundingClientRect().top;
		this.mouse_position = { px: x, py: y };
		this.mouse_game_position = this.camera ? this.camera.translate_coordinates_to_world(this.mouse_position) : this.mouse_position;
	});
}
GameSystem.prototype.run_game = function(ctx, fps) {
	this.last_timestamp = new Date().getTime();
	setInterval(this.step_game_frame.bind(this, ctx), 1000 / fps);
}
GameSystem.prototype.step_game_frame = function(ctx) {
	var time = new Date().getTime();
	this.deltatime = (time - this.last_timestamp) / 1000;
    this.last_timestamp = time;

	this.update();
	
	this.draw(ctx);
};
GameSystem.prototype.update = function () {
	try {
		// update all entities
		for (var ent of this.entities.filter(e => e.active)) {
			this.context_container = ent;
			ent.update(this);
		}

		// update all game systems
		for (var key of Object.keys(this.services)) {
			this.context_container = this.services[key];
			this.services[key].update(this);
		}


		// update particle systems
		for (var key of Object.keys(this.particle_systems)) {
			this.particle_systems[key].update(this);
		}

		// refresh key and mouse states
		this.previous_keystate = this.keystate;
		this.keystate = Object.assign({}, this.keystate);
		this.previous_mouse1_state = this.mouse1_state;

	} catch (e) {
		// console.error('exception during update:', e.message);
		console.error('exception stack:', e.stack);
	}

	this.context_container = undefined;
};
GameSystem.prototype.draw = function (ctx) {
	ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	// ctx.globalAlpha = 0.2;
	// ctx.globalAlpha = 1;
	// ctx.fillStyle = 'rgba(0,0,0,0.05)';
	// ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	// ctx.globalAlpha = 1;

	ctx.globalAlpha = 1;
	ctx.fillStyle = this.background_color;
	ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

	var entities_to_draw = this.entities.filter(e => e.active);
	entities_to_draw = entities_to_draw.filter(e => !(e instanceof ScreenEntity) || (
				e.px - (this.camera.px - this.canvas.width / 2) + e.width / 2 >= 0
				&& e.py - (this.camera.py - this.canvas.height / 2) + e.height / 2 >= 0
				&& e.px - (this.camera.px - this.canvas.width / 2) - e.width / 2 <= this.canvas.width
				&& e.py - (this.camera.py - this.canvas.height / 2) - e.height / 2 <= this.canvas.height));
	entities_to_draw.sort(function (a, b) { return a.z_index - b.z_index; });
	var game_systems_to_draw = Object.values(this.services);
	game_systems_to_draw.sort(function (a, b) { return a.z_index - b.z_index; });
	var particle_systems_to_draw = Object.values(this.particle_systems);
	particle_systems_to_draw.sort(function (a, b) { return a.z_index - b.z_index; });

	ctx.save();

	for (var system of game_systems_to_draw) {
		if (system.z_index < 0) {
			system.draw(ctx);
		}
	}

	for (var particle_system of particle_systems_to_draw) {
		if (particle_system.z_index < 0) {
			particle_system.draw(ctx);
		}
	}

	ctx.save();
	// apply camera transformations if we have a camera
	if (this.camera) {
		ctx.translate(+this.camera.width / 2, +this.camera.height / 2);
		ctx.rotate(Math.PI * -this.camera.angle / 180);
		ctx.scale(this.camera.scalex, this.camera.scaley);
		ctx.translate(-this.camera.px, -this.camera.py);
	}

	for (var ent of entities_to_draw) {
		ent.draw(ctx);
	}
	ctx.restore();

	for (var particle_system of particle_systems_to_draw) {
		if (particle_system.z_index >= 0) {
			particle_system.draw(ctx);
		}
	}

	for (var system of game_systems_to_draw) {
		if (system.z_index >= 0) {
			// console.log("system late draw:", system);
			system.draw(ctx);
		}
	}

	ctx.restore();
};

GameSystem.prototype.add_entity = function(ent) {
	ent.parent = this;
	this.entities.push(ent);
};
GameSystem.prototype.add_entities = function(ents) {
	ents.forEach(e => this.add_entity(e));
};
GameSystem.prototype.remove_entity = function(ent) {
	var index = this.entities.indexOf(ent);
	if (index !== -1)
		this.entities.splice(index, 1);
};
GameSystem.prototype.remove_entities = function(ents) {
	this.entities = this.entities.filter(e => !ents.includes(e));
};

GameSystem.prototype.query_entities = function(type) { return this.entities.filter(e => e instanceof type); };
GameSystem.prototype.is_mouse_pressed = function() { return !game.previous_mouse1_state && game.mouse1_state; };
GameSystem.prototype.is_mouse_released = function() { return game.previous_mouse1_state && !game.mouse1_state; };
GameSystem.prototype.is_key_pressed = function(k) { return this.keystate[k] && !this.previous_keystate[k]; };
GameSystem.prototype.is_key_released = function(k) { return !this.keystate[k] && this.previous_keystate[k]; };

GameSystem.prototype.move_camera = function(px, py) {
	this.camera.px = px;
	this.camera.py = py;

	this.mouse_game_position = this.camera.translate_coordinates_to_world(this.mouse_position);
};
GameSystem.prototype.rescale_camera = function(scalex, scaley) {
	this.camera.scalex = scalex;
	this.camera.scaley = scaley;

	this.mouse_game_position = this.camera.translate_coordinates_to_world(this.mouse_position);
};
GameSystem.prototype.rotate_camera = function(angle) {
	this.camera.angle = angle;
	
	this.mouse_game_position = this.camera.translate_coordinates_to_world(this.mouse_position);
};

GameSystem.prototype.find_at = function(type, p) {
	var found = this.entities
			.filter(e => e instanceof type)
			.filter(e => Math.abs(e.px - p.px) < e.width / 2 && Math.abs(e.py - p.py) < e.height / 2);
	found.sort((a,b) => Math.abs(a.px - p.px) + Math.abs(a.py - p.py) - (Math.abs(b.px - p.px) + Math.abs(b.py - p.py)));
	return found[0];
};

GameSystem.prototype.query_by_distance = function(type, p) {
	var found = this.entities.filter(e => e instanceof type);
	found.sort((a,b) => Math.abs(a.px - p.px) + Math.abs(a.py - p.py) - (Math.abs(b.px - p.px) + Math.abs(b.py - p.py)));
	return found;
};

GameSystem.prototype.find_colliding_rectangular = function(me, type) {
	var found = [];
	for (var i = 0; i < this.entities.length; i++) {
		var ent = this.entities[i];
		if (ent instanceof type) {
			if (Math.abs(ent.px - me.px) < (ent.width + me.width) / 2 && Math.abs(ent.py - me.py) < (ent.height + me.height) / 2) {
				found.push(ent);
			}
		}
	}

	return found;
};

function GameCamera(width, height) {
	this.width = width;
	this.height = height;

	this.scalex = 1;
	this.scaley = 1;

	this.px = this.width / 2;
	this.py = this.height / 2;
	this.angle = 0;
}
GameCamera.prototype.translate_coordinates_to_world = function(pxy) {
	var offset = d2_point_offset(this.angle, pxy.px - this.width / 2, pxy.py - this.height / 2);
	return { px: this.px + offset.px / this.scalex, py: this.py + offset.py / this.scaley };
};



function Entity(game) {
	this.sub_entities = [];
	this.coroutine_callbacks = [];
	this.until_callbacks = [];
	this.active = true;
}
Entity.prototype.z_index = 0;
Entity.prototype.update = function(game) {
	this.sub_entities.filter(e => e.active).forEach(e => e.update(game));

	for (var i = this.until_callbacks.length - 1; i >= 0; i--) {
		var coro = this.until_callbacks[i];
		coro.timer -= game.deltatime;
		if (coro.condition ? !coro.condition() : coro.timer > 0) {
			coro.callback();
		} else {
			if (coro.onend)
				coro.onend();
			this.until_callbacks.splice(i, 1);
		}
	}

	for (var i = this.coroutine_callbacks.length - 1; i >= 0; i--) {
		var coro = this.coroutine_callbacks[i];
		coro.timer -= game.deltatime;
		if (coro.timer <= 0) {
			if (coro.interval !== undefined) {
				coro.timer += coro.interval;
				if (coro.times) {
					coro.times--;
					if (coro.times <= 0) {
						this.coroutine_callbacks.splice(i, 1);
					}
				}
			} else {
				this.coroutine_callbacks.splice(i, 1);
			}
			coro.callback();
		}
	}

	var state;
	if (this.state_tree && (state = this.state_tree[this.current_state])) {
		if (state.cb)
			state.cb();
		state.timer -= game.deltatime;
		if (state.timer <= 0) {
			if (state.onend)
				state.onend();
			if (state.end_state)
				this.current_state = state.end_state;
			else
				this.current_state = undefined;
		}
	}
};
Entity.prototype.draw = function(ctx) {
	var entities_to_draw = this.sub_entities.filter(e => e.active);
	entities_to_draw.sort(function (a, b) { return a.z_index - b.z_index; });
	entities_to_draw.forEach(e => e.draw(ctx));
};
Entity.prototype.transition = function(delta, callback) {
	var c = { timer: delta };
	c.callback = () => callback((delta - c.timer) / delta);
	c.onend = () => callback(1);
	this.until_callbacks.push(c);
	return c;
};
Entity.prototype.until = function(condition, callback, onend) {
	this.until_callbacks.push({
		condition: condition,
		callback: callback,
		onend: onend,
	});
};
Entity.prototype.every = function(delta, times, callback) {
	if (callback === undefined) {
		callback = times;
		this.coroutine_callbacks.push({
			timer: delta,
			interval: delta,
			callback: callback,
		});
	} else {
		this.coroutine_callbacks.push({
			timer: delta,
			interval: delta,
			times: times,
			callback: callback,
		});
	}
};
Entity.prototype.after = function(delta, callback) {
	this.coroutine_callbacks.push({
		timer: delta,
		callback: callback,
	});
};
Entity.prototype.cancel_transistion = function(transition) {
	var index = this.until_callbacks.indexOf(transition);
	if (index !== -1)
		this.until_callbacks.splice(index, 1);
};
Entity.prototype.add_entity = function(ent) {
	ent.parent = this;
	this.sub_entities.push(ent);
};
Entity.prototype.remove_entity = function(ent) {
	var index = this.sub_entities.indexOf(ent);
	if (index !== -1)
		this.sub_entities.splice(index, 1);
};

Entity.prototype.remove_entities = function(ents) {
	this.sub_entities = this.sub_entities.filter(e => !ents.includes(e));
};

function ScreenEntity(game, px, py, width, height, image) {
	Entity.call(this, game);
	this.px = px;
	this.py = py;
	this.vx = 0;
	this.vy = 0;
	this.angle = 0;
	this.frame = 0;
	this.max_frame = 1;
	this.width = width;
	this.height = height;
	this.image = image;

	this.rotation = 0;
	this.alpha = 1;
}
ScreenEntity.prototype = Object.create(Entity.prototype);
ScreenEntity.prototype.constructor = ScreenEntity;
ScreenEntity.prototype.update = function(game) {
	Entity.prototype.update.call(this, game);
	if (this.rotation) {
		this.angle += this.rotation * game.deltatime;
		this.angle %= 360;
	}
	this.px += this.vx * game.deltatime;
	this.py += this.vy * game.deltatime;
};
ScreenEntity.prototype.draw = function(ctx) {
	ctx.save();

	ctx.globalAlpha = this.alpha;
	ctx.translate(Math.floor(this.px), Math.floor(this.py));
	ctx.rotate(this.angle * Math.PI / 180);
	// ctx.rotate(Math.PI * (Math.floor(this.angle / this.angle_granularity) * this.angle_granularity) / 180);

	var entities_to_draw = this.sub_entities.filter(e => e.active);
	entities_to_draw.sort(function (a, b) { return a.z_index - b.z_index; });
	entities_to_draw.filter(e => e.z_index < this.z_index).forEach(e => e.draw(ctx));
	this.draw_self(ctx);
	entities_to_draw.filter(e => e.z_index >= this.z_index).forEach(e => e.draw(ctx));

	ctx.restore();
};
ScreenEntity.prototype.draw_self = function(ctx) {
	if (this.image)
		ctx.drawImage(this.image,
			this.frame * (this.image.width / this.max_frame), 0, this.image.width / this.max_frame, this.image.height,
			0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
};
ScreenEntity.prototype.contains_point = function(p) {
	return Math.abs(p.px - this.px) < this.width / 2 && Math.abs(p.py - this.py) < this.height / 2;
};

function ScreenP9Entity(game, px, py, width, height, image) {
	ScreenEntity.call(this, game, px, py, width, height, image);

	this.pre_render();
}
ScreenP9Entity.prototype = Object.create(ScreenEntity.prototype);
// ScreenEntity.prototype.draw_self = function(ctx) {
// 	if (this.image) {
// 		ctx.drawImage(this.image,
// 			this.frame * (this.image.width / this.max_frame), 0, this.image.width / this.max_frame, this.image.height,
// 			0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
// 	}
// };
ScreenP9Entity.prototype.pre_render = function() {
	if (this.image) {
		var img = document.createElement('canvas');
		img.width = this.width;
		img.height = this.height;

		var w = this.image.width / 3;
		var h = this.image.height / 3;
		var ctx = img.getContext('2d');
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(this.image,
			0, 0, w, h,
			0, 0, w, h);
		ctx.drawImage(this.image,
			w, 0, w, h,
			w, 0, this.width - 2 * w, h);
		ctx.drawImage(this.image,
			w*2, 0, w, h,
			this.width - w, 0, w, h);

		ctx.drawImage(this.image,
			0, h, w, h,
			0, h, w, this.height - 2 * h);
		ctx.drawImage(this.image,
			w, h, w, h,
			w, h, this.width - 2 * w, this.height - 2 * h);
		ctx.drawImage(this.image,
			w*2, h, w, h,
			this.width - w, h, w, this.height - 2 * h);

		ctx.drawImage(this.image,
			0, h*2, w, h,
			0, this.height - h, w, h);
		ctx.drawImage(this.image,
			w, h*2, w, h,
			w, this.height - h, this.width - 2 * w, h);
		ctx.drawImage(this.image,
			w*2, h*2, w, h,
			this.width - w, this.height - h, w, h);

		this.image = img;
	}
};


function TextEntity(game, px, py, size=30, text="hello world!") {
	Entity.call(this, game);
	this.text = text;
	this.px = px;
	this.py = py;
	this.size = size;
}
TextEntity.prototype = Object.create(Entity.prototype);
TextEntity.prototype.draw = function (ctx) {
	ctx.save();
	ctx.translate(this.px, this.py);
	ctx.rotate(this.angle * Math.PI / 180);
	ctx.font = this.size + "px dogicabold";
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#ccc';

	var lines = this.text.split("\n");
	lines.forEach((l,i) => {
		ctx.fillText(l,0, (i - lines.length / 2 + 0.5) * this.size * 1.5);
	});
	ctx.restore();
};


function CanvasEntity(game) {
	Entity.call(this, game);
	this.create_canvas(game);

	this.px = this.buffer_canvas.width / 2;
	this.py = this.buffer_canvas.height / 2;
}
CanvasEntity.prototype = Object.create(Entity.prototype);
CanvasEntity.prototype.draw = function(ctx) {
	// var local_ctx = this.buffer_canvas.getContext('2d');
	// local_ctx.clearRect(0, 0, this.buffer_canvas.width, this.buffer_canvas.height);
	// local_ctx.imageSmoothingEnabled = false;
	// Entity.prototype.draw.call(this, local_ctx);
	// ctx.globalAlpha = 1;
	// ctx.fillStyle = '#ddd';
	// ctx.fillRect(this.px - this.buffer_canvas.width / 2, this.py - this.buffer_canvas.height / 2, this.buffer_canvas.width, this.buffer_canvas.height);
	ctx.drawImage(this.buffer_canvas, this.px - this.buffer_canvas.width / 2, this.py - this.buffer_canvas.height / 2);
};
CanvasEntity.prototype.create_canvas = function(game) {
	this.buffer_canvas = document.createElement('canvas');
	this.buffer_canvas.width = game.canvas.width;
	this.buffer_canvas.height = game.canvas.height;
};
CanvasEntity.prototype.redraw_canvas = function(dx,dy) {
	var new_buffer_canvas = document.createElement('canvas');
	new_buffer_canvas.width = this.buffer_canvas.width;
	new_buffer_canvas.height = this.buffer_canvas.height;
	var new_buffer_context = new_buffer_canvas.getContext('2d');
	// new_buffer_context.globalAlpha = 1 - amount;
	new_buffer_context.drawImage(this.buffer_canvas, dx,dy);
	this.buffer_canvas = new_buffer_canvas;
};
CanvasEntity.prototype.in_context = function(cb) {
	var ctx = this.buffer_canvas.getContext('2d');
	ctx.save();
	cb(ctx);
	ctx.restore();
};



function MovingCanvasEntity() {
	CanvasEntity.call(this, game);
	this.z_index = -40;
	this.redraw_amount = 0;

	this.fade_canvas = false; // set to a number like 1 or 2 to fade the canvas gradually
}
MovingCanvasEntity.prototype = Object.create(CanvasEntity.prototype);
MovingCanvasEntity.prototype.draw = function(ctx) {
	CanvasEntity.prototype.draw.call(this, ctx);
	if (this.fade_canvas)
		this.redraw_canvas_fade(game.deltatime * this.fade_canvas);
};
MovingCanvasEntity.prototype.update = function(game) {
	CanvasEntity.prototype.update.call(this, game);

	var d = vector_delta({ px: this.opx, py: this.opy }, game.camera);
	this.redraw_canvas(-d.px, -d.py);

	this.opx = game.camera.px;
	this.opy = game.camera.py;
};
MovingCanvasEntity.prototype.redraw_canvas_fade = function(amount) {
	this.redraw_amount += amount;
	if (this.redraw_amount > 0.2) {
		this.redraw_amount -= 0.2;

		var new_buffer_canvas = document.createElement('canvas');
		new_buffer_canvas.width = game.canvas.width;
		new_buffer_canvas.height = game.canvas.height;
		var new_buffer_context = new_buffer_canvas.getContext('2d');
		new_buffer_context.imageSmoothingEnabled = false;
		new_buffer_context.fillStyle = 'rgba(1,1,1,0.25)';
		new_buffer_context.fillRect(0, 0, game.canvas.width, game.canvas.height);
		new_buffer_context.globalCompositeOperation = 'source-in';
		// new_buffer_context.filter = 'blur(1px)';
		// new_buffer_context.globalAlpha = 0.5;
		new_buffer_context.drawImage(this.buffer_canvas, 0, -1);
		new_buffer_context.globalCompositeOperation = 'source-over';
		this.buffer_canvas = new_buffer_canvas;
	}
};
MovingCanvasEntity.prototype.in_context = function(cb) {
	var ctx = this.buffer_canvas.getContext('2d');
	ctx.save();
	ctx.translate(-this.opx + game.canvas.width / 2, - this.opy + game.canvas.height / 2);
	cb(ctx);
	ctx.restore();
};

function SoundService() {
	Entity.call(this, game);

	this.background_music = undefined;
}
SoundService.prototype = Object.create(Entity.prototype);
SoundService.prototype.play_background_music = function(background_music) {
	if (this.background_music)
		this.background_music.stop();
	this.background_music = background_music;
	this.background_music.loop = true;
	this.background_music.play();
};
SoundService.prototype.play_sound = function(sfx, volume=1, pitch_variation=0) {
	// if (Math.random() < volume) {
	var sound = sfx.cloneNode();
	sound.volume = volume;
	sound.playbackRate = 1 + Math.random() * pitch_variation;
	sound.play();
	// }
};

var p_zero = { px: 0, py: 0 };
function lerp(a, b, f) { return a * (1 - f) + b * f; }
function lerpp(p1, p2, f) { return { px: p1.px * (1 - f) + p2.px * f, py: p1.py * (1 - f) + p2.py * f }; }
function vector_delta(p1,p2) { return { px: p2.px - p1.px, py: p2.py - p1.py }; }
function vector_length(p) { return Math.sqrt(p.px ** 2 + p.py ** 2); }
function dist_sqr(p1,p2) { return (p1.px - p2.px) ** 2 + (p1.py - p2.py) ** 2; }
function dist(p1,p2) { return Math.sqrt((p1.px - p2.px) ** 2 + (p1.py - p2.py) ** 2); }
function unit_vector(p) { var d = vector_length(p); return { px: p.px/d, py: p.py/d }; }
function unit_delta(p1,p2) { return unit_vector({ px: p2.px - p1.px, py: p2.py - p1.py }); }
function unit_mul(p, n) { return { px: p.px*n, py: p.py*n }; }
function avgp(p1, p2) { return { px: (p1.px+p2.px)/2, py: (p1.py+p2.py)/2 }; }
function addp(p1, p2) { return { px: p1.px+p2.px, py: p1.py+p2.py }; }
function rand_vector() { var a = Math.random() * Math.PI * 2; return { px: Math.cos(a), py: Math.sin(a) };; }
function angle(d) { return Math.atan2(d.py, d.px) / Math.PI * 180; }
function angle_of(p1, p2) { return Math.atan2(p2.py - p1.py, p2.px - p1.px) / Math.PI * 180; }




function d2_point_offset(angle, px, py) {
	return {
		px: px * Math.cos(Math.PI * angle / 180) - py * Math.sin(Math.PI * angle / 180),
		py: py * Math.cos(Math.PI * angle / 180) + px * Math.sin(Math.PI * angle / 180),
	};
}
