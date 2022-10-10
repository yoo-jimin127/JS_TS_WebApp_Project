const ajax: XMLHttpRequest = new XMLHttpRequest(); // ajax 출력 결과 반환

const store: Store  = {
    currentPage: 1,
    feeds: [],
};

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView); // default page set

router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route(); // 실행