
export { Quadtree as default }

class Node {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}
class Quadtree {
  constructor(depth, nullVal) {
    this.depth = depth;
    this.tree = new Map()
    for (let i = 0; i < depth; i++) { this.tree.set(i, new Map()) }
    this.Assign(1, 0, nullVal)
    this.nullVal = nullVal;
  }

  //Key Manipulation
  getLayer(key) {
    let strKey = key.toString(2)
    if (strKey.length % 2 == 1) {
      return (strKey.length - 1) / 2
    }
    else {
      throw new RangeError('getLayer ' + key)
    }
  }

  setLayer(key, depth) {
    let curLayer = this.getLayer(key);
    let newKey = key;
    if (curLayer < depth) {
      for (let i = curLayer; i < depth; i++) { newKey <<= 2 }
    }
    if (curLayer > depth) {
      for (let i = curLayer; i > depth; i--) { newKey >>= 2 }
    }
    return newKey
  }

  Encode(x, y, layer) {
    if (x < 0 || x > 2 ** layer - 1 || y < 0 || y > 2 ** layer - 1) {
      throw new RangeError('Encode')
    }
    let xStr = x.toString(2), yStr = y.toString(2);
    let xLen = xStr.length, yLen = yStr.length;
    if (xLen != yLen) {
      let strDif = Math.abs(xLen - yLen)
      if (xLen < yLen) {
        for (let i = 0; i < strDif; i++) {
          xStr = '0' + xStr;
        }
      }
      else if (yLen < xLen) {
        for (let i = 0; i < strDif; i++) {
          yStr = '0' + yStr;
        }
      }
    }
    let length = xStr.length;
    if (length < layer) {
      let dif = layer - length;
      for (let i = 0; i < dif; i++) {
        yStr = '0' + yStr; xStr = '0' + xStr;
      }
    }
    let output = '1';
    for (let i = 0; i < layer; i++) {
      output += xStr[i] + yStr[i]
    }
    return parseInt(output, 2)
  }

  Decode(key) {
    let layer = this.getLayer(key);
    let x = 0, y = 0;
    for (let i = 0; i < layer; i++) {
      let yBit = key % 2; key >>= 1;
      let xBit = key % 2; key >>= 1;
      x += xBit * 2 ** i;
      y += yBit * 2 ** i;
    }
    return [x, y, layer]
  }

  getKeyProgession(key) {
    let layer = this.getLayer(key);
    if (layer > this.depth) { throw new RangeError('Key unreachable; gKP') }
    let progression = [key];
    for (let i = 1; i <= layer; i++) {
      progression.push(key >> (2 * i))
    }
    return progression.reverse()
  }

  sortKeys(keys) {
    let maxLayer = this.getLayer(Math.max(...keys));
    let balancedMap = new Map(), balancedKeys = [], result = [];
    keys.forEach((key) => {
      let layer = this.getLayer(key), bigKey = key << 2 * (maxLayer - layer);
      balancedMap.set(bigKey, key)
      balancedKeys.push(bigKey)
    })
    balancedKeys.sort((a, b) => a - b)
    balancedKeys.forEach((key) => { result.push(balancedMap.get(key)) })
    return result
  }

  //Tree Reading
  getNode(key) {
    return this.tree.get(this.getLayer(key)).get(key)
  }

  getSide(key, xOff, yOff) {
    let kidMods = new Set([0, 1, 2, 3]);
    if (xOff < 0) { kidMods.delete(0); kidMods.delete(1); }
    else if (xOff > 0) { kidMods.delete(2); kidMods.delete(3); }
    if (yOff < 0) { kidMods.delete(0); kidMods.delete(2); }
    else if (yOff > 0) { kidMods.delete(1); kidMods.delete(3); }

    let coords = this.Decode(key); let keyList = []; let foundKeys = [];

    try { keyList.push(this.Encode(coords[0] + xOff, coords[1] + yOff, coords[2])) } catch (error) { return }
    while (keyList.length != 0) {
      let currentKey = keyList.pop()
      let node = this.getNode(currentKey);
      if (node == undefined) { keyList.push(currentKey >>= 2) }
      else if (node.type == 0) { foundKeys.push(currentKey) }
      else if (node.type == 1) {
        let newKey = currentKey << 2;
        kidMods.forEach((mod) => {
          keyList.push(newKey + mod)
        })
      }
    }
    return this.sortKeys(foundKeys)
  }

