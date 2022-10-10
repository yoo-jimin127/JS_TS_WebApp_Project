class Api {
    getRequest<AjaxResponse>(method: string, url: string, async: boolean): AjaxResponse {
        const ajax = new XMLHttpRequest();
        ajax.open(method, url, async);
        ajax.send();
    
        return JSON.parse(ajax.response);
    }
}

class NewsFeedApi {
    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>( 'GET', URL_ADDR, false);
    }
}

class NewsDetailApi {
    getData(id: string): NewsDetail {
        return this.getRequest<NewsDetail>('GET', CONTENT_URL.replace('@id', id), false);
    }
}