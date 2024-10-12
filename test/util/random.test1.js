const Bcrypt = require('bcrypt');
const Random = require('../../common/random/random');


describe('Random.password function', () => {
    it('should return a "string" of length 10', () => {
        const generatedPassword = Random.password();
        expect(typeof generatedPassword).toEqual('string');
        expect(generatedPassword).toHaveLength(10);
    });
});

describe('Random.hashedPassword function', () => {
    const result = Random.hashedPassword();

    it('should return an object with "password" and "hashed" properties', () => {
        expect(result).toHaveProperty('password');
        expect(result).toHaveProperty('hashed');
    });
    it('"hashed" should decrypt to "password" using same algorithm', () => {
        expect(Bcrypt.compareSync(result.password, result.hashed)).toBe(true);
    });
});

describe('Random.string function', () => {
    var givenLength = 24;
    it('should return a "string" of given length(' + givenLength + ')', () => {
        const str = Random.string(givenLength);
        expect(typeof str).toEqual('string');
        expect(str).toHaveLength(givenLength);
    });
    givenLength = 10;
    it('should return a "string" of given length(' + givenLength + ')', () => {
        const str = Random.string(givenLength);
        expect(typeof str).toEqual('string');
        expect(str).toHaveLength(givenLength);
    });
    givenLength = 0;
    it('should return a "string" of given length(' + givenLength + ')', () => {
        const str = Random.string(givenLength);
        expect(typeof str).toEqual('string');
        expect(str).toHaveLength(givenLength);
    });
    it('should throw exception when length is not passed', () => {
        try {
            Random.string();
        } catch (e) {
            expect(e.message).toBe('An error occured while generating random alphanumerics');
            expect(e.code).toBe(409);

        }
    });

});

describe('Random.numeric function', () => {
    it('should return a "number" of given length(16) and less than max int 0xFFFFFFFF', () => {
        const ret = Random.numeric(16);
        expect(typeof ret).toEqual('number');
        expect(ret).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(ret.toString().length).toBe(16);
    });
    it('should return a "number" of given length(10) and less than max int 0xFFFFFFFF', () => {
        const ret = Random.numeric(10);
        expect(typeof ret).toEqual('number');
        expect(ret).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(ret.toString().length).toBe(10);
    });
    it('should return a "number" of given length(8) and less than max int 0xFFFFFFFF', () => {
        const ret = Random.numeric(8);
        expect(typeof ret).toEqual('number');
        expect(ret).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(ret.toString().length).toBe(8);
    });
    it('should return a "number" of given length(5) and less than max int 0xFFFFFFFF', () => {
        const ret = Random.numeric(5);
        expect(typeof ret).toEqual('number');
        expect(ret).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(ret.toString().length).toBe(5);
    });
    it('should return a "number" of given length(4) and less than max int 0xFFFFFFFF', () => {
        const ret = Random.numeric(4);
        expect(typeof ret).toEqual('number');
        expect(ret).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(ret.toString().length).toBe(4);
    });
    it('should return a "number" of given length(3) and less than max int 0xFFFFFFFF', () => {
        const ret = Random.numeric(3);
        expect(typeof ret).toEqual('number');
        expect(ret).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(ret.toString().length).toBe(3);
    });
    it('should return a "number" of given length(2) and less than max int 0xFFFFFFFF', () => {
        const ret = Random.numeric(2);
        expect(typeof ret).toEqual('number');
        expect(ret).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(ret.toString().length).toBe(2);
    });
    it('should return a "number" of given length(1) and less than max int 0xFFFFFFFF', () => {
        const ret = Random.numeric(1);
        expect(typeof ret).toEqual('number');
        expect(ret).toBeLessThanOrEqual(0xFFFFFFFF);
        expect(ret.toString().length).toBe(1);
    });
    it('should throw exception when length(0) is passed', () => {
        try {
            Random.numeric(0);
        } catch(e) {
            expect(e.message).toBe('An error occured while generating random numerics');
            expect(e.code).toBe(409);

        }
    });
    it('should throw exception when length is not passed', () => {
        try {
            Random.numeric();
        } catch (e) {
            expect(e.message).toBe('An error occured while generating random numerics');
            expect(e.code).toBe(409);
        }
    });
});

function allLetters(inputTxt) {
    var letters = /^[A-Za-z]+$/;
    if (inputTxt.match(letters)) {
        return true;
    }
    else {
        return false;
    }
}    

