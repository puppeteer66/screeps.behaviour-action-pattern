// base class for behaviours
const Behaviour = function(name) {
    this.name = name;
    this.actions = (creep) => []; // priority list of non resource based actions
    this.inflowActions = (creep) => []; // priority list of actions for getting resources
    this.outflowActions = (creep) => []; // priority list of actions for using resources
    this.assignAction = function(creep, action, target, debouncePriority) {
        if (typeof action === 'string') action = Creep.action[action];
        const valid = action.isValidAction(creep);
        if (global.DEBUG && global.TRACE) trace('Action', {actionName:action.name, behaviourName:this.name, creepName:creep.name, valid, Action:'isValidAction'});
        if (!valid) return false;

        const addable = action.isAddableAction(creep);
        if (global.DEBUG && global.TRACE) trace('Action', {actionName:action.name, behaviourName:this.name, creepName:creep.name, addable, Action:'isAddableAction'});
        if (!addable) return false;

        const assigned = action.assignDebounce ? action.assignDebounce(creep, debouncePriority, target) : action.assign(creep, target);
        if (assigned) {
            if (global.DEBUG && global.TRACE) trace('Behaviour', {actionName:action.name, behaviourName:this.name, creepName:creep.name, assigned, Behaviour:'nextAction', Action:'assign'});
            creep.data.lastAction = action.name;
            creep.data.lastTarget = creep.target.id;
            return true;
        } else if (global.DEBUG && global.TRACE) {
            trace('Action', {actionName:action.name, behaviourName:this.name, creepName:creep.name, assigned, Behaviour:'assignAction', Action:'assign'});
        }
        return false;
    };
    this.selectInflowAction = function(creep) {
        const actionChecked = {};
        for (const action of this.inflowActions(creep)) {
            if (!actionChecked[action.name]) {
                actionChecked[action.name] = true;
                if (this.assignAction(creep, action, null, this.outflowActions(creep))) return;
            }
        }
        return Creep.action.idle.assign(creep);
    };
    this.selectAction = function(creep, actions) {
        const actionChecked = {};
        for (const action of actions) {
            if (!actionChecked[action.name]) {
                actionChecked[action.name] = true;
                if (this.assignAction(creep, action)) return;
            }
        }
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
            return this.selectAction(creep, this.outflowActions(creep));
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