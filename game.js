
var game;


// function UserInputService() {
// 	Entity.call(this, game);

// 	// this.fade_path = true;
// }
// UserInputService.prototype = Object.create(Entity.prototype);
// UserInputService.prototype.update = function(game) {
// 	Entity.prototype.update.call(this, game);

// 	if (game.is_mouse_pressed()) {
// 		if (
// 				(this.current_template = game.query_entities(DraggableTemplate).find(t => dist_sqr(t, game.mouse_game_position) < t.width * t.width / 4))
// 				) {





// 		} else if (
// 				(this.current_target = game.query_entities(TargetCircle).find(t => dist_sqr(t, game.mouse_game_position) < t.radius * t.radius))
// 				&& !this.current_target.connected_target) {

// 			this.current_target.radius_target = 5;
// 			game.query_entities(GoalCircle).forEach(t => t.radius_target = t.__radius);

// 			// create a scribble
// 			game.add_entity(this.scribble = new Scribble([game.mouse_game_position, game.mouse_game_position, game.mouse_game_position]));

// 			var ink_amount = 1800;

// 			// drag it until the player releases the mouse button
// 			this.until(() => !game.mouse1_state && ink_amount >= 0, () => {
// 				var d = dist(game.mouse_game_position, this.scribble.points[this.scribble.points.length-1]);
// 				if (ink_amount >= d) {
// 					ink_amount -= d;
// 					this.scribble.add_point(game.mouse_game_position);
// 				// } else {
// 				// 	ink_amount = -1;
// 				}
// 			}, () => {
// 				if (this.last_scribble)
// 					game.remove_entity(this.last_scribble);

// 				var p = this.scribble.points[this.scribble.points.length-1];

// 				if (this.reached_target = game.query_entities(GoalCircle).find(t => dist_sqr(t, p) < t.radius * t.radius)) {
// 					this.current_target.connected_target = this.reached_target;

// 					game.add_entity(this.second_scribble = new Scribble());
// 					this.second_scribble.z_index = -2;
// 					this.second_scribble.px = 2;
// 					this.second_scribble.py = 2;
// 					this.second_scribble.color = '#c62'; // '#c62';
// 					this.second_scribble.line_width = 10;
// 					this.second_scribble.play_pointset(this.scribble.points);

// 					var path = [... this.scribble.points];
// 					this.every(3, () => {
// 						if (Math.random() < 0.25) {
// 							game.services.enemy_service.add_entity(new MachineEnemy(path[0].px, path[0].py, path));
// 						} else {
// 							game.services.enemy_service.add_entity(new CrawlerEnemy(path[0].px, path[0].py, path));
// 						}
// 					});

// 					game.services.turret_service.is_firing = true;

// 					// game.add_entity(this.dark_scribble = new Scribble());
// 					// game.add_entity(this.second_dark_scribble = new Scribble());
// 					// this.dark_scribble.z_index = 2;
// 					// this.dark_scribble.is_greyscale = true;
// 					// this.dark_scribble.line_width = 5;
// 					// this.second_dark_scribble.z_index = -1;
// 					// this.second_dark_scribble.is_greyscale = true;
// 					// this.second_dark_scribble.line_width = 10;
// 					// this.second_dark_scribble.px = 2;
// 					// this.second_dark_scribble.py = 2;
// 					// var farthest = 0;
// 					// this.dark_scribble.every(0.1, () => {
// 					// 	game.services.enemy_service.sub_entities.forEach(e => farthest = Math.max(farthest, e.index));
// 					// 	while(this.dark_scribble.points.length < farthest) {
// 					// 		this.dark_scribble.add_point(path[this.dark_scribble.points.length]);
// 					// 		this.second_dark_scribble.add_point(path[this.second_dark_scribble.points.length]);
// 					// 	}
// 					// });

// 				} else {
// 					this.current_target.radius_target = this.current_target.__radius;
// 					this.scribble.do_fade = true;
// 					var s = this.scribble;
// 					this.scribble.after(1.1, () => {
// 						s.do_fade = false;
// 					});

// 					this.last_scribble = this.scribble;
// 				}
// 				game.query_entities(GoalCircle).forEach(t => t.radius_target = 5);
// 			});
// 		}
// 	}


// 	// if (game.is_key_pressed('=')) {
// 	// 	if (this.interacting_ent) {
// 	// 		this.interacting_ent.value = Math.abs(this.interacting_ent.value);
// 	// 	}
// 	// } else if (game.is_key_pressed('-')) {
// 	// 	if (this.interacting_ent) {
// 	// 		this.interacting_ent.value = -Math.abs(this.interacting_ent.value);
// 	// 	}

// };
// // UserInputService.prototype.save_data = function () {
// // 	var data = game.query_entities(NumberCircle).map(n => [n.value, Math.round(n.px), Math.round(n.py)]);
// // 	console.log("data:", JSON.stringify(data));
// // 	return data;
// // };
// // UserInputService.prototype.reload_data = function (data) {
// // 	// console.log("data:", data);
// // 	game.remove_entities(game.query_entities(NumberCircle));
// // 	game.remove_entities(game.query_entities(CircleConnector));
// // 	game.add_entities(data.map(d => new NumberCircle(d[1],d[2], d[0])));
// // };
// function EnemyService() {
// 	Entity.call(this, game);

