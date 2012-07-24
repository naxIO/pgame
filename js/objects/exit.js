/* Create a Chipmunk collision handler for ExitEntity. */
game.installExitHandler = function installExitHandler() {
    /* Player<->ExitEntity collisions */
    cm.getSpace().addCollisionHandler(
        c.COLLIDE_PLAYER,
        c.COLLIDE_EXIT,
        function exit_level(arbiter, space) {
            space.addPostStepCallback(function () {
                game.state.loadLevel(arbiter.b.data);
            });

            // Return false so collision does not assert a force.
            return false;
        }
    );
}

/* Exits link maps together. */
game.Exit = me.InvisibleEntity.extend({
    init : function init(x, y, settings) {
        this.parent(x, y, settings);

        // Create and configure a static shape.
        var shape = cm.staticBox(x, y, settings.width, settings.height);
        shape.setLayers(c.LAYER_SPRITE);
        shape.collision_type = c.COLLIDE_EXIT;
        shape.data = settings;
    }
});
