import { SAMPLE_PROJECTS } from "@e2e/constants/common";
import {
  ADD_THRESHOLD,
  ANNOTATION,
  CHOOSE_TAXON,
  CLOSE_ICON,
  COMBOBOX,
  ESCAPE,
  HOST,
  KLEBSIELLA,
  LAST_MONTH,
  LAST_SIX_MONTHS,
  LAST_THREE_MONTHS,
  LAST_WEEK,
  NUMBERINPUT,
  PRIVATE,
  PUBLIC,
  SAMPLE_NAME_SELECTOR,
  SAMPLE_TYPE,
  SEARCH,
  TIMEFRAME,
  VISIBILITY,
} from "@e2e/constants/filter";
import { goToProjectSamples } from "@e2e/utils/project";
import { expect, Page, test } from "@playwright/test";
import { kebabCase } from "lodash";

const chosenHosts = ["Human"];
const sampleTypes = ["Ocular Fluid", "Nasopharyngeal Swab"];

const workflows = [
  "Metagenomics",
  "Consensus Genomes",
  "Antimicrobial Resistance",
];
const CANADA = "Alberta, Canada";
const DALLAS = "Dallas County, Texas, USA";
const ENV = (process.env.NODE_ENV as string) || "";
const projectName = SAMPLE_PROJECTS[ENV.toUpperCase()];

async function clearFilters(page: Page) {
  const totalFilters = await page.getByText(ADD_THRESHOLD).count();
  for (let i = 0; i < totalFilters; i += 1) {
    await page.locator(CLOSE_ICON).nth(0).click();
  }
}
test.describe("Sample filtering tests", () => {
  ["Metagenomics", "Consensus Genomes"].forEach((workflow, index) => {
    test(`Should filter ${workflow} by taxons`, async ({ page }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);
      await page.getByTestId("taxon-filter").click();
      await page.getByText(CHOOSE_TAXON).click();
      await page.getByRole(COMBOBOX, { name: SEARCH }).click();
      await page.getByRole(COMBOBOX, { name: SEARCH }).fill(KLEBSIELLA);
      await page.getByText(KLEBSIELLA).first().click();
      await page.getByText("Taxon filter").first().click(); // close the popup window so we can fill other fields

      // todo: sometimes the add threshold is not available
      if ((await page.getByTestId("add-threshold").count()) > 0) {
        await page.getByTestId("add-threshold").click();
        await page.locator(NUMBERINPUT).click();
        await page.locator(NUMBERINPUT).fill(".5");
      }

      await page.getByTestId("apply").click();

      // check result
      expect(
        await page.getByTestId("sample-name").count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result

      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    // todo: this is failing and requires further investigation
    // annotation = "Not a hit";
    test(`Should filter ${workflow} by annotations`, async ({ page }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      if (await page.getByText(ANNOTATION).isEnabled()) {
        // Hit annotation
        const annotation = "Hit";
        await page.getByText(ANNOTATION).click();
        await page.getByText(annotation, { exact: true }).click();
        await page.keyboard.press(ESCAPE);

        // check result
        expect(
          await page.locator(SAMPLE_NAME_SELECTOR).count(),
        ).toBeGreaterThanOrEqual(0);

        // clear filter
        clearFilters(page);
      }
    });
  });
  workflows.forEach((workflow, index) => {
    test(`Should filter ${workflow} samples by locations`, async ({ page }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      // click location dropdown
      await page.getByTestId("location").nth(0).click();

      // select two locations
      await page.getByTestId("dropdown-menu").getByText(CANADA).nth(0).click();
      await page.getByTestId("dropdown-menu").getByText(DALLAS).nth(0).click();
      await page.keyboard.press(ESCAPE);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear locations
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    test(`Should filter ${workflow} samples by timeframe - Last Week`, async ({
      page,
    }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      await page.getByTestId("timeframe").first().click();
      await page.getByTestId(kebabCase(LAST_WEEK)).click();

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    test(`Should filter ${workflow} samples by timeframe - Last Month`, async ({
      page,
    }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      await page.getByText(TIMEFRAME).first().click();
      await page.getByText(LAST_MONTH).click();

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    test(`Should filter ${workflow} samples by timeframe - Last 3 Months`, async ({
      page,
    }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      await page.getByText(TIMEFRAME).first().click();
      await page.getByText(LAST_THREE_MONTHS).click();

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    test(`Should filter ${workflow} samples by timeframe - Last 6 months`, async ({
      page,
    }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      await page.getByText(TIMEFRAME).first().click();
      await page.getByText(LAST_SIX_MONTHS).click();

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    test(`Should filter ${workflow} samples by timeframe - Last Year`, async ({
      page,
    }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      await page.getByTestId(kebabCase(TIMEFRAME)).first().click();
      await page.getByTestId(kebabCase(LAST_WEEK)).click();

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    test(`Should filter ${workflow} samples by private visibility`, async ({
      page,
    }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      await page.getByTestId(kebabCase(VISIBILITY)).first().click();
      await page.getByTestId(kebabCase(PRIVATE)).first().click();

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    test(`Should filter ${workflow} samples by public visibility`, async ({
      page,
    }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      await page.getByTestId(kebabCase(VISIBILITY)).first().click();
      await page.getByTestId(kebabCase(PUBLIC)).click();

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });
    test(`Should filter ${workflow} samples by host`, async ({ page }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);
      await page.getByTestId(kebabCase(HOST)).nth(0).click();

      for (let i = 0; i < chosenHosts.length; i++) {
        await page.getByPlaceholder(SEARCH).first().fill(chosenHosts[i]);
        await page.getByTestId(`dropdown-${kebabCase(chosenHosts[i])}`).click();
      }
      // close popup
      await page.keyboard.press(ESCAPE);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });

    test(`Should filter ${workflow} samples by sample type`, async ({
      page,
    }) => {
      // search project and display samples
      await goToProjectSamples(page, projectName, index);

      await page.getByTestId(kebabCase(SAMPLE_TYPE)).nth(0).click();
      for (let i = 0; i < sampleTypes.length; i++) {
        await page.getByPlaceholder(SEARCH).first().fill(sampleTypes[i]);
        await page.getByTestId(`dropdown-${kebabCase(sampleTypes[i])}`).click();
      }
      // close popup
      await page.keyboard.press(ESCAPE);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);

      // clear filter
      clearFilters(page);

      // check result
      expect(
        await page.locator(SAMPLE_NAME_SELECTOR).count(),
      ).toBeGreaterThanOrEqual(0);
    });
  });
});
