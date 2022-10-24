/**
 * 收集所有依赖，以树的结构形式存储
 */
const pkgjson = require('./package.json');
const lockJons = require('./package-lock.json');
const fs = require('fs');

/***
 * 重要的是如何消除循环引用的关系
 */
let had = {};

/**
 * { 
 *   text: '',
 *   children: []
 * }
 */
let treeData = [];

function walkPkgDependencies() {
    const desp = pkgjson.dependencies;
    for (const key in desp) {
        let tree = {
            text: key,
        }
        findDesp(key, tree);
        treeData.push(tree);
    }
}

function findDesp(key, tree) {
    const desps = lockJons.dependencies;
    const data = desps[key]

    if (!data || !data.requires || !key) {
        tree.children = [];
        return;
    }

    had[key] = true;

    let list = []
    for (const req in data.requires) {
        let item = {
            text: req
        };

        if (had[req]) {
            continue
        }
        
        findDesp(req, item);

        list.push(item);
    }

    tree.children = list;

    return null;
}

walkPkgDependencies();

// console.log(JSON.stringify(treeData, '', 2));
var printData = JSON.stringify(treeData, '', 2);
fs.writeFileSync('./viewer/tree-data.js', 'window.__package_tree_data =' + printData, {encoding: 'utf-8'})