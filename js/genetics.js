
var GenePool = function () {
    this.__constuctor.apply(this, arguments);
};

GenePool.prototype.numGenes = 100;
GenePool.prototype.genes = [];
GenePool.prototype.size = 30;
GenePool.prototype.length = 0;

GenePool.prototype.getGene = function (i) {
    if (i >= 0 && i < this.genes.length)
        return this.genes[i];
    return null;
};

GenePool.prototype.getGenes = function () {
    return this.genes;
};

GenePool.prototype.__constuctor = function (size, numGenes) {
    this.numGenes = numGenes;
    this.size = size;
    for (var i = 0; i < this.size; i++) {
        this.genes[i] = initializeGenome(this.numGenes);
    }
    this.length = this.size;
};

GenePool.prototype.evolve = function (fitness) {
    var totalFitness = 0;
    var bestIndex = 0;

    //noinspection JSDuplicatedDeclaration
    for (var i = 0; i < fitness.length; i++) {
        if (fitness[i] >= fitness[bestIndex])
            bestIndex = i;
        totalFitness += fitness[i];
    }

    if (totalFitness == 0)
    {
        console.log("No valid genome, generate all new");
        for (var i = 0; i < this.size; i++) {
            this.genes[i] = initializeGenome(this.numGenes);
        }
        return;
    }

    console.log("Total Fitness", totalFitness);

    console.log(fitness);

    var newGenePool = new Array();

    newGenePool.push(this.genes[bestIndex].slice());
    for (var i = 0; i < 5; i++)
        newGenePool.push(initializeGenome(this.numGenes));

    for (var i = 6; i < this.size; i++) {
        var geneIndex = rouletteSelect(fitness, totalFitness);
        console.log("For id", i, "based on", geneIndex);
        var gene = this.genes[geneIndex].slice();
        printGene(gene, geneIndex);
        var mutated = mutate(gene);
        printGene(mutated, i);
        newGenePool.push(mutated);
    }

    this.genes = newGenePool;

};

GenePool.prototype.printGenes = function () {
    for (var i = 0; i < this.size; i++) {
        printGene(this.genes[i], i);
    }
};

var printGene = function (gene, id) {
    var i = 0;
    var str = "";
    while (i < gene.length) {
        var g = 0
        g = gene[i] * 1;
        if (++i < gene.length)
            g += gene[i] * 2;
        if (++i < gene.length)
            g += gene[i] * 4;
        str += g.toString();
    }
    console.log(id, str);
};

var rouletteSelect = function (fitness, totalFitness) {
    var rand = Math.random() * totalFitness;
    for (var i = 0; i < fitness.length - 1; i++)
    {
        rand -= fitness[i];
        if (rand <= 0)
            return i;
    }
    return i;
};

var mutate = function (gene) {
    for (var i = 0; i < gene.length; i++) {
        if (Math.random() < 0.05) {
            gene[i] = !gene[i];
        }
    }
    return gene;
};

function initializeGenome(genes)
{
    var genome = [];
    for (var i = 0; i < genes; i++) {
        genome.push(Math.random() > 0.5);
    }
    return genome;
}