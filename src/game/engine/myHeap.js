export class TileNode {
    constructor(gridIndex, cost, heuristic, path = []) {
        this.gridIndex = gridIndex;
        this.pathCost = cost;
        this.path = path;
        this.heuristic = heuristic;
        this.value = cost + heuristic;
    }
}

/**
 * Based on: https://github.com/google/closure-library/blob/master/closure/goog/structs/heap.js
 */

export class Heap {
    constructor() {
        this.nodes_ = [];
    }

    insert(gridIndex, cost, heuristic, path = []) {
        const nodes = this.nodes_;
        const node = new TileNode(gridIndex, cost, heuristic, [...path, gridIndex])
        nodes.push(node);
        this.bubbleUp_(nodes.length - 1);
    }

    bubbleUp_(index) {
        const nodes = this.nodes_;
        const node = nodes[index];

        while (index > 0) {
            const parentIndex = this.getParentIndex_(index);
            if (nodes[parentIndex].value >= node.value) {
                nodes[index] = nodes[parentIndex];
                index = parentIndex;
            } else {
                break;
            }
        }
        nodes[index] = node;
    }

    remove() {
        const nodes = this.nodes_;
        const count = nodes.length;
        const rootNode = nodes[0];
        if (count <= 0) {
            return undefined;
        } else if (count === 1) {
            nodes.length = 0;
        } else {
            nodes[0] = nodes.pop();
            this.sinkDown_(0);
        }
        return rootNode;
    }

    sinkDown_(index) {
        const nodes = this.nodes_;
        const count = nodes.length;
    
        const node = nodes[index]; 

        // While current node has a child
        while (index < (count >> 1)) {
            const leftChildIndex = this.getLeftChildIndex(index);
            const rightChildIndex = this.getRightChildIndex(index);

            const smallerChildIndex = rightChildIndex < count &&
                nodes[rightChildIndex].value < nodes[leftChildIndex].value ?
                rightChildIndex :
                leftChildIndex;
            
            if (nodes[smallerChildIndex].value > node.value) {
                break;
            }

            // else
            nodes[index] = nodes[smallerChildIndex];
            index = smallerChildIndex;
        }
        nodes[index] = node;
    }
    
    getLeftChildIndex(index) {
        return index * 2 + 1;
    }

    getRightChildIndex(index) {
        return index * 2 + 2;
    }

    getParentIndex_(index) {
        return (index - 1) >> 1;
    }

    getCount() {
        return this.nodes_.length;
    }

    isEmpty() {
        return this.nodes_.length === 0;
    }

    clear() {
        this.nodes_.length = 0;
    }
}