  getKids(key, first) {
    if (first == undefined) { this.kids = [[], []] }
    let node = this.getNode(key);
    if (node.type == 0) {
      this.kids[0].push(key);
    }
    else if (node.type == 1) {
      this.kids[1].push(key);
      let newKey = key << 2
      for (let i = 0; i < 4; i++) {
        this.getKids(newKey + i, false);
      }
    }
    if (first == undefined) {
      let kidList = this.kids;
      delete this.kids;
      return kidList
    }
  }

  encodeData(key, data) {
    let keyLayer = this.getLayer(key), largeStr = '1';
    if (keyLayer < this.depth) {
      for (let i = keyLayer; i < this.depth; i++) { largeStr += '00' }
    }
    let largeKey = parseInt(largeStr + key.toString(2), 2);
    return largeKey.toString(16) + data.toString(16) + ' ';
  }

  nonNullValSave() {
    let result = '', nodes = this.getKids(1);
    nodes[0].forEach((key) => {
      let node = this.getNode(key);
      if (node.data != this.nullVal) { result += this.encodeData(key, node.data);}
    })
    return result
  }

  LODSave() {
    let result = '', allNodes = this.getKids(1), nodes = [...allNodes[1], ...allNodes[0]];
    let start = nodes.shift(); result += this.encodeData(start, this.getNode(start).data);
    nodes.forEach((key) => {
      let node = this.getNode(key);
      if (node.data != this.getNode(key >> 2).data) { result += this.encodeData(key, node.data); }
    })
    return result
  }

  bestSave() {
    let nNVS = this.nonNullValSave();
    let LODS = this.LODSave();
    if (LODS.length <= nNVS.length) { return LODS}
    else { return nNVS }
  }
  
  //Tree Manipulation
  Assign(key, type, data, genLOD) {
    let layer = this.getLayer(key), node = new Node(type, data);
    this.tree.get(layer).set(key, node);
    if (genLOD != false && key != 1) {
      this.generateLOD(key >> 2);
    }
  }

  Replace(key, value, merge) {
    let node = this.getNode(key);
    if (node.type == 1) {
      let kids = this.getKids(key).flat();
      kids.forEach((kid) => {
        let kidLayer = this.getLayer(kid);
        this.tree.get(kidLayer).delete(kid);
      })
    }
    this.Assign(key, 0, value);
    if (key != 1 && merge) { this.Merge(key >> 2, false) }
  }

  Populate(key, data) {
    let steps = this.getKeyProgession(key);
    for (let i = 0; i < steps.length; i++) {
      let node = this.getNode(steps[i]);
      if (key == steps[i]) {
        if (node.type == 1) { this.Replace(key, this.nullVal) }
        this.Assign(key, 0, data);
      }
      else if (node.type == 0) {
        this.Split(steps[i]);
      }
    }
  }

  Split(key) {
    let layer = this.getLayer(key), node = this.getNode(key);
    if (node.type == 0) {
      if (layer < this.depth - 1) {
        let newKey = key << 2;
        for (let i = 0; i < 4; i++) {
          this.Assign(newKey + i, 0, node.data, false);
        }
        node.type = 1;
      }
      else { console.log('Cannot Split Lowest Level: ' + key) }
    }
    else { console.log('Cannot Split Branch:' + key) }
  }

  Merge(key, first) {
    let node = this.getNode(key);
    if (node.type == 0) { console.log('Cannot merge leaf: ' + key) }
    else if (node.type == 1 && first == undefined) {
      let branches = this.getKids(key)[1].sort((a, b) => b - a);
      branches.forEach((branch) => {
        this.Merge(branch, false);
      })
    }
    else if (node.type == 1) {
      let kidVals = new Set(), newKey = key << 2, value;
      for (let i = 0; i < 4; i++) {
        let newNode = this.getNode(newKey + i);
        if (newNode.type == 0) {
          value = newNode.data;
          kidVals.add(value);
        }
        else if (newNode.type == 1) {
          kidVals.add(undefined)
        }
      }
      if (kidVals.size == 1 && value != undefined) {
        this.Replace(key, value)
      }
    }
  }

  Load(data) {
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
    let node = this.getNode(key);
    if (node == undefined) { throw 'Invalid Key ' + key }
    if (node.type == 0) { console.log('Cannot generateLOD of a leaf: ' + key) }
    else if (node.type == 1) {
      let newKey = key << 2, kidVals = new Set(), lodVal;
      for (let i = 0; i < 4; i++) {
        let kidNode = this.getNode(newKey + i);
        lodVal = kidNode.data;
        if (kidVals.has(kidNode.data)) {
          break;
        }
        else { kidVals.add(kidNode.data) }
      }
      if (node.data != lodVal && key != 1) {
        node.data = lodVal;
        this.generateLOD(key >> 2)
      }
    }
  }

}
