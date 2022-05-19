// const lodash = require('lodash');

// /**
//  * 参数校验，支持校验必填项/数据类型/长度
//  * params请求参数
//  * checks 校验项
//  * [
//  *  {
//  *      key: text,  字段：错误提示；支持多个，字段，&&判断
//  *      required: true,    是否必填
//  *      type: 'string/number/jsonArray/object/boolean',  类型校验
//  *      jsonDataType: 'string/number',  json数据类型
//  *      jsonCheckDatas: json数据类型校验，格式与checks相同
//  *      jsonAllowMoreKey: true/false 是否允许非格式以外的值
//  *      lengthMin: 最小长度校验
//  *      lengthMax: 最大长度校验
//  *      regexType: 正则格式校验
//  *      parentText: 父节点文案
//  *  }
//  * ]
//  */
// const checkDatasFunction = function checkDatasFunction(params, checks = [], parentText = '') {
//     const err = new Error();
//     err.status = 400;

//     checks.forEach((check) => {
//         // 是否输入，用于判断必填
//         let hasInput = false;
//         let requiredText = '';

//         const { data = {} } = check;
//         Object.keys(data).forEach((key) => {
//             // 错误提示文案
//             const text = parentText ? `${parentText}-${data[key]}` : data[key];
//             // json格式校验
//             const {
//                 jsonDataType = '',
//                 lengthMin = 0,
//                 lengthMax,
//                 jsonCheckDatas = [],
//                 jsonAllowMoreKey = true,
//                 regexType = '',
//             } = check;
//             // 前端传值
//             const value = params[key];
//             // 传值数据类型
//             const type = Array.isArray(value) ? 'jsonArray' : typeof value;

//             // 类型校验
//             if ((value || value === '') && check.type && type !== check.type) {
//                 let typeStr;
//                 switch (check.type) {
//                     case 'number':
//                         typeStr = '数字';
//                         break;
//                     case 'jsonObject':
//                         typeStr = 'json';
//                         break;
//                     case 'jsonArray':
//                         typeStr = '数组';
//                         break;
//                     case 'boolean':
//                         typeStr = '布尔';
//                         break;
//                     default:
//                         typeStr = '字符串';
//                         break;
//                 }
//                 err.message = `${text}类型不是${typeStr}`;
//                 throw err;
//             }

//             // json校验
//             if (check.type === 'jsonArray' || check.type === 'object') {
//                 // json格式校验
//                 if (jsonDataType && check.type === 'jsonArray') {
//                     (value || []).forEach((jsonArrItem) => {
//                         // eslint-disable-next-line valid-typeof
//                         if (typeof jsonArrItem !== jsonDataType) {
//                             let typeStr;
//                             switch (jsonDataType) {
//                                 case 'number':
//                                     typeStr = '数字';
//                                     break;
//                                 default:
//                                     typeStr = '字符串';
//                                     break;
//                             }
//                             err.message = `${text}数据类型必须是${typeStr}`;
//                             throw err;
//                         }
//                     });
//                 }

//                 // 校验子数据
//                 if (jsonCheckDatas.length > 0) {
//                     if (check.type === 'object') {
//                         checkDatasFunction(value, jsonCheckDatas, text);
//                     } else {
//                         (value || []).forEach((item) => {
//                             checkDatasFunction(item, jsonCheckDatas, text);
//                         });
//                     }
//                 }

//                 // 校验非格式以外参数
//                 if (jsonAllowMoreKey === false) {
//                     const ruleKeys = jsonCheckDatas.map((item) => {
//                         return Object.keys(item.data);
//                     });

//                     const ruleKeysFlatten = lodash.flattenDeep(ruleKeys);

//                     const paramsJsonKeys = Object.keys(value);
//                     const diff = lodash.difference(paramsJsonKeys, ruleKeysFlatten);

//                     if (diff.length > 0) {
//                         err.message = `${text}格式不正确，不能包含${diff.join('、')}`;
//                         throw err;
//                     }
//                 }
//             }

//             // 长度大小校验
//             if (value && (lengthMin || lengthMax)) {
//                 // json格式
//                 if (check.type === 'jsonArray') {
//                     const lengthText = '个数';

//                     if (lengthMax && value.length > lengthMax) {
//                         err.message = `${text}${lengthText}不能超过${lengthMax}个`;
//                         throw err;
//                     }
//                     if (lengthMin && value.length < lengthMin) {
//                         err.message = `${text}${lengthText}不能少于${lengthMin}个`;
//                         throw err;
//                     }
//                 } else {
//                     const valueLength = String(value).length;
//                     const lengthText = type === 'number' ? '' : '长度';

//                     if (lengthMax && valueLength > lengthMax) {
//                         err.message = `${text}${lengthText}不能超过${lengthMax}`;
//                         throw err;
//                     }
//                     if (lengthMin && valueLength < lengthMin) {
//                         err.message = `${text}${lengthText}不能小于${lengthMin}`;
//                         throw err;
//                     }
//                 }
//             }

//             // 前端是否输入值
//             if (
//                 (value !== undefined &&
//                     value !== null &&
//                     value !== '' &&
//                     type !== 'jsonObject' &&
//                     type !== 'jsonArray') ||
//                 (type === 'jsonObject' && Object.keys(value).length !== 0) ||
//                 (type === 'jsonArray' && value.length !== 0)
//             ) {
//                 hasInput = true;
//             }

//             if (requiredText) {
//                 requiredText += `或${text}`;
//             } else {
//                 requiredText = text;
//             }

//             // 正则校验
//             if (regexType && hasInput) {
//                 switch (regexType) {
//                     case 'mobile':
//                         if (!/^1[3456789]\d{9}$/.test(value)) {
//                             err.message = '手机号格式不正确';
//                             throw err;
//                         }
//                         break;
//                     case 'email':
//                         if (!/^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/.test(value)) {
//                             err.message = '邮箱格式不正确';
//                             throw err;
//                         }
//                         break;
//                     case 'mobileFixed':
//                         if (!(/^1[3456789]\d{9}$/.test(value) || /^(0[1-9]\d{1,2}-)\d{6,7}$/.test(value))) {
//                             err.message = '电话格式不正确';
//                             throw err;
//                         }
//                         break;
//                     default:
//                         break;
//                 }
//             }
//         });

//         // 必填校验
//         if (check.required !== false && !hasInput) {
//             err.message = `请输入${requiredText}`;
//             throw err;
//         }
//     });
// };

// module.exports = checkDatasFunction;
