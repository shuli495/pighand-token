/**
 * list转tree
 * @param list
 * @param parentId
 * @returns
 */
function listToTree(list: Array<any>) {
    const allId = list.map(item => item._id.toString());

    let parents = list.filter(
        value =>
            value.parentId === undefined ||
            value.parentId === 'undefined' ||
            value.parentId === null ||
            value.parentId === '' ||
            (value.parentId && !allId.includes(value.parentId.toString()))
    );
    let children = list.filter(
        value =>
            value.parentId !== undefined &&
            value.parentId !== 'undefined' &&
            value.parentId !== null &&
            value.parentId !== '' &&
            allId.includes(value.parentId.toString())
    );

    let translator = (parents: any, children: any) => {
        parents.forEach((parent: any) => {
            children.forEach((current: any, index: any) => {
                if (current.parentId.toString() === (parent._id || parent.id).toString()) {
                    let temp = JSON.parse(JSON.stringify(children));
                    temp.splice(index, 1);
                    translator([current], temp);
                    typeof (parent._doc || parent).children !== 'undefined'
                        ? (parent._doc || parent).children.push(current)
                        : ((parent._doc || parent).children = [current]);
                }
            });
        });
    };
    translator(parents, children);
    return parents;
}

export default listToTree;
