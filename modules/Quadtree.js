
export { Quadtree as default }

//Used for easily reading data retrieved by readNode()
class Node {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

class Quadtree {
  constructor(depth, nullVal) {
    this.depth = depth;
    this.tree = []
    for (let i = 0; i < depth; i++) { this.tree[i] = [] }
    this.Assign(1, 0, nullVal);
    this.nullVal = nullVal;
  }

  //Key Manipulation
  getLayer(externalKey) {
    //Decodes layer from an externalKey
    let strKey = externalKey.toString(2)
    if (strKey.length % 2 == 1) { return (strKey.length - 1) / 2 }
    else { throw new RangeError('getLayer ' + externalKey) }
  }

  internalKey(externalKey, layer) {
    //Decodes internalKey from an externalKey
    //Layer is inputted instead of getLayer()ed because
    //the relevant scope always already has layer defined
    return externalKey - 2 ** (2 * layer)
  }

  encodeKey(x, y, layer) {
    //Encodes an x value, y value, and layer into an externalKey
    //X and Y are encoded via Z-Order Curve (xyxyxy...)
    //Layer is encoded by using a 1 to preserve leading 0 bits
    if (x < 0 || x > 2 ** layer - 1 || y < 0 || y > 2 ** layer - 1) { throw new RangeError('Encode') }
    let xStr = x.toString(2), yStr = y.toString(2), output = '1';
    while (xStr.length < layer) { xStr = '0' + xStr }
    while (yStr.length < layer) { yStr = '0' + yStr }
    for (let i = 0; i < layer; i++) { output += xStr[i] + yStr[i] }
    return parseInt(output, 2)
  }

  decodeKey(key) {
    //Decodes an externalKey into it's x, y, and layer components
    let layer = this.getLayer(key), x = 0, y = 0;
    for (let i = 0; i < layer; i++) {
      y += (key % 2) * (2 ** i); key >>= 1;
      x += (key % 2) * (2 ** i); key >>= 1;
    }
    return [x, y, layer]
  }

  getKeyProgession(key) {
    //Returns the externalKey of each layer
    //List starts at 1 (Layer 0) and descends until it reaches key (Layer n)
    let layer = this.getLayer(key);
    if (layer > this.depth) { throw new RangeError('Key unreachable; gKP') }
    let progression = [key];
    for (let i = 1; i <= layer; i++) { progression.push(key >>= 2) }
    return progression.reverse()
  }

  sortKeys(keys) {
    //Sorts a list of keys based on their relative position
    //on the ZOC of the deepest key provided
    let maxLayer = this.getLayer(Math.max(...keys));
    let balancedMap = new Map(), balancedKeys = [], result = [];
    keys.forEach((key) => {
      let layer = this.getLayer(key), bigKey = key << 2 * (maxLayer - layer);
      balancedMap.set(bigKey, key); balancedKeys.push(bigKey);
    })
    balancedKeys.sort((a, b) => a - b)
    balancedKeys.forEach((key) => { result.push(balancedMap.get(key)) });
    return result
  }

  //Tree Reading
  readNode(key) {
    let layer = this.getLayer(key)
    let node = this.tree[layer][this.internalKey(key, layer)]
    if (node == undefined) { return undefined }
    let data = node >> 1; let type = node % 2;
    return new Node(type, data)
  }

  getSide(key, xOff, yOff) {
    //Gets all keys sharing a face with key on the offset x[1 or -1] and y[1 or -1]
    let coords = this.decodeKey(key); let keyList = []; let foundKeys = [];
    //If requested area lies beyond quadtree's boundaries, terminate
    try { keyList.push(this.encodeKey(coords[0] + xOff, coords[1] + yOff, coords[2])) } catch (error) { return }
    //Determines the modifiers adjacent keys require
    let kidMods = new Set([0, 1, 2, 3]);
    if (xOff < 0) { kidMods.delete(0); kidMods.delete(1); }
    else if (xOff > 0) { kidMods.delete(2); kidMods.delete(3); }
    if (yOff < 0) { kidMods.delete(0); kidMods.delete(2); }
    else if (yOff > 0) { kidMods.delete(1); kidMods.delete(3); }
    //While some relevant nodes haven't been searched
    while (keyList.length != 0) {
      let currentKey = keyList.pop()
      let node = this.readNode(currentKey);
      if (node == undefined) { keyList.push(currentKey >>= 2) }
      else if (node.type == 0) { foundKeys.push(currentKey) }
      else if (node.type == 1) {
        //Add new keys to be searched
        let newKey = currentKey << 2;
        kidMods.forEach((mod) => { keyList.push(newKey + mod) })
      }
    }
    return this.sortKeys(foundKeys)
  }

  getKids(key, first) {
    //Recursively catalogues all children nodes of key
    //Maybe flip so kids[0] is type 1 && kids[1] is type 0?
    if (first == undefined) { this.kids = [[], []] }
    let node = this.readNode(key);
    if (node.type == 0) { this.kids[0].push(key) }
    else if (node.type == 1) {
      this.kids[1].push(key);
      let newKey = key << 2;
      for (let i = 0; i < 4; i++) { this.getKids(newKey + i, false) }
    }
    //Ensure we only return on the first call
    if (first == undefined) {
      let kidList = this.kids;
      delete this.kids;
      return kidList
    }
  }

