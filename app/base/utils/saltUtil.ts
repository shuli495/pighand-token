import * as bcrypt from 'bcrypt-nodejs';
const SALT_WORK_FACTOR = 10;

/**
 * 加密密码
 * @param {string} password
 */
export const generatePassword = (password: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err: Error, salt: string) => {
            if (err) {
                reject(err);
            } else {
                bcrypt.hash(password, salt, null, (err: Error, hash: string) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            }
        });
    });
};

/**
 * 对比密码
 * @param {string} password
 * @param {string} hash
 */
export const comparePassword = (password: string, hash: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err: any, res: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
};
