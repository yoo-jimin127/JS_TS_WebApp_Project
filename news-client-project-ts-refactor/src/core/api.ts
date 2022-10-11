import { NewsFeed, NewsDetail } from '../types';

export class Api {
    ajax: XMLHttpRequest;
    url: string;
    method: string;
    async: boolean;

    constructor(method: string, url: string, async: boolean) {
        this.ajax = new XMLHttpRequest();
        this.url = url;
        this.method = method;
        this.async = async;
    }

    getRequest<AjaxResponse>(): AjaxResponse {
        this.ajax.open(this.method, this.url, this.async);
        this.ajax.send();
    
        return JSON.parse(this.ajax.response);
    }
}

export class NewsFeedApi extends Api {
    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>();
    }
}

export class NewsDetailApi extends Api {
    getData(id: string): NewsDetail {
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