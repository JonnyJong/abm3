import { Page, PageOption } from "../page";

function pageHandler(page: Page) {
  page.show();
}

const page: PageOption = {
  only: true,
  handler: pageHandler,
};

export default page;
