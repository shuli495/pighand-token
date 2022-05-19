const path = require('path');
const xl = require('excel4node');
import * as moment from 'moment';

// 标题样式
const wb = new xl.Workbook();
const titleStyle = wb.createStyle({
    font: {
        name: '苹方-简',
        color: '#000000',
        size: 14,
        bold: true
    },
    alignment: {
        horizontal: 'center',
        vertical: 'center'
    },
    border: {
        top: {
            style: 'thin',
            color: '#000000'
        },
        right: {
            style: 'thin',
            color: '#000000'
        },
        bottom: {
            style: 'thin',
            color: '#000000'
        },
        left: {
            style: 'thin',
            color: '#000000'
        }
    },
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#e0e1e0',
        fgColor: '#e0e1e0'
    }
});
// 内容样式
const contentStyle = wb.createStyle({
    font: {
        name: '苹方-简',
        color: '#000000',
        size: 12
    },
    alignment: {
        vertical: 'center'
    },
    border: {
        top: {
            style: 'thin',
            color: '#000000'
        },
        right: {
            style: 'thin',
            color: '#000000'
        },
        bottom: {
            style: 'thin',
            color: '#000000'
        },
        left: {
            style: 'thin',
            color: '#000000'
        }
    }
});
// 子元素样式
const childrenStyle = wb.createStyle({
    font: {
        name: '苹方-简',
        color: '#000000',
        size: 12
    },
    alignment: {
        horizontal: 'center',
        vertical: 'center'
    },
    border: {
        top: {
            style: 'thin',
            color: '#000000'
        },
        right: {
            style: 'thin',
            color: '#000000'
        },
        bottom: {
            style: 'thin',
            color: '#000000'
        },
        left: {
            style: 'thin',
            color: '#000000'
        }
    },
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#e0e1e0',
        fgColor: '#e0e1e0'
    }
});
// 汇总样式
const collectStyle = wb.createStyle({
    font: {
        name: '苹方-简',
        color: '#000000',
        size: 14,
        bold: true
    },
    alignment: {
        horizontal: 'right',
        vertical: 'center'
    },
    border: {
        top: {
            style: 'thin',
            color: '#000000'
        },
        right: {
            style: 'thin',
            color: '#000000'
        },
        bottom: {
            style: 'thin',
            color: '#000000'
        },
        left: {
            style: 'thin',
            color: '#000000'
        }
    },
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#e0e1e0',
        fgColor: '#e0e1e0'
    }
});

interface excelColumnConfig {
    width: number;
    height?: number;
    title: string;
    valueKey: string;
    defaultValue?: string;
}

export interface excelConfig {
    name: string;
    columns: Array<excelColumnConfig>;
    children?: any;
}

export interface excelResult {
    sendPath: string;
    excelName: string;
    excelPath: string;
}

/**
 *生成excel
 * @param {*} data
 */
export const exportExcel = (data: Array<any>, config: excelConfig) => {
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet(config.name);

    // // 过滤
    // ws.row(1).filter({
    //     firstRow: 1,
    //     firstColumn: 1,
    //     lastRow: 1,
    //     lastColumn: 4
    // });

    // 子元素key
    const { valueKey: childrenValueKey = '', columns: childrenColumns = [] } =
        config.children || {};

    // 设置标题
    config.columns.forEach((columnConfig: excelColumnConfig, columnIndex: number) => {
        if (columnConfig.width) {
            ws.column(columnIndex + 1).setWidth(columnConfig.width);
        }
        if (columnConfig.height) {
            ws.column(columnIndex + 1).setHeight(columnConfig.height);
        }

        ws.cell(1, columnIndex + 1)
            .string(columnConfig.title)
            .style(titleStyle);
    });

    // 设置内容
    let x = 2;
    let y = 1;
    data.forEach((item: any) => {
        config.columns.forEach((columnConfig: excelColumnConfig) => {
            const { valueKey = '', defaultValue = '' } = columnConfig;

            let finalValue = '';
            valueKey.split(',').forEach((key: string) => {
                finalValue = item[key] || '';
            });

            ws.cell(x, y)
                .string(String(finalValue || defaultValue))
                .style(contentStyle)
                .style({
                    alignment: {
                        horizontal: 'center'
                    }
                });
            y++;
        });

        y = 1;
        x++;

        // 设置子内容
        if (childrenValueKey) {
            const childrenValues = item[childrenValueKey];
            if (childrenValues && Array.isArray(childrenValues)) {
                // 子元素开始的行数
                const childrenXBegin = x;

                // 子元素内容
                childrenValues.forEach((childrenValue: any) => {
                    // 子元素跳过第一列
                    y++;
                    childrenColumns.forEach((childrenColumn: any) => {
                        ws.cell(x, y)
                            .string(String(childrenValue[childrenColumn.valueKey]))
                            .style(childrenStyle)
                            .style({
                                alignment: {
                                    horizontal: 'center'
                                }
                            });
                        y++;
                    });

                    y = 1;
                    x++;
                });

                // 有子元素，合并子元素第一列单元格
                if (childrenXBegin != x) {
                    ws.cell(childrenXBegin, 1, x - 1, 1, true).string('');
                }
            }
        }
    });

    const publicPath = 'public/excel';
    const excelName = `${config.name}_${moment().format('YYYYMMDDHHmmss')}.xlsx`;
    const excelPath = path
        .resolve(__dirname, `../../${publicPath}/${excelName}`)
        .replace('dist/', '');
    return new Promise(function(resolve, reject) {
        wb.write(excelPath, function(err: any) {
            if (err) {
                throw new Error('生成excel异常：' + err.message);
            } else {
                const result: excelResult = {
                    sendPath: `/${publicPath}/${excelName}`,
                    excelName,
                    excelPath
                };
                resolve(result);
            }
        });
    });
};
