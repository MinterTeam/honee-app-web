const camelCase = require('camelcase');

module.exports = function onCreateComponent(component) {
    if (component.rawTypeData.properties) {
        component.rawTypeData.properties = mapEntries(component.rawTypeData.properties, ([propName, value]) => {
            return [camelCase(propName), value];
        });
    }
    if (component.rawTypeData.required && Array.isArray(component.rawTypeData.required)) {
        component.rawTypeData.required = component.rawTypeData.required.map((propName) => camelCase(propName));
    }
    return component;
};

function mapEntries(obj, mapCallbackFn) {
    return Object.fromEntries(Object.entries(obj).map(mapCallbackFn));
}
