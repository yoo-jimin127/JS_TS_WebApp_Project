import { NewsFeed, NewsDetail } from '../types';

export default class Api {
    ajax: XMLHttpRequest;
    url: string;

    constructor(url: string) {
        this.ajax = new XMLHttpRequest();
        this.url = url;
    }

    getRequest<AjaxResponse>(): AjaxResponse {
        this.ajax.open('GET', this.url, false);
        this.ajax.send();

        return JSON.parse(this.ajax.response) as AjaxResponse;
    }
}

export class NewsFeedApi extends Api {
    constructor(url: string) {
        super(url);
    }

    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>();
    }
}

export class NewsDetailApi extends Api {
    constructor(url: string) {
        super(url);
    }

    getData(): NewsDetail {
        return this.getRequest<NewsDetail>();
    }
}


// // mixin
// function applyApiMixins(targetClass: any, baseClasses: any) {
//     baseClasses.forEach(baseClass => {
//         Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
//             const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

//             if (descriptor) {
//                 Object.defineProperty(targetClass.prototype, name, descriptor);
//             }
//         });
//     });
// }

// // apply mixin
// interface NewsFeedApi extends Api{};
// interface NewsDetailApi extends Api{};

// applyApiMixins(NewsFeedApi, [Api]);
// applyApiMixins(NewsDetailApi, [Api]);