  encodeSaveData(key, data) {
    //Converts key to maximum depth (Not actually required anymore?)
    //Adds largeKey hexadecimal string to data hexadecimal string
    let keyLayer = this.getLayer(key), largeStr = '1';
    if (keyLayer < this.depth) {
      for (let i = keyLayer; i < this.depth; i++) { largeStr += '00' }
    }
    let largeKey = parseInt(largeStr + key.toString(2), 2);
    return largeKey.toString(16) + data.toString(16) + ' ';
  }

  LODSave() {
    //Saves each node who's value/LODVal differs from the value/LODVal of it's parent
    let result = '', allNodes = this.getKids(1), nodes = [...allNodes[1], ...allNodes[0]];
    let start = nodes.shift(); result += this.encodeSaveData(start, this.readNode(start).data);
    nodes.forEach((key) => {
      let node = this.readNode(key);
      if (node.data != this.readNode(key >> 2).data) { result += this.encodeSaveData(key, node.data); }
    })
    return result
  }

  //Tree Manipulation
  encodeData(type, data) {
    //Internally stores data&type together
    return (data << 1) + type;
  }

  setNode(externalKey, value) {
    //Sets tree[layer][internalKey] to value
    let layer = this.getLayer(externalKey);
    this.tree[layer][this.internalKey(externalKey, layer)] = value;
  }

  Assign(key, type, data, genLOD) {
    //Calls setNode with proper data encoding
    //Requests LOD regeneration
    this.setNode(key, this.encodeData(type, data));
    if (genLOD != false && key != 1) { this.generateLOD(key >> 2) }
  }

  Replace(key, value, merge) {
    //Calls Assign, deletes all children of key
    //Attempts to merge key
    let node = this.readNode(key);
    if (node.type == 1) {
      let kids = this.getKids(key).flat();
      kids.forEach((kid) => { this.setNode(kid, undefined) })
    }
    this.Assign(key, 0, value, true);
    if (key != 1 && merge) { this.Merge(key >> 2, false) }
  }

  Populate(key, data) {
    //Creates a path in the tree,
    //placing any required parent nodes down to key
    let steps = this.getKeyProgession(key);
    for (let i = 0; i < steps.length - 1; i++) {
      let node = this.readNode(steps[i]);
      if (node.type == 0) { this.Split(steps[i]) }
    }
    this.Replace(key, data, false);
  }

  Split(key) {
    //Turns node at Key into a parent of four identical children nodes
    let node = this.readNode(key);
    if (node.type == 0) {
      if (this.getLayer(key) < this.depth - 1) {
        let newKey = key << 2;
        for (let i = 0; i < 4; i++) { this.Assign(newKey + i, 0, node.data, false) }
        this.Assign(key, 1, node.data, false);
      }
      else { console.log('Cannot Split Lowest Level: ' + key) }
    }
    else { console.log('Cannot Split Branch:' + key) }
  }

  Merge(key, first) {
    //Attempts to merge four children nodes into key
    //Recursively attempts merges so long as one of the four kids
    //Is a type 1 (parent) node
    let node = this.readNode(key);
    if (node.type == 0) { console.log('Cannot merge leaf: ' + key) }
    else if (first == undefined) {
      //Get a list of all children of key if first call, sorted from deepest to shallowest
      let branches = this.getKids(key)[1].sort((a, b) => b - a);
      branches.forEach((branch) => { this.Merge(branch, false) })
    }
    else if (node.type == 1) {
      let kidVals = new Set(), newKey = key << 2, value;
      for (let i = 0; i < 4; i++) {
        let newNode = this.readNode(newKey + i);
        if (newNode.type == 0) {
          value = newNode.data;
          kidVals.add(value);
        }
        else if (newNode.type == 1) { kidVals.add(undefined) }
      }
      if (kidVals.size == 1 && value != undefined) { this.Replace(key, value) }
    }
  }

  Load(data) {
    //Loads data generated by a save function into tree
    let hexaLength = Math.ceil((2 + 2 * this.depth) / 4), divs = data.split(' ');
    if (divs[0].length - 1 > hexaLength) { throw 'Load exceeds depth limit' }
    divs.forEach((info) => {
      if (info.length >= 1) {
        let strKey = info.substring(0, info.length - 1);
        let key = parseInt(parseInt(strKey, 16).toString(2).substring(1), 2)
        let data = parseInt(info[info.length - 1], 16);
        this.Populate(key, data);
      }
    })
  }

  generateLOD(key) {
    //Determines the most common value among the four children of key
    //Sets node at key to that value (while remaining type 1)
    if (key < 1) { console.log('Invalid key' + key); return }
    let node = this.readNode(key);
    if (node == undefined) { throw 'Invalid Key ' + key }
    if (node.type == 0) { console.log('Cannot generateLOD of a leaf: ' + key) }
    else if (node.type == 1) {
      let newKey = key << 2, kidVals = new Set(), lodVal;
      for (let i = 0; i < 4; i++) {
        let kidNode = this.readNode(newKey + i);
        lodVal = kidNode.data;
        if (kidVals.has(kidNode.data)) { break }
        else { kidVals.add(kidNode.data) }
      }
      if (node.data != lodVal && key != 1) { this.Assign(key, node.type, lodVal, true) }
    }
  }

}
