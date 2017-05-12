const mod = new Creep.Behaviour('remoteMiner');
module.exports = mod;
const super_run = mod.run;
mod.run = function(creep) {
    if (!Creep.action.avoiding.run(creep)) {
        // TODO: Once miner behaviour is refactored to use actions, this can be replaced by super_run.call(this, creep);
        // Assign next Action
        if (this.invalidAction(creep)) {
            if (creep.data.destiny && creep.data.destiny.task && Task[creep.data.destiny.task] && Task[creep.data.destiny.task].nextAction) {
                Task[creep.data.destiny.task].nextAction(creep);
            }
            else {
                this.nextAction(creep);
            }
        }
        // Do some work
        if (creep.action && creep.target) {
            creep.action.step(creep);
        }
    }
};
mod.nextAction = function(creep) {
    const flag = creep.data.destiny && Game.flags[creep.data.destiny.targetName];
    if (!flag && (!creep.action || creep.action.name !== 'recycling')) {
        return this.assignAction(creep, 'recycling');
    } else if ( creep.room.name === creep.data.destiny.room || creep.data.determinatedTarget) {
        // if we're there (or have been), be a miner.
        // FIXME: This doesn't assign an action, and it should
        return this.mine(creep);
    } else {
        // else go there
        return this.gotoTargetRoom(creep);
    }
};
mod.mine = function(creep) {
    return Creep.behaviour.miner.run.call(this, creep, {remote:true, approach:this.approach});
};
mod.approach = function(creep) {
    let targetPos = new RoomPosition(creep.data.determinatedSpot.x, creep.data.determinatedSpot.y, creep.data.destiny.room);
    let range = creep.pos.getRangeTo(targetPos);
    if( range > 0 ) {
        const targetRange = targetPos.lookFor(LOOK_CREEPS).length ? 1 : 0;
        creep.travelTo(targetPos, {range:targetRange});
        if (range <= 2 && !creep.data.predictedRenewal) {
            creep.data.predictedRenewal = _.min([500, 1500 - creep.ticksToLive + creep.data.spawningTime]);
        }
    }
    return range;
};
mod.gotoTargetRoom = function(creep) {
    const targetFlag = creep.data.destiny ? Game.flags[creep.data.destiny.targetName] : null;
    if (targetFlag) return Creep.action.travelling.assignRoom(creep, targetFlag.pos.roomName);
};
