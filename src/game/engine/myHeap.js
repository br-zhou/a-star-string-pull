/**
 * Based on: https://github.com/google/closure-library/blob/master/closure/goog/structs/heap.js
 */

export class Heap {
    constructor(sortFunction) {
        this.nodes_ = [];
        // returns true if a has higher priority than b
        this.sortFunction = sortFunction;
    }

    insert(node) {
        if (node === null || node === undefined) return;
        this.nodes_.push(node);
        this.bubbleUp_(this.nodes_.length - 1);
    }

    bubbleUp_(index) {
        const nodes = this.nodes_;
        const node = nodes[index];

        while (index > 0) {
            const parentIndex = this.getParentIndex_(index);
            if (this.sortFunction(node, nodes[parentIndex])) {
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

        // TODO: rewrite using sort function
        // While current node has a child
        while (index < (count >> 1)) {
            const leftChildIndex = this.getLeftChildIndex(index);
            const rightChildIndex = this.getRightChildIndex(index);

            const smallerChildIndex = rightChildIndex < count &&
                this.sortFunction(nodes[rightChildIndex], nodes[leftChildIndex]) ?
                rightChildIndex :
                leftChildIndex;

            // if value of current node > value of smaller child
            if (this.sortFunction(node, nodes[smallerChildIndex])) {
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

    getNodesCopy() {
        return JSON.parse(JSON.stringify(this.nodes_));
    }
}