// 	// this.fade_path = true;
// 	this.create_canvas();

// 	this.z_index = 20;

// }
// EnemyService.prototype = Object.create(Entity.prototype);
// EnemyService.prototype.update = function(game) {
// 	Entity.prototype.update.call(this, game);

// 	var collisons = this.sub_entities
// 		.map(ent => { return { ent: ent, projs: game.services.projectile_service.projectiles.filter(p => dist_sqr(ent, p) < 400) }; })
// 		.filter(col => col.projs.length > 0);

// 	var projs = [];
// 	for (var col of collisons) {
// 		col.ent.health -= 1;
// 		projs.push(...col.projs);
// 		for (var p of projs) {
// 			game.services.blood_service.draw_blood(p.px, p.py, 4);
// 		}
// 	}
// 	game.services.projectile_service.remove_projectiles(projs);

// 	this.remove_entities(collisons.filter(col => col.ent.health <= 0).map(col => col.ent));

// };
// EnemyService.prototype.draw = function(ctx) {
// 	// ctx.drawImage(this.buffer_canvas, 0, 0);
// 	// Entity.prototype.draw.call(this, ctx);
// 	this.redraw_canvas_fade(game.deltatime);
// 	var local_ctx = this.buffer_canvas.getContext('2d');
// 	local_ctx.imageSmoothingEnabled = false;
// 	Entity.prototype.draw.call(this, local_ctx);

// 	ctx.drawImage(this.buffer_canvas, 0, 0);
// 	// ctx.drawImage(this.buffer_canvas, 0, 0);
// };
// EnemyService.prototype.create_canvas = function() {
// 	this.buffer_canvas = document.createElement('canvas');
// 	this.buffer_canvas.width = game.canvas.width;
// 	this.buffer_canvas.height = game.canvas.height;
// 	this.redraw_amount = 0;
// };
// EnemyService.prototype.redraw_canvas_fade = function(amount) {
// 	this.redraw_amount += amount;

// 	var new_buffer_canvas = document.createElement('canvas');
// 	new_buffer_canvas.width = game.canvas.width;
// 	new_buffer_canvas.height = game.canvas.height;
// 	var new_buffer_context = new_buffer_canvas.getContext('2d');
// 	// new_buffer_context.globalAlpha = 1 - amount;
// 	// new_buffer_context.filter = 'blur(1px)';
// 	new_buffer_context.drawImage(this.buffer_canvas, 0, 0);
// 	// new_buffer_context.globalAlpha = 1;
// 	if (this.redraw_amount > 0.05) {
// 		this.redraw_amount -= 0.05;
// 		new_buffer_context.fillStyle = 'rgba(0,0,0,0.025)';
// 		new_buffer_context.globalCompositeOperation = 'source-in';
// 		new_buffer_context.fillRect(0, 0, game.canvas.width, game.canvas.height);
// 		new_buffer_context.globalCompositeOperation = 'source-over';
// 	}
// 	this.buffer_canvas = new_buffer_canvas;
// };
// function BloodService() {
// 	Entity.call(this, game);

// 	// this.fade_path = true;
// 	this.create_canvas();

// 	this.z_index = 40;

// }
// BloodService.prototype = Object.create(Entity.prototype);
// // BloodService.prototype.update = function(game) {
// // 	Entity.prototype.update.call(this, game);
// // };
// BloodService.prototype.draw = function(ctx) {
// 	var local_ctx = this.buffer_canvas.getContext('2d');
// 	Entity.prototype.draw.call(this, local_ctx);
// 	this.redraw_canvas_fade(game.deltatime);

// 	ctx.globalAlpha = 1;
// 	ctx.drawImage(this.buffer_canvas, 0, 0);
// };
// BloodService.prototype.create_canvas = function() {
// 	this.buffer_canvas = document.createElement('canvas');
// 	this.buffer_canvas.width = game.canvas.width;
// 	this.buffer_canvas.height = game.canvas.height;
// 	this.redraw_amount = 0;
// };
// BloodService.prototype.redraw_canvas_fade = function(amount) {
// 	this.redraw_amount += amount;

// 	var new_buffer_canvas = document.createElement('canvas');
// 	new_buffer_canvas.width = game.canvas.width;
// 	new_buffer_canvas.height = game.canvas.height;
// 	var new_buffer_context = new_buffer_canvas.getContext('2d');
// 	// new_buffer_context.globalAlpha = 1 - amount;
// 	// new_buffer_context.filter = 'blur(1px)';
// 	new_buffer_context.drawImage(this.buffer_canvas, 0, 0);
// 	// new_buffer_context.globalAlpha = 1;
// 	if (this.redraw_amount > 0.1) {
// 		this.redraw_amount -= 0.1;
// 		new_buffer_context.fillStyle = 'rgba(0,0,0,0.1)';
// 		new_buffer_context.globalCompositeOperation = 'source-in';
// 		new_buffer_context.fillRect(0, 0, game.canvas.width, game.canvas.height);
// 		new_buffer_context.globalCompositeOperation = 'source-over';
// 	}
// 	this.buffer_canvas = new_buffer_canvas;
// };
// BloodService.prototype.draw_blood = function(px, py, amount) {
// 	var ctx = this.buffer_canvas.getContext('2d');

