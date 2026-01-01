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
    /**
     * 
     * @param {string} id 
     */
    formatName(id) {
        const exeptions = ['of', 'the', 'and', 'or', 'to']

        return id
            .split(':').pop()
            .replace(/_/g, " ")
            .split(' ')
            .map((word, index) => {
                if (index !== 0 && exeptions.includes(word)) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1)
            })
            .join(' ')
    }
}

export default new Extra();