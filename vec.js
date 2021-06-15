const vec = {
    unit(arr) {
        const n = this.norm(arr);
        const unit = arr.map(
            function(e) {
                return e / n;
            }
        );
        return unit;
    },
    norm(arr) {
        const sqrSum = arr.reduce(
            function(a, c) {
                return Math.pow(c, 2) + a;
            },
            0
        );
        const n = Math.sqrt(sqrSum);
        return n;
    },
    add(a1, a2) {
        let result;
        if (a2 instanceof Array) {
            if (a1.length === a2.length) {
                result = [];
                for (let i = 0; i < a1.length; i++) {
                    result[i] = a1[i] + a2[i];
                }
            } else {
                throw Error("Incompatible vectors");
            }
        } else if (typeof a2 === "number") {
            result = a1.map(
                function(e) {
                    return e + a2;
                }
            );
        }
        return result;
    },
    sub(a1, a2) {
        const a2_ = this.mult(a2, -1);
        const result = this.add(a1, a2_);
        return result;
    },
    mult(arr, c) {
        const result = arr.map(
            function(e) {
                return e * c;
            }
        );
        return result;
    }
};

export default vec;
