
/**
 * makes a deep copy of a nested data structure
 * @param {string[] | object[]} obj - the nested object or array to make a deep copy from
 * @returns {string[] | object[]}   - the deep clone of the passed in object or array
 */
export const deepClone = (obj) => {
    if(typeof obj !== "object" || obj === null) return obj;  // nothing to go deeper into
    const newObject = Array.isArray(obj) ? [] : {};          // create an array or object to hold the values
    for (let key in obj) {
        const value = obj[key];
        newObject[key] = deepClone(value);                   // recursive call for nested objects & arrays
    }
    return newObject;
}


/**
 * scale a number from a given range to another range
 * 
 * @param { number } value  - number to be scaled
 * @param { number } srFrom - source scale from 
 * @param { number } srTo   - source scale to
 * @param { number } trFrom - target scale from 
 * @param { number } trTo   - target scale to
 * @returns { number }      - scaled number
 */
export const scaleNumber = (value, srFrom, srTo, trFrom, trTo) => {
    return (value - srFrom) * (trTo - trFrom) / (srTo - srFrom) + trFrom;
}


/**
 * generate a random number within a given range
 * 
 * @param { number } from   - minimum range
 * @param { number } to     - maximum range
 * @returns { number }      - generated random number
 */
export const generateRandomNumber = (from, to) => {
    return scaleNumber(Math.random(), 0, 1, from, to);
}
