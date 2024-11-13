export class Bench {
    ts: number;

    constructor() {

        this.ts = 0;
        this.reset();
    }

    reset() {

        this.ts = Bench.now();
    }

    elapsed() {

        return Bench.now() - this.ts;
    }

    static now() {

        const ts = process.hrtime();
        return (ts[0] * 1e3) + (ts[1] / 1e6);
    }
}
