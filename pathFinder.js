const mod = class {

    extend() {
    
        if (!PathFinder.CostMatrix.prototype._serialize) {
            PathFinder.CostMatrix.prototype._serialize = PathFinder.CostMatrix.prototype.serialize;
            
            PathFinder.CostMatrix.prototype.serialize = function() {
                const serialize = arr => arr
                    .reduce((m, e, i) => {
                        if (e !== arr[i - 1]) {
                            m.push({count: 1, e});
                        } else {
                            m[m.length - 1].count++;
                        }
                        return m;
                    }, [])
                    .map(({count, e}) => count > 1 ? `${e}x${count}` : e)
                    .join(',');
                return serialize(this._serialize());
            };
        }
        
        if (!PathFinder.CostMatrix._deserialize) {
            PathFinder.CostMatrix._deserialize = PathFinder.CostMatrix.deserialize;
            
            PathFinder.CostMatrix.deserialize = function(data) {
                const parse = serialized => {
                    serialized = Array.isArray(serialized) ? serialized.toString() : serialized; // support for old cached values
                    const arr = serialized.replace(/(\d+)x(\d+),?/g, (z, p1, p2) => _.repeat(p1 + ',', +p2)).split(',');
                    arr.pop();
                    return arr.map(s => +s);
                };
                
                return PathFinder.CostMatrix._deserialize(parse(data));
            };
        }
    
    }

};
module.exports = new mod;