// 	ctx.strokeStyle = '#fff';
// 	ctx.fillStyle = '#fff';

// 	for (var i = 0; i < amount; i++) {
// 		ctx.beginPath();
// 		ctx.filter = 'blur(1px)';
// 		ctx.lineWidth = Math.floor(Math.random() * 3) + 2;
// 		ctx.moveTo(px, py);
// 		ctx.lineTo(px + Math.random() * 70 - 35, py + Math.random() * 70 - 35);
// 		// ctx.bezierCurveTo(from.px + d1.px, from.py + d1.py, to.px + d2.px, to.py + d2.py, to.px, to.py);
// 		// ctx.bezierCurveTo(from.px + dr1.px, from.py + dr1.py, to.px + dr2.px, to.py + dr2.py, to.px, to.py);
// 		ctx.stroke();
// 		ctx.restore();
// 		// ctx.beginPath();
// 		// ctx.filter = 'blur(3px)';
// 		// // ctx.lineWidth = Math.floor(Math.random() * 8) + 4;
// 		// ctx.arc(px + Math.random()*30-15, py + Math.random()*30-15, Math.floor(Math.random() * 4) + 2, 0, 2 * Math.PI);
// 		// // ctx.moveTo(px, py);
// 		// // ctx.lineTo(px + Math.random() * 70 - 35, py + Math.random() * 70 - 35);
// 		// // ctx.bezierCurveTo(from.px + d1.px, from.py + d1.py, to.px + d2.px, to.py + d2.py, to.px, to.py);
// 		// // ctx.bezierCurveTo(from.px + dr1.px, from.py + dr1.py, to.px + dr2.px, to.py + dr2.py, to.px, to.py);
// 		// ctx.fill();
// 		// ctx.stroke();
// 		// ctx.restore();
// 	}
// };



// function TurretService() {
// 	Entity.call(this, game);
// 	this.turrets = [];

// 	this.image = game.images.turret;
// 	this.width = 32;
// 	this.height = 32;

// 	this.frame = 0;
// 	this.max_frame = 1;

// 	this.z_index = 200;

// 	this.is_firing = false;

// 	this.create_canvas(game);
// }
// TurretService.prototype = Object.create(Entity.prototype);
// TurretService.prototype.draw = function(ctx) {
// 	ctx.drawImage(this.buffer_canvas, 0, 0);
// };
// TurretService.prototype.update = function(game) {
// 	if (this.is_firing) {
// 		for (const t of this.turrets) {
// 			t.firetimer -= game.deltatime;
// 			if (t.firetimer <= 0) {
// 				t.firetimer += 1;
// 				this.fire_turret(game, t);
// 			}
// 		}
// 	}
// };
// TurretService.prototype.add_turret = function(px, py) {
// 	this.turrets.push({
// 		px: px,
// 		py: py,
// 		firetimer: 0,
// 	});
	
// 	var buffer_context = this.buffer_canvas.getContext('2d');
// 	buffer_context.drawImage(this.image, px - this.width / 2, py - this.height / 2, this.width, this.height);
// };
// TurretService.prototype.fire_turret = function(game, turret) {
// 	game.services.projectile_service.spawn_projectile(game, turret.px + 4, turret.py - 4);
// 	// game.add_entity(new TurretProjectile(game, turret.px + 4, turret.py - 4));
// };
// TurretService.prototype.remove_turrets = function(turrets) {
// 	var buffer_context = this.buffer_canvas.getContext('2d');
// 	for (const t of turrets) {
// 		buffer_context.clearRect(t.px - this.width / 2, t.py - this.height / 2, this.width, this.height);
// 	}

// 	this.turrets = this.turrets.filter(t => !turrets.includes(t));
// };
// TurretService.prototype.create_canvas = function(game) {
// 	this.buffer_canvas = document.createElement('canvas');
// 	this.buffer_canvas.width = game.canvas.width;
// 	this.buffer_canvas.height = game.canvas.height;
// };
// TurretService.prototype.redraw_canvas = function(game, dx, dy) {
// 	var new_buffer_canvas = document.createElement('canvas');
// 	new_buffer_canvas.width = game.canvas.width;
// 	new_buffer_canvas.height = game.canvas.height;
// 	var new_buffer_context = new_buffer_canvas.getContext('2d');
// 	new_buffer_context.drawImage(this.buffer_canvas, dx, dy);
// 	this.buffer_canvas = new_buffer_canvas;
// };


// function TurretProjectileService() {
// 	Entity.call(this, game);
// 	this.projectiles = [];

// 	this.image = game.images.projectile;
// 	this.width = 4;
// 	this.height = 4;

