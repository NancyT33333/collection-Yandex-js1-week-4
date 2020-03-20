/**
 * @param {Array} collection
 * @params {Function[]} – Функции для запроса
 * @returns {Array}
 */
function query() {
    var [oCollection, ...aOperations] = [...arguments]
    if (aOperations.length === 0) {
        return oCollection
    }
    if (oCollection && aOperations) {

        var aSelectFields = _traverseArgs("select", aOperations.filter((operation, ind) => {
            return operation[0] === "select" ? true : false
        }))
        var aFilterInFields = _traverseArgs("filterIn", aOperations.filter((operation, ind) => {
            return operation[0] === "filterIn" ? true : false
        }))

        // filtering
        aFilterInFields.forEach(function (oFilter) {
            oCollection = oCollection.filter(function (oCollElem) {
                var sFiltPropValue = oCollElem[oFilter.property]
                return (oFilter.values.indexOf(sFiltPropValue) >= 0) ? true : false
            })
        })
        // selection
        var oResultColection = [];
        var oResultEl;
        oResultColection = oCollection.map(function (el) {
            oResultEl = {}
            for (let [key, value] of Object.entries(el)) {
                if (aSelectFields.indexOf(key) >= 0) {
                    oResultEl[key] = value
                }
            }
            return oResultEl
        })
        return oResultColection

    } else { // if no arguments passed
        return []
    }
}

/**
 * @param {String}  - операция  
 * @params {Array} – Аргументы
 * @returns {Array}
 */
// обрабатывает пересечения операций
function _traverseArgs() {
    var [sOperation, aArgs] = [...arguments];
    aArgs = aArgs.flatMap(function (currentValue) {
        return currentValue[1]
    })
    switch (sOperation) {
        case "select":
            //  если что-то встретилось больше раза -- удалить все вхождения
            aArgs = aArgs.filter((elem) => {
                return (aArgs.lastIndexOf(elem) === aArgs.indexOf(elem)) ? true : false
            })
            return aArgs
        case "filterIn":
            var aResultArgs = [];
            aArgs.forEach(function (el) {
                if (aResultArgs.filter((a) => {
                        return a.property === el.property
                    }).length > 0) {
                    return
                }

                var aSimilrPropArgs = aArgs.filter((elem) => {
                    return elem.property === el.property ? true : false
                })
                if (aSimilrPropArgs.length > 1) { // если аргумент с таким параметром ( напр., "gender") встр не один раз
                    // найти пересечения значений и убрать другие аргументы с таким проперти
                    aValues = aSimilrPropArgs.map((arg) => {
                        return arg.values
                    })
                    var aCommonValues = aValues.reduce((a, c) => a.filter(i => c.includes(i))) // общие значения одного проперти
                    aResultArgs.unshift({
                        ...el,
                        values: aCommonValues
                    })

                } else { // единственная фильтрация по такому полю
                    aResultArgs.unshift(el)
                }
            })
            return aResultArgs
    }
}

/**
 * @params {String[]}
 */
function select() {
    var fields = [...arguments]

    return ['select', fields]
}

/**
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Массив разрешённых значений
 */
function filterIn(property, values) {
    return ['filterIn', {
        property,
        values
    }]
}

module.exports = {
    query: query,
    select: select,
    filterIn: filterIn
};