describe('Random.alphabet function', () => {
    it('should return a "string" of given length(24)', () => {
        const str = Random.alphabet(24);
        console.log(str);
        expect(typeof str).toEqual('string');
        expect(allLetters(str)).toBe(true);
        expect(str).toHaveLength(24);
    });
    it('should return a "string" of given length(12)', () => {
        const str = Random.alphabet(12);
        console.log(str);
        expect(typeof str).toEqual('string');
        expect(allLetters(str)).toBe(true);
        expect(str).toHaveLength(12);
    });
    it('should return a "string" of given length(10)', () => {
        const str = Random.alphabet(10);
        console.log(str);
        expect(typeof str).toEqual('string');
        expect(allLetters(str)).toBe(true);
        expect(str).toHaveLength(10);
    });
    it('should return a "string" of given length(0)', () => {
        const str = Random.alphabet(0);
        console.log(str);
        expect(typeof str).toEqual('string');
        expect(allLetters(str)).toBe(true);
        expect(str).toHaveLength(0);
    });
    it('should throw exception when length is not passed', () => {
        try {
            Random.alphabet();
        } catch (e) {
            expect(e.message).toBe('An error occured while generating random alphabets');
            expect(e.code).toBe(409);

        }
    });

});

describe('Random.getRandomIntWithinMax function', () => {
    it('should return a integer less than or equal to given(99999999909999999990)', () => {
        const num = Random.getRandomIntWithinMax(99999999909999999990);
        //console.log(num);
        expect(typeof num).toEqual('number');
        expect(Number.isInteger(num)).toBe(true);
        expect(num).toBeLessThanOrEqual(99999999909999999990);
    });
    it('should return a integer less than or equal to given(999999)', () => {
        const num = Random.getRandomIntWithinMax(999999);
        expect(typeof num).toEqual('number');
        expect(Number.isInteger(num)).toBe(true);
        expect(num).toBeLessThanOrEqual(999999);
    });
    it('should return a integer less than or equal to given(999)', () => {
        const num = Random.getRandomIntWithinMax(999);
        expect(typeof num).toEqual('number');
        expect(Number.isInteger(num)).toBe(true);
        expect(num).toBeLessThanOrEqual(999);
    });
    it('should return a integer less than or equal to given(1)', () => {
        const num = Random.getRandomIntWithinMax(1);
        expect(typeof num).toEqual('number');
        expect(Number.isInteger(num)).toBe(true);
        expect(num).toBeLessThanOrEqual(1);
    });
    it('should return a integer less than or equal to given(0)', () => {
        const num = Random.getRandomIntWithinMax(0);
        expect(typeof num).toEqual('number');
        expect(Number.isInteger(num)).toBe(true);
        expect(num).toBeLessThanOrEqual(0);
    });
    it('should return a integer less than or equal to given(-1)', () => {
        const num = Random.getRandomIntWithinMax(-1);
        expect(typeof num).toEqual('number');
        expect(Number.isInteger(num)).toBe(true);
        expect(num).toBeLessThanOrEqual(-1);
    });
});

describe('Random.getRandomStringOfOneChar function', () => {
    it('should return a masked string replaced by given char(sampath, *)', () => {
        const str = Random.getRandomStringOfOneChar('sampath', '*');
        expect(typeof str).toEqual('string');
        expect(str).toHaveLength('sampath'.length);
        expect(str).toEqual('*******');
    });
    it('should return a masked string replaced by given char(c2FtcGF0aA==, +)', () => {
        const str = Random.getRandomStringOfOneChar('c2FtcGF0aA==', '+');
        expect(typeof str).toEqual('string');
        expect(str).toHaveLength('c2FtcGF0aA=='.length);
        expect(str).toEqual('++++++++++++');
    });
    it('should return a masked string replaced by given char(YzJGdGNHRjBhQT09, x)', () => {
        const str = Random.getRandomStringOfOneChar('YzJGdGNHRjBhQT09', 'x');
        expect(typeof str).toEqual('string');
        expect(str).toHaveLength('YzJGdGNHRjBhQT09'.length);
        expect(str).toEqual('xxxxxxxxxxxxxxxx');
    });
    it('should return a masked string replaced by given char("", x)', () => {
        const str = Random.getRandomStringOfOneChar('', 'x');
        expect(typeof str).toEqual('string');
        expect(str).toHaveLength(''.length);
        expect(str).toEqual('');
    });
    it('should return a masked string replaced by given char(YzJGdGNHRjBhQT09, "")', () => {
        const str = Random.getRandomStringOfOneChar('YzJGdGNHRjBhQT09', '');
        expect(typeof str).toEqual('string');
        expect(str).toHaveLength(''.length);
        expect(str).toEqual('');
    });
});