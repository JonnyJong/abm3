import { Page, PageOption } from "../page";

function pageHandler(page: Page) {
  page.show();
}

const page: PageOption = {
  handler: pageHandler,
};

export default page;
