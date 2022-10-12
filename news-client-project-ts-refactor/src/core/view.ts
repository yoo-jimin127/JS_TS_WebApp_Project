/** view - 공통 요소 */
export default abstract class View {
    private template: string;
    private renderTemplate: string;
    private container: HTMLElement;
    private htmlList: string[]; // empty array -> html list append

    constructor(containerId: string, template: string) {
        const containerElement = document.getElementById(containerId);

        if (!containerElement) {
            throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'
        }

        this.container = containerElement;
        this.template = template;
        this.renderTemplate = template;
        this.htmlList = [];
    }

    protected updateView(): void {
        this.container.innerHTML= this.renderTemplate;
        this.renderTemplate = this.template; // UI 업데이트 작업 후 원본 템플릿으로 복원
    }

    /** html 문자열 추가 함수 */
    protected addHtml(htmlString: string): void {
        this.htmlList.push(htmlString);
    }

    /** 문자열 병합 값 리턴 함수 */
    protected getHtml(): string {
        const snapshot = this.htmlList.join('');
        this.clearHtmlList(); // html list clear
        return snapshot;
    }

    /** template 내용 대체 함수 */
    protected setTemplateData(key: string, value: string):void {
        this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
    }

    /** html list clear 함수 */
    private clearHtmlList(): void {
        this.htmlList = [];
    }

    abstract render(...params: string[]): void; // abstract method
}