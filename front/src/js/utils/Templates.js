export const TemplatesDirectory = "/src/js/templates/"

export const TemplatesRegistry = {}
export function registerTemplates(name, component) {
    TemplatesRegistry[name] = component
}