// 	this.create_canvas(game);
// }
// TurretProjectileService.prototype = Object.create(Entity.prototype);
// TurretProjectileService.prototype.update = function(game) {
// 	for (const p of this.projectiles) {
// 		p.px += p.vx * game.deltatime;
// 	}

// 	this.projectiles = this.projectiles.filter(p => p.px < 960);

// 	// console.log("this.projectiles:", this.projectiles.length);

// 	this.redraw_canvas(game, 64 * game.deltatime, 0);
// };
// TurretProjectileService.prototype.spawn_projectile = function(game, px, py) {
// 	this.projectiles.push({ px: px, py: py, a: 45 * Math.floor(Math.random() * 8), r: 90, vx: 64, vy: 0, });

// 	var buffer_context = this.buffer_canvas.getContext('2d');
// 	buffer_context.drawImage(this.image, px - this.width / 2, py - this.height / 2);
// };
// TurretProjectileService.prototype.remove_projectiles = function(projectiles) {
// 	var buffer_context = this.buffer_canvas.getContext('2d');
// 	for (const p of projectiles) {
// 		buffer_context.clearRect(p.px - this.width / 2 - 1, p.py - this.height / 2, this.width + 2, this.height);
// 	}

// 	this.projectiles = this.projectiles.filter(p => !projectiles.includes(p));
// };
// TurretProjectileService.prototype.create_canvas = function(game) {
// 	this.buffer_canvas = document.createElement('canvas');
// 	this.buffer_canvas.width = game.canvas.width;
// 	this.buffer_canvas.height = game.canvas.height;
// 	this.true_offset_x = 0;
// 	this.true_offset_y = 0;
// };
// TurretProjectileService.prototype.redraw_canvas = function(game, dx, dy) {
// 	this.true_offset_x += dx;
// 	this.true_offset_y += dy;

// 	var dx2 = this.true_offset_x - this.true_offset_x % 1;
// 	this.true_offset_x = this.true_offset_x % 1;
// 	var dy2 = this.true_offset_y - this.true_offset_y % 1;
// 	this.true_offset_y = this.true_offset_y % 1;

// 	var new_buffer_canvas = document.createElement('canvas');
// 	new_buffer_canvas.width = game.canvas.width;
// 	new_buffer_canvas.height = game.canvas.height;
// 	var new_buffer_context = new_buffer_canvas.getContext('2d');
// 	new_buffer_context.drawImage(this.buffer_canvas, dx2, dy2);
// 	this.buffer_canvas = new_buffer_canvas;
// };
// TurretProjectileService.prototype.draw = function(ctx) {
// 	ctx.drawImage(this.buffer_canvas, 0, 0);
// };



// function Scribble(points=[]) {
// 	ScreenEntity.call(this, game, 0, 0, 1, 1, undefined);
// 	this.points = points;
// 	this.draw_cycle = Math.random() * Math.PI * 2;

// 	this.do_fade = false;

// 	// this.color = '#fc4';
// 	this.line_width = 4;

// 	this.is_faded = false;
// 	this.is_greyscale = false;

// 	this.create_canvas();
// }
// Scribble.prototype = Object.create(ScreenEntity.prototype);
// Scribble.prototype.update = function(game) {
// 	ScreenEntity.prototype.update.call(this, game);
// 	this.draw_cycle += game.deltatime;
// 	this.draw_cycle %= Math.PI * 2;
// 	if (this.do_fade) {
// 		this.is_faded = true;
// 		this.redraw_canvas_fade(game.deltatime * 2);
// 	}
// };
// Scribble.prototype.draw_self = function(ctx) {
// 	ctx.drawImage(this.buffer_canvas, 0, 0);

// 	if (!this.is_greyscale && !this.is_faded && this.points.length > 0) {
// 		var p = this.points[this.points.length - 1];
// 		ctx.beginPath();
// 		ctx.arc(p.px, p.py, 8, 0, 2 * Math.PI);
// 		ctx.fillStyle = this.color || '#fc4';
// 		ctx.fill();
// 	}
// };
// Scribble.prototype.create_canvas = function() {
// 	this.buffer_canvas = document.createElement('canvas');
// 	this.buffer_canvas.width = game.canvas.width;
// 	this.buffer_canvas.height = game.canvas.height;
// };
// Scribble.prototype.redraw_canvas_fade = function(amount) {
// 	var new_buffer_canvas = document.createElement('canvas');
// 	new_buffer_canvas.width = game.canvas.width;
// 	new_buffer_canvas.height = game.canvas.height;
// 	var new_buffer_context = new_buffer_canvas.getContext('2d');
// 	new_buffer_context.globalAlpha = 1 - amount;
// 	new_buffer_context.drawImage(this.buffer_canvas, 0, 0);
// 	this.buffer_canvas = new_buffer_canvas;
// };
// Scribble.prototype.add_point = function(p) {
// 	p.draw_cycle = this.draw_cycle;
// 	this.points.push(p);
// 	if (this.points.length >= 4)
// 		this.render_scribble(
// 			this.points[this.points.length-4],
// 			this.points[this.points.length-3],
// 			this.points[this.points.length-2],
// 			this.points[this.points.length-1]);
// };
// Scribble.prototype.play_pointset = function(ps) {
// 	ps = [...ps];
// 	this.until(() => ps.length === 0, () => {
// 		this.points.push(ps.shift());
// 		if (this.points.length >= 4)
// 			this.render_scribble(
// 				this.points[this.points.length-4],
// 				this.points[this.points.length-3],
// 				this.points[this.points.length-2],
// 				this.points[this.points.length-1]);
// 	})
// };
// Scribble.prototype.render_scribble = function(prev, from, to, next) {
// 	var d = dist(from, to);
// 	var d1 = unit_mul(unit_vector(vector_delta(prev, from)), 100);
// 	var d2 = unit_mul(unit_vector(vector_delta(next, to)), 100);
// 	var davg = unit_mul(avgp(d1,d2), 2);
// 	var dr1 = lerpp(davg, d1, 0);
// 	var dr2 = lerpp(davg, d2, 0);

