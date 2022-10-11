import Router from "./core/router";
import { NewsFeedView, NewsDetailView} from './page';
import { Store } from './types';

const store: Store  = {
    currentPage: 1,
    feeds: [],
};

// 전역 스토어 설정
declare global {
    interface Window {
        store: Store;
    }
}
window.store = store;

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView); // default page set

router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route(); // 실행