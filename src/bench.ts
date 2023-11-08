export class Bench {
    ts: number;

    constructor() {
        this.ts = 0;
        this.reset();
    }

    reset(): void {
        this.ts = Bench.now();
    }

    elapsed(): number {
        return Bench.now() - this.ts;
    }

    static now(): number {
        const ts = process.hrtime();
        return ts[0] * 1e3 + ts[1] / 1e6;
    }
}
