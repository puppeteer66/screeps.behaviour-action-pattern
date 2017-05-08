// base class for behaviours
const Behaviour = function(name) {
    this.name = name;
    this.actions = (creep) => []; // priority list of non resource based actions
    this.inflowActions = (creep) => []; // priority list of actions for getting resources
    this.outflowActions = (creep) => []; // priority list of actions for using resources
    this.assignAction = function(creep, action, target, debouncePriority) {
        const p = Util.startProfiling(creep.name + '.assignAction' + ':' + action.name || action, {enabled: PROFILING.BEHAVIOUR});
        if (typeof action === 'string') action = Creep.action[action];
        const valid = action.isValidAction(creep);
        if (global.DEBUG && global.TRACE) trace('Action', {actionName:action.name, behaviourName:this.name, creepName:creep.name, valid, Action:'isValidAction'});
        if (!valid) {
            p.checkCPU('!valid', 0.5);
            return false;
        }

        const addable = action.isAddableAction(creep);
        if (global.DEBUG && global.TRACE) trace('Action', {actionName:action.name, behaviourName:this.name, creepName:creep.name, addable, Action:'isAddableAction'});
        if (!addable){
            p.checkCPU('!addable', 0.5);
            return false;
        }

        const assigned = action.assignDebounce ? action.assignDebounce(creep, debouncePriority, target) : action.assign(creep, target);
        if (assigned) {
            if (global.DEBUG && global.TRACE) trace('Behaviour', {actionName:action.name, behaviourName:this.name, creepName:creep.name, assigned, Behaviour:'nextAction', Action:'assign'});
            creep.data.lastAction = action.name;
            creep.data.lastTarget = creep.target.id;
            p.checkCPU('assigned', 0.5);
            return true;
        } else if (global.DEBUG && global.TRACE) {
            trace('Action', {actionName:action.name, behaviourName:this.name, creepName:creep.name, assigned, Behaviour:'assignAction', Action:'assign'});
        }
        p.checkCPU('!assigned', 0.5);
        return false;
    };
    this.selectInflowAction = function(creep) {
        const p = Util.startProfiling('selectInflowAction' + creep.name, {enabled: PROFILING.BEHAVIOUR});
        const actionChecked = {};
        for (const action of this.inflowActions(creep)) {
            if (!actionChecked[action.name]) {
                actionChecked[action.name] = true;
                if (this.assignAction(creep, action, undefined, this.outflowActions(creep))) {
                    p.checkCPU('assigned' + action.name, 1);
                    return;
                }
            }
        }
        p.checkCPU('!assigned', 1);
        return Creep.action.idle.assign(creep);
    };
    this.selectAction = function(creep, actions) {
        const p = Util.startProfiling('selectAction' + creep.name, {enabled: PROFILING.BEHAVIOUR});
        const actionChecked = {};
        for (const action of actions) {
            if (!actionChecked[action.name]) {
                actionChecked[action.name] = true;
                if (this.assignAction(creep, action)) {
                    p.checkCPU('assigned' + action.name, 1);
                    return;
                }
            }
        }
        p.checkCPU('!assigned', 1);
        return Creep.action.idle.assign(creep);
    };
    this.nextAction = function(creep) {
        return this.selectAction(creep, this.actions(creep));
    };
    this.needEnergy = creep => creep.sum < creep.carryCapacity / 2;
    this.nextEnergyAction = function(creep) {
        if (this.needEnergy(creep)) {
            return this.selectInflowAction(creep);
        } else {
            if (creep.data.nextAction && creep.data.nextTarget) {
                const action = Creep.action[creep.data.nextAction];
                const target = Game.getObjectById(creep.data.nextTarget);
                delete creep.data.nextAction;
                delete creep.data.nextTarget;
                if (this.assignAction(creep, action, target)) {
                    return true;
                }
            } else {
                return this.selectAction(creep, this.outflowActions(creep));
            }
        }
    };
    this.invalidAction = function(creep) {
        return !creep.action || creep.action.name === 'idle';
    };
    this.run = function(creep) {
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
        } else {
            logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
        }
    };
    this.strategies = {
        defaultStrategy: {
            name: `default-${this.name}`,
        }
    };
    this.selectStrategies = function(actionName) {
        return [this.strategies.defaultStrategy, this.strategies[actionName]];
    };
};
module.exports = Behaviour;