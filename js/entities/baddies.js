/* Create a Chipmunk collision handler for BaddieEntities. */
game.installBaddieHandler = function installBaddieHandler() {
    if (!game.baddiesHandlerInstalled) {
        game.baddiesHandlerInstalled = true;

        var space = cm.getSpace();

        /* Baddie<->Player collisions */
        space.addCollisionHandler(
            c.COLLIDE_PLAYER,
            c.COLLIDE_BADDIE,
            null,
            null,
            function baddiePlayerCollision(arbiter, space) {
                var impulse = arbiter.totalImpulse();
                arbiter.a.body.applyImpulse(cp.v.mult(impulse, 10), cp.vzero);
                me.game.getEntityByGUID(arbiter.a.data.GUID).hit(arbiter.b.data.power);
            }
        );

        /* Baddie<->Goodie collisions */
        space.addCollisionHandler(
            c.COLLIDE_GOODIE,
            c.COLLIDE_BADDIE,
            null,
            null,
            function baddieGoodieCollision(arbiter, space) {
                var impulse = arbiter.totalImpulse();
                arbiter.a.body.applyImpulse(cp.v.mult(impulse, 10), cp.vzero);
                me.game.getEntityByGUID(arbiter.a.data.GUID).hit(arbiter.b.data.power);
            }
        );
    }
};


game.BaddieEntities = {
    /* Snake */
    "Snake" : game.NPC.extend({
        "init" : function init(x, y, settings) {
            // Snakes are weak.
            this.power = 0.5;
            this.hearts = 1;

            this.parent(x, y, settings);

            this.makeAngry(true);

            // Adjust collision bounding box.
            this.adjustBoxShape(0, 0, 22, 22);
        }
    })
};