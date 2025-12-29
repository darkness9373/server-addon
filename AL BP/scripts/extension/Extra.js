import { PlayerDatabase } from "./Database";
import { Player } from "@minecraft/server";
import Score from "./Score";

class Extra {
    /**
     * 
     * @param {number} value 
     */
    metricNumber(value) {
        const types = ['', 'k', 'M', 'B', 'T', 'Quad', 'Quin', 'Sext', 'Sept', 'Oct', 'Non', 'Dec']
        const selectType = (Math.log10(value) / 3) | 0;
        if (selectType == 0) return value;
        let scaled = value / Math.pow(10, selectType * 3)
        return scaled.toFixed(1) + types[selectType]
    }
}

export default new Extra();