class Queue {
    constructor() {
        this.items = [];
    }

    // adding element to the queue
    enqueue(element) {
        this.items.push(element);
    }

    // removing element from the queue
    dequeue() {
        if (this.isEmpty())
            return "is empty";

        return this.items.shift();
    }

    recall() {
        if (this.isEmpty())
            return "is empty";

        let recollection = []
        let index = 0

        while (index < this.items.length) {
            recollection.push(this.items[index]);
            index++;
        }

        return recollection
    }

    // return true if the queue is empty.
    isEmpty() {
        return this.items.length == 0;
    }

    printQueue() {
        let str = "";
        for (let i = 0; i < this.items.length; i++)
            str += this.items[i].name + " - " + this.items[i].msg + " ";
        return str;
    }
}

module.exports = Queue;