// 	var ctx = this.buffer_canvas.getContext('2d');
// 	ctx.save();
// 	ctx.lineWidth = this.line_width;
// 	if (this.is_greyscale) {
// 		ctx.strokeStyle = 'rgb('
// 				+ Math.floor((Math.sin(to.draw_cycle) / 2 + 0.5)*255) + ','
// 				+ Math.floor((Math.sin(to.draw_cycle) / 2 + 0.5)*255) + ','
// 				+ Math.floor((Math.sin(to.draw_cycle) / 2 + 0.5)*255) + ')';
// 	} else if (this.color) {
// 		ctx.strokeStyle = 'rgb('
// 				+ Math.floor((Math.sin(to.draw_cycle + Math.PI * 0.5 / 3) / 2 + 0.5)*128) + ','
// 				+ Math.floor((Math.sin(to.draw_cycle + Math.PI * 2.5 / 3) / 2 + 0.5)*128) + ','
// 				+ Math.floor((Math.sin(to.draw_cycle + Math.PI * 4.5 / 3) / 2 + 0.5)*128) + ')';
// 	} else {
// 		ctx.strokeStyle = 'rgb('
// 				+ Math.floor((Math.sin(to.draw_cycle) / 2 + 0.5)*255) + ','
// 				+ Math.floor((Math.sin(to.draw_cycle + Math.PI * 2 / 3) / 2 + 0.5)*255) + ','
// 				+ Math.floor((Math.sin(to.draw_cycle + Math.PI * 4 / 3) / 2 + 0.5)*255) + ')';
// 	}
// 	// ctx.strokeStyle = this.color;
// 	ctx.beginPath();
// 	ctx.moveTo(from.px, from.py);
// 	ctx.bezierCurveTo(from.px + davg.px, from.py + davg.py, to.px + davg.px, to.py + davg.py, to.px, to.py);
// 	// ctx.bezierCurveTo(from.px + d1.px, from.py + d1.py, to.px + d2.px, to.py + d2.py, to.px, to.py);
// 	// ctx.bezierCurveTo(from.px + dr1.px, from.py + dr1.py, to.px + dr2.px, to.py + dr2.py, to.px, to.py);
// 	ctx.stroke();
// 	ctx.restore();
// };

// function CrawlerEnemy(px, py, path) {
// 	ScreenEntity.call(this, game, px, py, 32, 32, game.images.enemy);
// 	this.frame = 0;
// 	this.max_frame = 4;

// 	this.speed = 30;
// 	this.health = 3;

// 	this.every(0.2 + Math.random() * 0.3, () => {
// 		this.frame = (this.vx > 0 ? 0 : 2) + (this.frame + 1) % 2;

// 		var delta = vector_delta(this, this.target_point);
// 		var d = dist(this, this.target_point);
// 		this.vx = delta.px / d * this.speed;
// 		this.vy = delta.py / d * this.speed;
// 		this.px += Math.floor(Math.random() * (3 * 2 + 1) - 3);
// 		this.py += Math.floor(Math.random() * (3 * 2 + 1) - 3);
// 	});


// 	this.path = path;
// 	this.index = 0;
// 	this.target_point = { px: px, py: py };
// }
// CrawlerEnemy.prototype = Object.create(ScreenEntity.prototype);
// CrawlerEnemy.prototype.update = function(game) {
// 	ScreenEntity.prototype.update.call(this, game);

// 	if (this.index < this.path.length && dist_sqr(this, this.target_point) < 25) {
// 		this.next_point();
// 	}

