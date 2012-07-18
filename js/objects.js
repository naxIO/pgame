me.game.onLevelLoaded = function () {
    // Display a dialog box
    var dialog = [
        "Hi! Welcome to Parasyte's Liberated Pixel Cup game! (Press Enter to continue...)",
        "I'm Rachel! (Aren't I just adorable?) The dialog is here for demo purposes. It will help me tell the game story...",
        "... when I finish writing it!",
        "Anyway, let's explore the test island together! :D (Sorry there isn't much to do here, yet. I'm working on that.)"
    ];
    var background = me.loader.getImage("dialog");
    var font = new me.Font("acmesa", 20, "#eee");
    //var dialog_box = new DialogObject(30, 480 - background.height - 15, background, dialog, 555, 71, 12, 12, font, "enter");
    //me.game.add(dialog_box);
};

/* Main game */
var PlayScreen = me.ScreenObject.extend({
    onResetEvent: function () {
        // Load the first level.
        me.levelDirector.loadLevel("island");
    }
});

var BlinkingEyes = me.AnimationSheet.extend({
    init : function init(x, y, image, w, h, owner) {
        this.parent(x, y, image, w, h);

        this.owner = owner;
        this.addAnimation("walk_down",  [ 0, 1 ]);
        this.addAnimation("walk_right", [ 2, 3 ]);
        this.addAnimation("walk_left",  [ 4, 5 ]);
        this.addAnimation("walk_up",    [ 6, 7 ]);
        this.setCurrentAnimation("walk_down", this.reset);
        this.animationspeed = 1;
        this.reset();
    },

    reset : function reset() {
        this.animationpause = true;
    },

    update : function update() {
        this.pos.x = this.owner.pos.x + 9;
        this.pos.y = this.owner.pos.y + 18 + (this.owner.current.idx % 2);

        var idx = this.current.idx;
        this.setCurrentAnimation("walk_" + this.owner.dir_name, this.reset);
        this.setAnimationFrame(idx);

        // Awesome random blinking action!
        if (this.animationpause && !Math.floor(Math.random() * 50)) {
            // About 2% of of all frames rendered will cause blinking eyes!
            this.animationpause = false;
        }

        var dirty = this.owner.isDirty;
        this.owner.isDirty = false;
        return this.parent() || dirty;
    }
});

/* Player character */
var PlayerEntity = me.ObjectEntity.extend({
    // Direction facing
    dir : c.DOWN,
    dir_name : "down",

    // Update composed sprites?
    isDirty : false,

    // Standing or walking?
    standing : true,

    // Keys being held: [ "left", "up", "right", "down" ]
    held : [ false, false, false, false ],
    last_held : [ false, false, false, false ],

    // A helper constant
    walk_angle: Math.sin((45).degToRad()),

    init : function init(x, y, settings) {
        // Call the constructor.
        this.parent(x, y, settings);

        // Adjust collision bounding box.
        this.updateColRect(8, 20, 16, 20);

        // Set animations.
        this.addAnimation("walk_down",  [ 0,  1,  2,  3 ]);
        this.addAnimation("walk_right", [ 4,  5,  6,  7 ]);
        this.addAnimation("walk_left",  [ 8,  9,  10, 11 ]);
        this.addAnimation("walk_up",    [ 12, 13, 14, 15 ]);
        this.setCurrentAnimation("walk_down");

        // Animated eyes.
        this.eyes = new BlinkingEyes(x + 9, y + 18, me.loader.getImage("rachel_eyes"), 17, 6, this);
        me.game.add(this.eyes, /*this.z*/ 4); // FIXME: No way to add to scene with proper z-order? :(

        // Set the display to follow our position on both axis.
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },

    update : function update() {
        var self = this;

        // Walking controls.
        self.vel.x = self.vel.y = 0;
        if (!game.modal) {
            // Set the movement speed.
            if (!me.input.keyStatus("shift")) {
                // Run
                this.setVelocity(2.5, 2.5);
                this.animationspeed = 6;
            }
            else {
                // Walk
                this.setVelocity(5, 5);
                this.animationspeed = 3;
            }

            var directions = [ "left", "up", "right", "down" ];
            directions.forEach(function (dir, i) {
                if (me.input.isKeyPressed(dir)) {
                    self.held[i] = true;
                    self.standing = false;

                    if (!self.last_held[i] || (self.dir == c.RESET_DIR)) {
                        self.dir = c[dir.toUpperCase()];
                        self.dir_name = dir;
                        self.setCurrentAnimation("walk_" + dir);
                    }

                    var axis = (i % 2) ? "y" : "x";
                    self.vel[axis] = self.accel[axis] * me.timer.tick;

                    // Walking at a 45-degree angle will slow the axis velocity by
                    // approximately 5/7. But we'll just use sin(45)  ;)
                    if (me.input.isKeyPressed(directions[(i + 1) % 4]) ||
                        me.input.isKeyPressed(directions[(i + 3) % 4])) {
                        self.vel[axis] *= self.walk_angle;
                    }

                    if (i < 2) {
                        self.vel[axis] = -self.vel[axis];
                    }
                }
                else {
                    self.held[i] = false;
                    if (self.last_held[i]) {
                        self.dir = c.RESET_DIR;
                    }
                }

                self.last_held[i] = self.held[i];
            });
        }

        // Move entity and detect collisions.
        self.updateMovement();

        // Update animation if necessary.
        if ((self.vel.x != 0) || (self.vel.y != 0)) {
            // Update object animation.
            self.parent();
            this.isDirty = true;
            return true;
        }
        else if (!self.standing) {
            self.standing = true;
            self.setAnimationFrame(0);
            this.isDirty = true;
            return true;
        }

        return false;
    }
});

/* NPC */
var NPCEntity = me.ObjectEntity.extend({
    init : function init(x, y, settings) {
        this.parent(x, y, settings);

        // FIXME: This sucks! With a low mass, shapes will fly away super fast
        // when colliding. This is because of the retarded-low damping to
        // simulate friction; We need equally retarded-high forces to move
        // objects at a decent speed.
        this.body.setMass(Infinity);
    },

    update : function update() {
        // Move entity and detect collisions.
        this.updateMovement();

        return ((this.vel.x != 0) || (this.vel.y != 0));
    }
});
