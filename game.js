
var game;


function slice_tilesheet(img, sx, sy) {
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
}


function create_color_layer_buffers(img, colors) {
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
}
function render_layer_color(c, color) {
	var ctx = c.getContext('2d');
	ctx.globalCompositeOperation = 'source-in';
	ctx.fillStyle = color;
	ctx.fillRect(0,0,c.width,c.height);
	return c;
}




function ParticleService() {
	CanvasEntity.call(this, game);
	this.z_index = -40;
	this.redraw_amount = 0;
}
ParticleService.prototype = Object.create(CanvasEntity.prototype);
ParticleService.prototype.draw = function(ctx) {
	CanvasEntity.prototype.draw.call(this, ctx);
	this.redraw_canvas_fade(game.deltatime);
};
ParticleService.prototype.update = function(game) {
	CanvasEntity.prototype.update.call(this, game);

	var d = vector_delta({ px: this.opx, py: this.opy }, game.camera);
	this.redraw_canvas(-d.px, -d.py);

	this.opx = game.camera.px;
	this.opy = game.camera.py;
};
ParticleService.prototype.redraw_canvas_fade = function(amount) {
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
ParticleService.prototype.draw_particle = function(px, py, amount=1) {
	// console.log("px: ", px, "py:", py);
	var ctx = this.buffer_canvas.getContext('2d');
	ctx.globalAlpha = amount;
	ctx.fillStyle = '#fff4';
	ctx.save();
	ctx.translate(-this.opx + game.canvas.width / 2, - this.opy + game.canvas.height / 2);
	ctx.fillRect(px - 6, py - 6, 12,12);
	ctx.restore();
};
ParticleService.prototype.draw_image = function(img, px, py, sx, sy, amount=1) {
	var ctx = this.buffer_canvas.getContext('2d');
	ctx.globalAlpha = amount / 4;
	ctx.save();
	ctx.translate(-this.opx + game.canvas.width / 2, - this.opy + game.canvas.height / 2);
	ctx.translate(px, py);
	ctx.drawImage(img, -sx / 2, -sy / 2, sx, sy);
	ctx.restore();
};
ParticleService.prototype.draw_splash = function(px, py, amount=1) {
	var i = 0;
	var dirs = [1,1,1,1].map(i => unit_mul(rand_vector(), 10 + Math.random() * 25));

	this.transition(0.25, f => {
		var ctx = this.buffer_canvas.getContext('2d');
		ctx.globalAlpha = amount * (1 - f);
		ctx.fillStyle = '#fff';
		ctx.save();
		ctx.translate(-this.opx + game.canvas.width / 2, - this.opy + game.canvas.height / 2);
		dirs.forEach(d => ctx.fillRect(px - 6 + d.px * f, py - 6 + d.py * f, 12,12));
		ctx.restore();
	});
};
ParticleService.prototype.draw_text = function(px, py, amount, text, color='#fff') {
	var i = 0;
	var ctx = this.buffer_canvas.getContext('2d');
	ctx.globalAlpha = amount;
	ctx.font = "24px dogicabold";
	ctx.fillStyle = color;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.save();
	ctx.translate(-this.opx + game.canvas.width / 2, - this.opy + game.canvas.height / 2);
	ctx.fillText(text,px,py);
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
	if (Math.random() < volume) {
		var sound = sfx.cloneNode();
		sound.volume = volume;
		sound.playbackRate = 1 + Math.random() * pitch_variation;
		sound.play();
	}
};


function LightService() {
	Entity.call(this, game);

	this.background_music = undefined;
}
LightService.prototype = Object.create(Entity.prototype);
LightService.prototype.get_light = function(p) {
	return game.query_by_distance(LanternEntity, p)[0];
};

function BubbleTransition(swap_callback, done_callback) {
	CanvasEntity.call(this, game);
	this.timer = 0;
	this.is_up = false;
	this.swap_callback = swap_callback;
	this.done_callback = done_callback;

	this.z_index = 1000;
}
BubbleTransition.prototype = Object.create(CanvasEntity.prototype);
BubbleTransition.prototype.update = function (game) {
	CanvasEntity.prototype.update.call(this, game);

	this.px = game.camera.px;
	this.py = game.camera.py;

	var local_ctx = this.buffer_canvas.getContext('2d');

	var last_timer = this.timer;
	this.timer += game.deltatime * (10 + this.timer);

	var w = this.buffer_canvas.width;
	var h = this.buffer_canvas.height;

	if (this.is_up) {
		local_ctx.globalCompositeOperation = 'destination-out';
		for (var a = Math.floor(last_timer); a < Math.floor(this.timer); a++) {
			for (var o = 0; o < 6; o++) {
				var x = (((a + o / 3) % 10 + 0.5) / 10 % 1) * w;
				var y = h - (Math.floor((a) / 10) - o/2) * h / 10;
				local_ctx.moveTo(x, y);
				local_ctx.arc(x, y, 15 + o*5, 0, 2 * Math.PI);
				local_ctx.moveTo((x + w/10 * 1.5) % w, y - w/10);
				local_ctx.arc((x + w/10 * 1.5) % w, y + w/10, 15 + o*5, 0, 2 * Math.PI);
				local_ctx.moveTo((x + w/10 * 1.5), y - w/10);
				local_ctx.arc((x + w/10 * 1.5), y + w/10, 15 + o*5, 0, 2 * Math.PI);
				// local_ctx.moveTo((x + w/5 * 1.5) % w, y - w/5);
				// local_ctx.arc((x + w/5 * 1.5) % w, y + w/5, 45, 0, 2 * Math.PI);
			}
		}
		local_ctx.fillStyle = this.color || '#c74';
		local_ctx.fill();

	} else {
		for (var a = Math.floor(last_timer); a < Math.floor(this.timer); a++) {
			for (var o = 0; o < 25; o++) {
				var x = (((a + o / 3) % 10 + 0.5) / 10 % 1) * w;
				var y = h - (Math.floor((a) / 10) - o/2) * h / 10;
				local_ctx.moveTo(x, y);
				local_ctx.arc(x, y, 5 + o * 1.5, 0, 2 * Math.PI);
				local_ctx.moveTo((x + w/10 * 1.5) % w, y - w/10);
				local_ctx.arc((x + w/10 * 1.5) % w, y + w/10, 5 + o * 1.5, 0, 2 * Math.PI);
				local_ctx.moveTo((x + w/10 * 1.5), y - w/10);
				local_ctx.arc((x + w/10 * 1.5), y + w/10, 5 + o * 1.5, 0, 2 * Math.PI);
				// local_ctx.moveTo((x + w/5 * 1.5) % w, y - w/5);
				// local_ctx.arc((x + w/5 * 1.5) % w, y + w/5, 45, 0, 2 * Math.PI);
			}
		}
		local_ctx.fillStyle = this.color || '#14171f';
		local_ctx.fill();

	}

	// THIS IS NECESSARY TO PREVENT CANVAS FROM BATCHING ALL ARC OPERATIONS
	this.redraw_canvas(0,0);

	if (this.is_up && this.timer >= 200) {
		game.remove_entity(this);
		if (this.done_callback)
			this.done_callback();
	} else if (!this.is_up && this.timer >= 200) {
		this.timer = 0;
		this.is_up = true;
		if (this.swap_callback)
			this.swap_callback();
	}

};

function TriColorEntity(px, py, sx, sy, image,
		light_color='#fff',
		backing_color='#a91337',
		shadow_color='#040b20') {

	ScreenEntity.call(this, game, px, py, sx, sy, image);

	this.light_amount = 1;
	this.light_color = light_color;
	this.backing_color = backing_color;
	this.shadow_color = shadow_color;

	this.color_timer = Math.random() * Math.PI * 2;
	this.shake_amount = 0;

	this.set_image(this.image);
}
TriColorEntity.prototype = Object.create(ScreenEntity.prototype);
TriColorEntity.prototype.update = function (game) {
	ScreenEntity.prototype.update.call(this, game);
	this.color_timer = (this.color_timer + game.deltatime) % (Math.PI * 2);
	this.shake_amount = this.shake_amount * Math.max(0, 1 - game.deltatime * 2);
};
TriColorEntity.prototype.set_image = function(image) {
	this.image = image;
	this.sub_buffers = this.create_sub_buffers(image);
};
TriColorEntity.prototype.create_sub_buffers = function(image) {
	return create_color_layer_buffers(image, [this.light_color, this.backing_color, this.shadow_color]);
};
TriColorEntity.prototype.set_light_color = function(color) {
	this.light_color = color;
	this.render_color(this.sub_buffers[0], this.light_color);
};
TriColorEntity.prototype.set_backing_color = function(color) {
	this.backing_color = color;
	this.render_color(this.sub_buffers[1], this.backing_color);
};
TriColorEntity.prototype.set_shadow_color = function(color) {
	this.shadow_color = color;
	this.render_color(this.sub_buffers[2], this.shadow_color);
};
TriColorEntity.prototype.draw_self = function(ctx) {
	if (this.shake_amount > 0) {
		var r = 4;
		ctx.globalAlpha = this.light_amount;
		ctx.save();
		ctx.translate(Math.floor(r * Math.cos(this.color_timer + Math.PI) + this.shake_amount * Math.random()),
				Math.floor(r * Math.sin(this.color_timer + Math.PI) + this.shake_amount * Math.random()));
		ctx.drawImage(this.sub_buffers[2],
				0,0, this.image.width, this.image.height,
				0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
		ctx.restore();
		ctx.save();
		ctx.translate(Math.floor(r * Math.cos(this.color_timer) + this.shake_amount * Math.random()),
				Math.floor(r * Math.sin(this.color_timer) + this.shake_amount * Math.random()));
		ctx.drawImage(this.sub_buffers[1],
				0,0, this.image.width, this.image.height,
				0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
		ctx.restore();
		ctx.save();
		ctx.translate(Math.floor(this.shake_amount * Math.random()),
				Math.floor(this.shake_amount * Math.random()));
		ctx.drawImage(this.sub_buffers[0],
				0, 0, this.image.width, this.image.height, 0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
		ctx.restore();

		ctx.globalAlpha = 1;
	} else {
		var r = 4;
		ctx.globalAlpha = this.light_amount;
		ctx.save();
		ctx.translate(Math.floor(r * Math.cos(this.color_timer + Math.PI)), Math.floor(r * Math.sin(this.color_timer + Math.PI)));
		ctx.drawImage(this.sub_buffers[2],
				0,0, this.image.width, this.image.height,
				0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
		ctx.restore();
		ctx.save();
		ctx.translate(Math.floor(r * Math.cos(this.color_timer)), Math.floor(r * Math.sin(this.color_timer)));
		ctx.drawImage(this.sub_buffers[1],
				0,0, this.image.width, this.image.height,
				0 - this.width / 2, 0 - this.height / 2, this.width, this.height);
		ctx.restore();
		ctx.drawImage(this.sub_buffers[0],
				0, 0, this.image.width, this.image.height, 0 - this.width / 2, 0 - this.height / 2, this.width, this.height);

		ctx.globalAlpha = 1;
	}

};
TriColorEntity.prototype.create_sub_buffer = function(img) {
	var c = document.createElement('canvas');
	c.width = img.width;
	c.height = img.height;
	var ctx = c.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(img, 0,0);
	return c;
};
TriColorEntity.prototype.render_color = function(c, color) {
	var ctx = c.getContext('2d');
	ctx.globalCompositeOperation = 'source-in';
	ctx.fillStyle = color;
	ctx.fillRect(0,0,c.width,c.height);
	return c;
};

function AnimatedColorEntity(px, py, sx, sy, base_image, moving_image,
		light_color='#fff',
		backing_color='#a91337',
		shadow_color='#040b20') {
	TriColorEntity.call(this, px, py, sx, sy, base_image, light_color, backing_color, shadow_color);
	this.base_image = this.image;
	this.alt_image = moving_image;

	this.base_image_buffers = this.sub_buffers;
	this.alt_image_buffers = this.create_sub_buffers(this.alt_image);

	this.speed = 250;

	this.leaves_footprints = true;
	this.is_moving = false;
	this.is_idle_animated = false;
	this.moving_timer = 0;
}
AnimatedColorEntity.prototype = Object.create(TriColorEntity.prototype);
AnimatedColorEntity.prototype.update = function (game) {
	TriColorEntity.prototype.update.call(this, game);

	if (this.vx != 0 || this.vy != 0 || this.is_idle_animated) {
		if (!this.is_moving) {
			this.is_moving = true;
			this.image = this.alt_image;
			this.sub_buffers = this.alt_image_buffers;
			this.moving_timer = Math.random();
		}

		this.moving_timer += game.deltatime;
	} else {
		this.is_moving = false;
	}

	// var d = dist(this, { px: game.canvas.width / 2, py: game.canvas.height / 2});
	var d = dist(this, game.services.light_service.get_light(this));
	var f = game.canvas.width / 2 - d;
	this.light_amount = Math.min(1, Math.max(0.025, (300 - d) / 300));

	if (this.is_moving) {
		if (this.moving_timer >= 0.25) {
			if (this.image === this.base_image) {
				this.image = this.alt_image;
				this.sub_buffers = this.alt_image_buffers;
				if (this.leaves_footprints)
					game.services.particle_service.draw_particle(this.px + this.width / 2, this.py + this.height / 2 + 2, this.light_amount);
			} else {
				this.image = this.base_image;
				this.sub_buffers = this.base_image_buffers;
				if (this.leaves_footprints)
					game.services.particle_service.draw_particle(this.px - this.width / 2, this.py + this.height / 2 - 2, this.light_amount);
			}

			this.moving_timer = 0;

			if (this.leaves_footprints)
				game.services.sound_service.play_sound(game.audio.step, this.light_amount, 3);
		}
	} else {
		this.moving_timer = 0;

		if (this.image !== this.base_image) {
			this.set_image(this.base_image);
		}
	}
};

function HealthyEntity(px, py, sx, sy, base_image, moving_image) {
	AnimatedColorEntity.call(this, px, py, sx, sy, base_image, moving_image);

	this.type_tag = 'healthy';

	this.speed = 100;
	this.health = 10;
	this.atk = 2;
	this.def = 0;
	this.state = 'idle';

	this.attack_type = 'echo';
	this.attack_tags = ['player'];
	this.anger_chance = 0.2;
	this.attack_range = this.width;

	this.fire_cooldown = 0.5;
	this.fire_timer = 0;

	this.souls = Math.floor(Math.random() * 2);

	var period = 3;
	this.every(period - Math.random() * period * 0.5, () => {
		if (this.state === 'agro') {
			if (this.target.active && Math.random() < (1 - this.anger_chance)) {
				var d = this.target.px !== this.px || this.target.py !== this.py
						? unit_mul(unit_delta(this, this.target), this.speed)
						: p_zero;
				this.vx = d.px;
				this.vy = d.py;
			} else {
				this.state = 'idle';
				this.vx = 0;
				this.vy = 0;
			}
		}

		if (this.state === 'idle') {
			if (Math.random() < this.anger_chance
					&& (this.target = game.query_entities(HealthyEntity)
							.find(e => e != this && dist_sqr(e, this) < 100 * 100 && this.attack_tags.includes(e.type_tag)))) {
				var d = this.target.px !== this.px || this.target.py !== this.py
						? unit_mul(unit_delta(this, this.target), this.speed)
						: p_zero;
				this.vx = d.px;
				this.vy = d.py;
				this.state = 'agro';
			} else if (this.vx === 0 && this.vy === 0) {
				var d = unit_mul(rand_vector(), this.speed / 2);
				this.vx = d.px;
				this.vy = d.py;
			} else {
				this.vx = 0;
				this.vy = 0;
			}
		}
	});

	this.every(0.5 - Math.random() * 0.25 * 0.5, () => {
		if (this.state === 'agro' && this.target.active) {
			if (dist_sqr(this.target, this) < this.attack_range * this.attack_range) {
				this.fire_at(this.target);
			}
		}
	});
}
HealthyEntity.prototype = Object.create(AnimatedColorEntity.prototype);
// HealthyEntity.prototype.attack = function (other) {
// 	other.take_damage(this, this.atk);
// };
HealthyEntity.prototype.take_damage = function (from, dmg) {
	if (this.state === 'idle') {
		this.state = 'agro';
		this.target = from;

		var d = this.target.px !== this.px || this.target.py !== this.py
				? unit_mul(unit_delta(this, this.target), this.speed)
				: p_zero;
		this.vx = d.px;
		this.vy = d.py;
	}

	var amount = Math.max(0, dmg - this.def);
	this.health -= amount;

	if (amount > 0) {
		game.services.particle_service.draw_text(this.px, this.py - 30, this.light_amount, "-" + amount, '#f64');
		game.services.sound_service.play_sound(game.audio.hit, this.light_amount, 1);
	}
	this.shake_amount += 8;

	if (this.health <= 0) {
		game.remove_entity(this);
		this.active = false;
		game.services.particle_service.draw_splash(this.px, this.py, this.light_amount);
		for (var i = 0; i < this.souls; i++)
			game.add_entity(new SoulEntity(this.px, this.py));
	}
};
HealthyEntity.prototype.update = function (game) {
	AnimatedColorEntity.prototype.update.call(this, game);
	if (this.fire_timer > 0) {
		this.fire_timer -= game.deltatime;
	}
};
HealthyEntity.prototype.fire_at = function (p) {
	if (this.fire_timer <= 0) {
		d = unit_delta(this, p);
		game.add_entity(new Projectile(this, this.atk, d, this.px, this.py, this.attack_type));
		this.fire_timer = this.fire_cooldown;
	}
};

function Projectile(from, dmg, d, px, py, type) {
	ScreenEntity.call(this, game, px, py, 32, 32, 
			type === 'punch' ? game.images.monochrome_tilemap_packed.subimg(4,5)
			: type === 'sword' ? game.images.monochrome_tilemap_packed.subimg(6,4)
			: type === 'echo' ? game.images.monochrome_tilemap_packed.subimg(5,5)
			: game.images.monochrome_tilemap_packed.subimg(6,4));

	this.angle = angle(d) + 45;

	d = unit_mul(d, type === 'sword' ? 500
			: type === 'punch' ? 200
			: type === 'echo' ? 200
			: 500);

	this.vx = d.px;
	this.vy = d.py;

	this.dmg = dmg;
	this.from = from;
	this.type = type;

	this.after(0.5, () => {
		game.remove_entity(this);
	});

	var d = dist(this, game.services.light_service.get_light(this));
	var f = game.canvas.width / 2 - d;
	this.alpha = Math.min(1, Math.max(0.025, (300 - d) / 300));
}
Projectile.prototype = Object.create(ScreenEntity.prototype);
Projectile.prototype.update = function(game) {
	ScreenEntity.prototype.update.call(this, game);

	var col = game.query_entities(HealthyEntity)
		.find(e => e != this.from && dist_sqr(e, this) < 16*16);

	if (col) {
		col.take_damage(this.from, this.dmg);
		game.remove_entity(this);
	}

	var d = dist(this, game.services.light_service.get_light(this));
	var f = game.canvas.width / 2 - d;
	this.alpha = Math.min(1, Math.max(0.025, (300 - d) / 300));
};















function SoulEntity(px, py) {
	AnimatedColorEntity.call(this, px, py, 24, 24,
			game.images.monochrome_tilemap_packed.subimg(0,0),
			game.images.monochrome_tilemap_packed.subimg(1,0), '#eadab6', '#f17f1c');

	this.leaves_footprints = false;

	this.every(0.25, () => {
		game.services.particle_service.draw_image(this.image, this.px, this.py, this.width, this.height, this.light_amount);

		var d = unit_mul(rand_vector(), 20);
		var player;
		if (player = game.query_entities(Player).find(p => dist_sqr(p, this) < 200*200)) {
			d = unit_mul(unit_delta(this, player), 100);
			if (dist_sqr(player, this) < player.width * player.width) {
				game.remove_entity(this);
				player.souls += 1;
				game.services.particle_service.draw_text(player.px, player.py - 60, player.light_amount, 'souls: ' + player.souls, '#fff');
			}
		}

		this.vx = d.px;
		this.vy = d.py;

	});
}
SoulEntity.prototype = Object.create(AnimatedColorEntity.prototype);




function LanternEntity(px, py) {
	AnimatedColorEntity.call(this, px, py, 24, 24,
			game.images.monochrome_tilemap_packed.subimg(0,1),
			game.images.monochrome_tilemap_packed.subimg(1,1), '#eadab6', '#f17f1c');

	// this.state = 'idle';
	this.leaves_footprints = false;
	this.is_idle_animated = true;
}
LanternEntity.prototype = Object.create(AnimatedColorEntity.prototype);











function BatEnemy(px, py) {
	HealthyEntity.call(this, px, py, 32, 32,
			game.images.monochrome_tilemap_packed.subimg(2,0),
			game.images.monochrome_tilemap_packed.subimg(3,0));

	this.leaves_footprints = false;
	this.type_tag = 'bat';
	this.attack_range = 200;
	this.attack_type = 'echo';
}
BatEnemy.prototype = Object.create(HealthyEntity.prototype);







function Player(px, py) {
	HealthyEntity.call(this, px, py, 32, 32,
			game.images.monochrome_tilemap_packed.subimg(4,0),
			game.images.monochrome_tilemap_packed.subimg(5,0));

	this.speed = 250;
	this.atk = 5;
	this.health = 10;

	this.state = 'controlled';
	this.attack_type = 'sword';
	this.type_tag = 'player';
}
Player.prototype = Object.create(HealthyEntity.prototype);
Player.prototype.update = function (game) {

	var d = { px: 0, py: 0 };
	if (game.keystate['d'])
		d.px += 1;
	if (game.keystate['a'])
		d.px -= 1;
	if (game.keystate['s'])
		d.py += 1;
	if (game.keystate['w'])
		d.py -= 1;

	if (d.px != 0 || d.py != 0) {
		d = unit_vector(d);
		this.vx = this.speed * d.px;
		this.vy = this.speed * d.py;
	} else {
		this.vx = 0;
		this.vy = 0;
	}

	if (game.mouse1_state) {
		// d = unit_mul(unit_delta(this, game.mouse_game_position), 500);
		// game.add_entity(new Projectile(this, this.atk, d, this.px, this.py));
		this.fire_at(game.mouse_game_position);
	}

	// if (game.is_mouse_pressed() && this.contains_point(game.mouse_game_position)) {
	// 	game.services.particle_service.draw_text(this.px, this.py - 30, this.light_amount, "-16", '#f64');
	// 	game.services.sound_service.play_sound(game.audio.hit, 1, 1);
	// 	this.shake_amount += 16;
	// }

	// if (Math.random() < 0.0005) {
	// 	game.services.particle_service.draw_text(this.px, this.py - 30, this.light_amount, "click me!");
	// }


	HealthyEntity.prototype.update.call(this, game);
};


function DisplayTextBox(px, py, sx, sy) {
	ScreenP9Entity.call(this, game, px, py, sx, sy, game.images.button_p9);
	this.add_entity(this.textbox = new TextEntity(game, 0,0, 12, ''));
}
DisplayTextBox.prototype = Object.create(ScreenP9Entity.prototype);
DisplayTextBox.prototype.set_text = function (text) {
	this.textbox.text = text;
};

function Button(px, py, sx, sy, text, callback) {
	ScreenP9Entity.call(this, game, px, py, sx, sy, game.images.button_p9);
	this.callback = callback;
	this.disabled = false;
	if (text)
		this.add_entity(new TextEntity(game, 0,0, 16, text));
}
Button.prototype = Object.create(ScreenP9Entity.prototype);
Button.prototype.update = function (game) {
	ScreenP9Entity.prototype.update.call(this, game);
	if (this.disabled)
		this.alpha = 0.2;
	else if (game.is_mouse_pressed() && this.contains_point(game.mouse_game_position)) {
		game.services.sound_service.play_sound(game.audio.click, 1, 1);
		if (this.callback)
			this.callback();
		this.until(() => !game.mouse1_state, () => {
			if (this.disabled)
				this.alpha = 0.2;
			else
				this.alpha = 0.4;
		}, () => {
			if (this.disabled)
				this.alpha = 0.2;
			else
				this.alpha = 1;
		});
	}
};

function ShopItemButton(px, py, sx, sy, item_image, description, callback) {
	Button.call(this, px, py, sx, sy, undefined, callback);

	this.item_image = item_image;
	this.description = description;
}
ShopItemButton.prototype = Object.create(Button.prototype);
ShopItemButton.prototype.draw_self = function(ctx) {
	Button.prototype.draw_self.call(this, ctx);
	if (this.item_image)
		ctx.drawImage(this.item_image,
			this.frame * (this.item_image.width / this.max_frame), 0, this.item_image.width / this.max_frame, this.item_image.height,
			0 - (this.width - 25) / 2, 0 - (this.height - 25) / 2, this.width - 25, (this.height - 25));
};









function ControlService() {
	Entity.call(this, game);

	this.current_view = '???';
}
ControlService.prototype = Object.create(Entity.prototype);
ControlService.prototype.update = function(game) {
	Entity.prototype.update.call(this, game);

	var has_transition = game.query_entities(BubbleTransition).length > 0;
	var has_player = game.query_entities(Player).length > 0;

	if (has_transition)
		return;

	if (this.current_view === 'game') {
		if (!has_player) {
			game.add_entity(new BubbleTransition(() => {
				game.remove_entities(game.query_entities(AnimatedColorEntity));
				game.remove_entities(game.query_entities(SoulEntity));
				game.remove_entities(game.query_entities(Projectile));

				this.open_shop();
			}));
		} else {
			var player = game.query_entities(Player)[0];
			game.move_camera(player.px, player.py);

			if (game.query_entities(BatEnemy).length < 3) {
				this.open_shop();
			}
		}
	} else if (this.current_view === 'shop') {
	} else if (this.current_view === 'main') {
	}
};
ControlService.prototype.open_main = function() {
	this.current_view = 'main';

	game.move_camera(game.canvas.width/2,game.canvas.height/2);

	game.add_entity(new Button(game.canvas.width /2,game.canvas.height / 2, 200, 50, 'Play', () => {
		if (game.query_entities(BubbleTransition).length === 0)
			game.add_entity(new BubbleTransition(() => {
				game.remove_entities(game.entities.filter(e => !(e instanceof BubbleTransition)));
				this.open_game();
			}));
	}));

};
ControlService.prototype.open_shop = function() {
	this.current_view = 'shop';

	game.move_camera(game.canvas.width/2,game.canvas.height/2);

	game.add_entity(new Button(game.canvas.width-150,game.canvas.height-50, 200, 50, 'Continue >', () => {
		if (game.query_entities(BubbleTransition).length === 0)
			game.add_entity(new BubbleTransition(() => {
				game.remove_entities(game.entities.filter(e => !(e instanceof BubbleTransition)));
				this.open_game();
			}));
	}));

	game.add_entity(this.sword_item = new ShopItemButton(100, 100, 100, 100, game.images.monochrome_tilemap_packed.subimg(6,4), 
		"[sword]\natk +2\ndef +1", () => {
		if (game.query_entities(BubbleTransition).length === 0) {
			this.sword_item.disabled = true;
		}
	}));

	game.add_entity(this.display_text_box = new DisplayTextBox(game.canvas.width-200, 200, 300, 100));
	this.display_text_box.until(() => this.current_view !== 'shop', () => {
		if (game.mouse_game_position) {
			var current_item = game.query_entities(ShopItemButton).find(b => b.contains_point(game.mouse_game_position));
			if (current_item) {
				this.display_text_box.set_text(current_item.description);
			} else {
				this.display_text_box.set_text("select a gift to fill\nyour [jar]");
			}
		}
	});
	this.display_text_box.set_text("select a gift the fill\n[your jar]");
};
ControlService.prototype.open_game = function() {
	this.current_view = 'game';

	for (var i = 0; i < 20; i++) {
		var v = rand_vector();
		game.add_entity(new BatEnemy(game.canvas.width / 2 + v.px * (100 + 500 * Math.random()), game.canvas.height / 2 + v.py * (100 + 500 * Math.random())));
	}
	game.add_entity(new Player(game.canvas.width / 2, game.canvas.height / 2));
	game.add_entity(new LanternEntity(game.canvas.width / 2, game.canvas.height / 2 - 100));
	game.add_entity(new LanternEntity(game.canvas.width / 2 + 400, game.canvas.height / 2 + 500));
};









function main () {
	var canvas = document.querySelector('#game_canvas');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	nlo.load.load_all_assets({
		images: {
			ufo: 'assets/img/ufo.png',
			monochrome_tilemap_packed: 'assets/img/monochrome_tilemap_packed.png',
			button_p9: 'assets/img/button_p9.png',
		},
		audio: {
			step: 'assets/sfx/step.wav',
			hit: 'assets/sfx/hit.wav',
			click: 'assets/sfx/click.wav',
		},
	}, loaded_assets => {
		game = new GameSystem(canvas, loaded_assets);
		game.background_color = '#232836';
		game.camera = new GameCamera(canvas.width, canvas.height);

		slice_tilesheet(game.images.monochrome_tilemap_packed, 8,8);

		// initialize all systems
		game.services.light_service = new LightService();
		game.services.control_service = new ControlService();
		game.services.particle_service = new ParticleService();
		game.services.sound_service = new SoundService();

		// game.add_entity(button = new Button(100,canvas.height-25, 200, 50, 'Transition!', () => {
		// 	game.add_entity(new BubbleTransition(() => {
		// 		var count = game.query_entities(AnimatedColorEntity).length;
		// 		game.remove_entities(game.query_entities(AnimatedColorEntity));
		// 		if (count > 5) {
		// 			for (var i = 0; i < 1; i++) {
		// 				game.add_entity(new Player(canvas.width / 2, canvas.height / 2));
		// 			}
		// 		} else {
		// 			for (var i = 0; i < 100; i++) {
		// 				game.add_entity(new BatEnemy(100 + Math.random() * 2000,100 + Math.random() * 2000));
		// 			}
		// 		}
		// 	}));
		// }));

		// for (var i = 0; i < 10; i++) {
		// 	game.add_entity(new BatEnemy(100 + Math.random() * 500,100 + Math.random() * 500));
		// }
		// game.add_entity(new Player(canvas.width / 2, canvas.height / 2));


		// game.services.control_service.open_game();
		game.services.control_service.open_main();

		game.run_game(ctx, 60);
	});
}

window.addEventListener('load', main);