// };
// CrawlerEnemy.prototype.next_point = function() {
// 	if (this.index < this.path.length) {
// 		while (this.index < this.path.length && dist_sqr(this, this.path[this.index]) < 25 * 25) {
// 			this.index++;
// 		}
// 		if (this.index >= this.path.length) {
// 			game.services.enemy_service.remove_entity(this);
// 		} else {
// 			var p = this.path[this.index];
// 			var max_offset = 15;
// 			this.target_point = {
// 				px: p.px + Math.floor(Math.random() * (max_offset * 2 + 1) - max_offset),
// 				py: p.py + Math.floor(Math.random() * (max_offset * 2 + 1) - max_offset),
// 			};
// 			// var delta = vector_delta(this, this.target_point);
// 			// var d = dist(this, this.target_point);
// 			// this.vx = delta.px / d * this.speed;
// 			// this.vy = delta.py / d * this.speed;
// 		}
// 	} else {
// 		game.services.enemy_service.remove_entity(this);
// 	}
// };

// function MachineEnemy(px, py, path) {
// 	ScreenEntity.call(this, game, px, py, 48, 48, game.images.enemy_machine);
// 	this.frame = 0;
// 	this.max_frame = 3;

// 	this.speed = 15;
// 	this.health = 6;

// 	this.every(0.1 + Math.random() * 0.1, () => {
// 		this.frame = (this.frame + 1) % 3;

// 		var delta = vector_delta(this, this.target_point);
// 		var d = dist(this, this.target_point);
// 		this.vx = delta.px / d * this.speed;
// 		this.vy = delta.py / d * this.speed;
// 		// this.px += Math.floor(Math.random() * (3 * 2 + 1) - 3);
// 		// this.py += Math.floor(Math.random() * (3 * 2 + 1) - 3);
// 	});


// 	this.path = path;
// 	this.index = 0;
// 	this.target_point = { px: px, py: py };
// }
// MachineEnemy.prototype = Object.create(ScreenEntity.prototype);
// MachineEnemy.prototype.update = function(game) {
// 	ScreenEntity.prototype.update.call(this, game);

// 	if (this.index < this.path.length && dist_sqr(this, this.target_point) < 25) {
// 		this.next_point();
// 	}

// };
// MachineEnemy.prototype.next_point = function() {
// 	if (this.index < this.path.length) {
// 		while (this.index < this.path.length && dist_sqr(this, this.path[this.index]) < 25 * 25) {
// 			this.index++;
// 		}
// 		if (this.index >= this.path.length) {
// 			game.services.enemy_service.remove_entity(this);
// 		} else {
// 			var p = this.path[this.index];
// 			var max_offset = 15;
// 			this.target_point = {
// 				px: p.px + Math.floor(Math.random() * (max_offset * 2 + 1) - max_offset),
// 				py: p.py + Math.floor(Math.random() * (max_offset * 2 + 1) - max_offset),
// 			};
// 			// var delta = vector_delta(this, this.target_point);
// 			// var d = dist(this, this.target_point);
// 			// this.vx = delta.px / d * this.speed;
// 			// this.vy = delta.py / d * this.speed;
// 		}
// 	} else {
// 		game.services.enemy_service.remove_entity(this);
// 	}
// };


// function TargetCircle(px, py) {
// 	ScreenEntity.call(this, game, px, py, 48, 48, undefined);

// 	this.color = '#e92';
// 	this.edge_color = '#c50';

// 	this.timer = Math.random() * 50;
// 	this.radius = 50;
// 	this.__radius = this.radius;
// 	this.radius_target = this.radius;

// 	this.z_index = 10;
// }
// TargetCircle.prototype = Object.create(ScreenEntity.prototype);
// TargetCircle.prototype.draw_self = function (ctx) {

// 	ctx.beginPath();
// 	ctx.arc(0, 0, this.radius + Math.sin(this.timer * 2) * this.radius * 0.1, 0, 2 * Math.PI);
// 	ctx.fillStyle = this.color;
// 	ctx.fill();
// 	ctx.lineWidth = this.radius * 0.08;
// 	ctx.strokeStyle = this.edge_color;
// 	ctx.stroke();
// };
// TargetCircle.prototype.update = function (game) {
// 	ScreenEntity.prototype.update.call(this, game);

// 	this.timer += game.deltatime;
// 	this.radius = lerp(this.radius, this.radius_target, game.deltatime*2);
// };


// function GoalCircle(px, py) {
// 	ScreenEntity.call(this, game, px, py, 48, 48, undefined);

// 	this.color = '#9e2';
// 	this.edge_color = '#5c0';

// 	this.timer = Math.random() * 50;
// 	this.__radius = 50;
// 	this.radius = 5;
// 	this.radius_target = this.radius;

// 	this.z_index = 10;
// }
// GoalCircle.prototype = Object.create(ScreenEntity.prototype);
// GoalCircle.prototype.draw_self = function (ctx) {

// 	ctx.beginPath();
// 	ctx.arc(0, 0, this.radius + Math.sin(this.timer * 2) * this.radius * 0.1, 0, 2 * Math.PI);
// 	ctx.fillStyle = this.color;
// 	ctx.fill();
// 	ctx.lineWidth = this.radius * 0.08;
// 	ctx.strokeStyle = this.edge_color;
// 	ctx.stroke();
// };
// GoalCircle.prototype.update = function (game) {
// 	ScreenEntity.prototype.update.call(this, game);

