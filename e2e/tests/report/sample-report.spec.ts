import { expect, test } from "@playwright/test";
import {
  FILTER_HEADERS,
  ALL_COLUMN_HEADERS,
} from "../../constants/sample.const";
import {
  metadataSectionTitles,
  pipelineSectionTitles,
  verifySectionTitles,
} from "../../utils/report";
import { getByTestID, getByText } from "../../utils/selectors";

const sampleId = 25307;
// These tests verify the ui displayed on the Table  for the sample report page
test.describe("Sample report tests", () => {
  test.beforeEach(async ({ page }) => {
    // go to sample page
    await page.goto(`${process.env.BASEURL}/samples/${sampleId}`);

    // click details link
    await page.locator(getByText("Sample Details")).click();
  });
  test(`Should verify header of sample report page`, async ({ page }) => {
    const filter = await page.locator(FILTER_HEADERS).allInnerTexts();

    for (let i = 0; i < filter.length; i++) {
      ALL_COLUMN_HEADERS.includes(filter[i]);
    }
    const column_header = await page.locator(FILTER_HEADERS).allInnerTexts();

    for (let i = 0; i < column_header.length; i++) {
      ALL_COLUMN_HEADERS.includes(column_header[i]);
    }
  });

  test(`Should verify side bar on the sample report page`, async ({ page }) => {
    await expect(page.locator(getByTestID("metadata"))).toBeVisible();
    await expect(page.locator(getByTestID("pipelines"))).toBeVisible();
    await expect(page.locator(getByTestID("notes"))).toBeVisible();

    // verify metadata section titles
    await verifySectionTitles(page, metadataSectionTitles);

    // verify pipeline section titles
    await page.locator(getByTestID("pipelines")).click();
    await verifySectionTitles(page, pipelineSectionTitles);
  });
});
