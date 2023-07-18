import { expect, test } from "@playwright/test";
import {
  ANNOTATION_FILTERS,
  ANNOTATION_TEXT,
  APPLY,
  APPLY_BUTTON,
  ARCHAEA_FILTER,
  BACTERIA_FILTER,
  CANCEL_ICON,
  CATEGORIES_FILTER,
  COLUMNS_LABEL,
  COLUMN_HEADER_PROP,
  EUKARYOTA_FILTER,
  FILTERS_DROPDOWN,
  FILTER_HEADERS,
  FILTER_RESULT,
  FILTER_TAG,
  KLEBSIELLA,
  KLEBSIELLA_GENUS,
  LEARN_MORE_LINK,
  NUMBER_INPUT,
  READ_SPECIFICITY,
  READ_SPECIFICITY_FILTERS,
  SCORE,
  SEARCH_BAR,
  THRESHOLD_FILTER,
  THRESHOLD_FILTERS,
  TOTAL_READ_POPOUP_CONTENT,
  UNCATEGORIZED_FILTER,
  VIROIDS_FILTER,
  VIRUSES_FILTER,
} from "../../constants/sample";

const sampleId = 25307;
// These tests validate the user's proficiency in utilizing various filter functions on the sample report page, such as Nametype, Annotation, Category, Threshold filter, and Read specificity.
test.describe("Sample report filter test", () => {
  test.beforeEach(async ({ page }) => {
    // go to sample page
    await page.goto(`${process.env.BASEURL}/samples/${sampleId}`);
  });

  test(`Verify url displayed on the columns`, async ({ page, context }) => {
    await expect(page.locator(COLUMNS_LABEL).nth(1)).toBeVisible();
    const n = await page.locator(COLUMNS_LABEL).allInnerTexts();
    for (let i = 1; i < n.length; i++) {
      await page.locator(COLUMNS_LABEL).nth(i).hover();
      await expect(page.locator(TOTAL_READ_POPOUP_CONTENT)).toHaveText(
        COLUMN_HEADER_PROP[n[i]]["description"],
      );

      const [newPage] = await Promise.all([
        context.waitForEvent("page"),
        await page.locator(LEARN_MORE_LINK).click(),
      ]);
      await newPage.waitForLoadState();
      const link = COLUMN_HEADER_PROP[n[i]]["url"];
      expect(newPage.url().includes(link)).toBeTruthy();
      await newPage.close();
      await page.locator(COLUMNS_LABEL).nth(i).click();
    }
  });

  test(`Should be able to filter by Taxon name`, async ({ page }) => {
    // Search for data
    await page.locator(SEARCH_BAR).fill(KLEBSIELLA);
    await page.getByText(KLEBSIELLA_GENUS).click();

    // Verify filter result
    await expect(page.locator(FILTER_TAG)).toBeVisible();
    await expect(page.locator(FILTER_RESULT)).toHaveText(KLEBSIELLA);
  });

  test(`Should be able to filter by Category name`, async ({ page }) => {
    await page.locator(FILTER_HEADERS).locator(CATEGORIES_FILTER).click();
    const drop_down = [
      ARCHAEA_FILTER,
      BACTERIA_FILTER,
      EUKARYOTA_FILTER,
      VIROIDS_FILTER,
      VIRUSES_FILTER,
      UNCATEGORIZED_FILTER,
    ];
    const filter_tag = [
      "Archaea",
      "Bacteria",
      "Eukaryota",
      "Viroids",
      "Viruses",
      "Phage",
      "Uncategorized",
    ];
    for (let i = 0; i < drop_down.length; i++) {
      await page.locator(CATEGORIES_FILTER).click();
      await page.locator(drop_down[i]).click();
      await expect(
        page.locator(FILTER_TAG).locator(`text="${filter_tag[i]}"`),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      // test Remove filter x button
      await page
        .locator(FILTER_TAG)
        .locator(`text="${filter_tag[i]}"`)
        .getByTestId("x-close-icon")
        .click();
      await expect(
        page.locator(FILTER_TAG).locator(`text="${filter_tag[i]}"`),
      ).not.toBeVisible();
    }

    for (let i = 0; i < drop_down.length; i++) {
      await page.locator(CATEGORIES_FILTER).click();
      await expect(page.locator(drop_down[i])).toBeVisible();
      await page.locator(drop_down[i]).click();
      await page.keyboard.press("Escape");
    }
    // test Stats bar
    await expect(page.getByTestId("stats-info")).not.toBeEmpty();

    // test Clear Filters button
    await page.locator(`text="Clear Filters"`).click();
    await expect(page.getByTestId("filter-tag")).toHaveCount(0);
  });

  test(`Should be able to filter by Threshold`, async ({ page }) => {
    await page.locator(FILTER_HEADERS).locator(THRESHOLD_FILTER).click();
    await page.locator(FILTER_HEADERS).locator(SCORE).click();

    // Verify drop down contains required elements
    const drop_down = await page.locator(FILTERS_DROPDOWN).allInnerTexts();
    for (let i = 0; i < drop_down.length; i++) {
      expect(THRESHOLD_FILTERS.includes(drop_down[i])).toBeTruthy();
    }
    await page.locator(FILTER_HEADERS).locator(THRESHOLD_FILTER).click();

    // Verify Threshold filter are applied
    for (let i = 0; i < drop_down.length; i++) {
      await page.locator(FILTER_HEADERS).locator(THRESHOLD_FILTER).click();
      await page.locator(FILTER_HEADERS).locator(SCORE).click();
      await page.locator(FILTERS_DROPDOWN).nth(i).click();
      await page.locator(NUMBER_INPUT).fill("10");
      await page.locator(APPLY_BUTTON).locator(APPLY).click();
      await expect(page.locator(FILTER_TAG)).toHaveText(
        drop_down[i] + " >= 10",
      );
      await page.locator(CANCEL_ICON).click();
    }
  });

  test(`Should be able to filter by Read Specificity`, async ({ page }) => {
    await page.locator(FILTER_HEADERS).locator(READ_SPECIFICITY).click();
    const drop_down = await page.locator(FILTERS_DROPDOWN).allInnerTexts();
    for (let i = 0; i < drop_down.length; i++) {
      expect(READ_SPECIFICITY_FILTERS.includes(drop_down[i])).toBeTruthy();
    }
  });

  test(`Should be able to filter by Annotation`, async ({ page }) => {
    await page.locator(FILTER_HEADERS).locator(ANNOTATION_TEXT).click();

    const drop_down = await page.locator(FILTERS_DROPDOWN).allInnerTexts();
    for (let i = 0; i < drop_down.length; i++) {
      expect(ANNOTATION_FILTERS.includes(drop_down[i])).toBeTruthy();
    }

    await page.locator(FILTER_HEADERS).locator(ANNOTATION_TEXT).click();

    // Verify Threshold filter are applied
    for (let i = 0; i < drop_down.length; i++) {
      await page.locator(FILTER_HEADERS).locator(ANNOTATION_TEXT).click();
      await page.locator(FILTERS_DROPDOWN).nth(i).click();
      await expect(page.locator(FILTER_TAG)).toHaveText(drop_down[i]);
      await page.locator(COLUMNS_LABEL).nth(0).click();
      await page.locator(CANCEL_ICON).click();
    }
  });
});