// 	this.timer += game.deltatime;
// 	this.radius = lerp(this.radius, this.radius_target, game.deltatime*2);
// };



// function BracketsDisplay(px, py) {
// 	ScreenEntity.call(this, game, px, py, 16, 32, game.images.brackets);
// 	this.max_frame = 2;
// }
// BracketsDisplay.prototype = Object.create(ScreenEntity.prototype);
// BracketsDisplay.prototype.draw_self = function (ctx) {
// 	if (this.image) {
// 		var x = this.sub_entities.length + 1;
// 		ctx.drawImage(this.image,
// 			0 * (this.image.width / this.max_frame), 0, this.image.width / this.max_frame, this.image.height,
// 			0 - this.width / 2 - x * this.width, 0 - this.height / 2, this.width, this.height);
// 		ctx.drawImage(this.image,
// 			1 * (this.image.width / this.max_frame), 0, this.image.width / this.max_frame, this.image.height,
// 			0 - this.width / 2 + x * this.width, 0 - this.height / 2, this.width, this.height);
// 	}
// };
// BracketsDisplay.prototype.update = function (game) {
// 	ScreenEntity.prototype.update.call(this, game);

// 	this.timer += game.deltatime;
// 	this.radius = lerp(this.radius, this.radius_target, game.deltatime*2);
// };
// BracketsDisplay.prototype.respace_all = function () {
// 	var middle = this.sub_entities.length / 2 - 0.5;
// 	this.sub_entities.forEach((e,i) => {
// 		i -= middle;
// 		e.px = 0 + i * this.width * 2;
// 		e.py = 0;
// 	});
// };



// function DraggableTemplate(px, py, width, height, image, max_frame) {
// 	ScreenEntity.call(this, game, px, py, width, height, image);
// 	this.max_frame = max_frame;
// }
// DraggableTemplate.prototype = Object.create(ScreenEntity.prototype);
// DraggableTemplate.prototype.spawn = function () {
// 	var s = new ScreenEntity(game, this.px, this.py, this.width, this.height, this.image);
// 	s.max_frame = this.max_frame;
// 	return s;
// };


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
ParticleService.prototype.redraw_canvas_fade = function(amount) {
	this.redraw_amount += amount;
	if (this.redraw_amount > 0.15) {
		this.redraw_amount -= 0.15;

		var new_buffer_canvas = document.createElement('canvas');
		new_buffer_canvas.width = game.canvas.width;
		new_buffer_canvas.height = game.canvas.height;
		var new_buffer_context = new_buffer_canvas.getContext('2d');
		new_buffer_context.fillStyle = 'rgba(1,1,1,0.5)';
		new_buffer_context.fillRect(0, 0, game.canvas.width, game.canvas.height);
		new_buffer_context.globalCompositeOperation = 'source-in';
		new_buffer_context.drawImage(this.buffer_canvas, 0, 0);
		new_buffer_context.globalCompositeOperation = 'source-over';
		this.buffer_canvas = new_buffer_canvas;
	}
};
ParticleService.prototype.draw_particle = function(px, py, amount=1) {
	var i = 0;
	var ctx = this.buffer_canvas.getContext('2d');
	ctx.globalAlpha = amount;
	ctx.fillStyle = '#fff4';
	ctx.fillRect(px - 6, py - 6 - ++i*5, 12,12);


	// ctx.strokeStyle = '#fff';
	// ctx.fillStyle = '#fff';

	// for (var i = 0; i < amount; i++) {
	// 	ctx.beginPath();
	// 	ctx.filter = 'blur(1px)';
	// 	ctx.lineWidth = Math.floor(Math.random() * 3) + 2;
	// 	ctx.moveTo(px, py);
	// 	ctx.lineTo(px + Math.random() * 70 - 35, py + Math.random() * 70 - 35);
	// 	// ctx.bezierCurveTo(from.px + d1.px, from.py + d1.py, to.px + d2.px, to.py + d2.py, to.px, to.py);
	// 	// ctx.bezierCurveTo(from.px + dr1.px, from.py + dr1.py, to.px + dr2.px, to.py + dr2.py, to.px, to.py);
	// 	ctx.stroke();
	// 	ctx.restore();
	// 	// ctx.beginPath();
	// 	// ctx.filter = 'blur(3px)';
	// 	// // ctx.lineWidth = Math.floor(Math.random() * 8) + 4;
	// 	// ctx.arc(px + Math.random()*30-15, py + Math.random()*30-15, Math.floor(Math.random() * 4) + 2, 0, 2 * Math.PI);
	// 	// // ctx.moveTo(px, py);
	// 	// // ctx.lineTo(px + Math.random() * 70 - 35, py + Math.random() * 70 - 35);
	// 	// // ctx.bezierCurveTo(from.px + d1.px, from.py + d1.py, to.px + d2.px, to.py + d2.py, to.px, to.py);
	// 	// // ctx.bezierCurveTo(from.px + dr1.px, from.py + dr1.py, to.px + dr2.px, to.py + dr2.py, to.px, to.py);
	// 	// ctx.fill();
	// 	// ctx.stroke();
	// 	// ctx.restore();
	// }
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
		local_ctx.fillStyle = this.color || '#c74';
		local_ctx.fill();

	}

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


