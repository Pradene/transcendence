import {TemplateComponent} from "../utils/TemplateComponent";

export class Page404 extends TemplateComponent {
    constructor() {
        super();

        this.translations = {
            en: {
                text: "page not found"
            },
            de: {
                text: "seite nicht gefunden"
            },
            fr: {
                text: "page non trouve"
            }
        }
    }

    async componentDidMount() {
        const language = localStorage.getItem('selectedLanguage')

        document.querySelector('.container p').textContent = this.translations[language].text
    }

    async unmount() {
    }
}