function Button(px, py, sx, sy, callback) {
	ScreenEntity.call(this, game, px, py, sx, sy, game.images.ufo);
	this.callback = callback;
}
Button.prototype = Object.create(ScreenEntity.prototype);
Button.prototype.update = function (game) {
	ScreenEntity.prototype.update.call(this, game);
	if (game.is_mouse_pressed() && this.contains_point(game.mouse_game_position)) {
		this.callback();
	}
};

function TriColorEntity(px, py, sx, sy, image) {
	ScreenEntity.call(this, game, px, py, sx, sy, image);

	this.light_amount = 1;
	this.light_color = '#fff';
	this.backing_color = '#a91337';
	this.shadow_color = '#040b20';

	this.color_timer = Math.random() * Math.PI * 2;

	this.set_image(this.image);
}
TriColorEntity.prototype = Object.create(ScreenEntity.prototype);
TriColorEntity.prototype.update = function (game) {
	ScreenEntity.prototype.update.call(this, game);
	this.color_timer = (this.color_timer + game.deltatime) % (Math.PI * 2);
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

function AnimatedColorEntity(px, py, sx, sy, base_image, moving_image) {
	TriColorEntity.call(this, px, py, sx, sy, base_image);
	this.base_image = this.image;
	this.alt_image = moving_image;

	this.base_image_buffers = this.sub_buffers;
	this.alt_image_buffers = this.create_sub_buffers(this.alt_image);

	this.speed = 250;

	this.leaves_footprints = true;
	this.is_moving = false;
	this.moving_timer = 0;
}
AnimatedColorEntity.prototype = Object.create(TriColorEntity.prototype);
AnimatedColorEntity.prototype.update = function (game) {
	TriColorEntity.prototype.update.call(this, game);

	if (this.vx != 0 || this.vy != 0) {
		if (!this.is_moving) {
			this.is_moving = true;
			this.set_image(this.alt_image);
			this.moving_timer = Math.random();
		}

		this.moving_timer += game.deltatime;
	} else {
		this.is_moving = false;
	}

	var d = dist(this, { px: game.canvas.width / 2, py: game.canvas.height / 2});
	var f = game.canvas.width / 2 - d;
	this.light_amount = Math.min(1, Math.max(0.025, (300 - d) / 300));

	if (this.is_moving) {
		if (this.moving_timer >= 0.25) {
			if (this.image === this.base_image) {
				this.image = this.alt_image;
				this.sub_buffers = this.alt_image_buffers;
				if (this.leaves_footprints)
					game.services.particle_service.draw_particle(this.px + this.width / 2, this.py + 2, this.light_amount);
			} else {
				this.image = this.base_image;
				this.sub_buffers = this.base_image_buffers;
				if (this.leaves_footprints)
					game.services.particle_service.draw_particle(this.px - this.width / 2, this.py - 2, this.light_amount);
			}
			this.moving_timer = 0;

		}
	} else {
		this.moving_timer = 0;

		if (this.image !== this.base_image) {
			this.set_image(this.base_image);
		}
	}
};

function Player(px, py) {
	AnimatedColorEntity.call(this, px, py, 32, 32,
			game.images.monochrome_tilemap_packed.subimg(4,0),
			game.images.monochrome_tilemap_packed.subimg(5,0));
}
Player.prototype = Object.create(AnimatedColorEntity.prototype);
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

	AnimatedColorEntity.prototype.update.call(this, game);
};




function main () {
	var canvas = document.querySelector('#game_canvas');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	nlo.load.load_all_assets({
		images: {
			ufo: 'assets/img/ufo.png',
			monochrome_tilemap_packed: 'assets/img/monochrome_tilemap_packed.png',
		},
	}, loaded_assets => {
		game = new GameSystem(canvas, loaded_assets);
		game.background_color = '#17181d';

		slice_tilesheet(game.images.monochrome_tilemap_packed, 8,8);

		// initialize all systems
		game.services.particle_service = new ParticleService();

		// game.add_entity(new TargetCircle(100, 100));
		game.add_entity(new Button(200,200, 100, 50, () => {
			game.add_entity(new BubbleTransition());
		}));

		for (var i = 0; i < 40; i++) {
			game.add_entity(new Player(100 + Math.random() * 1000,100 + Math.random() * 1000));
		}
		// game.add_entity(brackets = new BracketsDisplay(canvas.width / 2, canvas.height - 100));

		// var s = new ScreenEntity(game, 0,0,32,32, game.images.enemy);
		// s.max_frame = 4;
		// brackets.add_entity(s);
		// brackets.respace_all();

		// game.services.turret_service.add_turret(100, 300);
		// game.services.turret_service.add_turret(300, 450);
		// game.add_entity(new TargetCircle(100, 400));
		// game.add_entity(new GoalCircle(300, 600));


		game.run_game(ctx, 60);
	});
}

window.addEventListener('load', main);
